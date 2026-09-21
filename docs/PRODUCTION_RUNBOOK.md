# AITH — Production Runbook

Operational procedures for the **hardened codebase**. This document does **not** claim production is live. Deploy targets must be verified by the owner before treating any step as complete.

**Related:** `PRODUCTION_CHECKLIST.md`, `ROLLBACK_PLAN.md`, `GO_LIVE_REPORT.md`, `ADMIN_CMS_GUIDE.md`

**Status ladder:** `LOCAL DEV READY` → `STAGING VERIFIED` → `SOFT LAUNCH READY` → `PRODUCTION LIVE` / `DEPLOYMENT BLOCKED`

---

## 1. Architecture (as shipped)

| Layer | Stack | Typical host |
|-------|--------|----------------|
| Frontend | React SPA (CRA/CRACO) | **Vercel** (`https://www.aithworld.com`) |
| Backend | FastAPI + asyncpg / Postgres | Long-lived process (**Railway** default; Render/Fly/VPS OK) — **not** Vercel static |
| Data | Supabase Postgres (Session pooler + SSL) | `DATABASE_URL` |

```
Browser → Vercel SPA (www.aithworld.com)
            └─ rewrite /api/*  →  FastAPI host
                                    └─ Supabase Postgres
```

Same-origin `/api` via Vercel rewrites (`frontend/vercel.json`) keeps admin HttpOnly cookies simple. Do **not** put DB credentials in the browser.

**Canonical:** `https://www.aithworld.com` (apex `https://aithworld.com` → 301/308 to www). Leave `aithinternational.com` out of production until owned/redirected deliberately.

---

## 2. Deployment

### Frontend (Vercel)

1. Confirm DNS: www + apex→www; `SITE_ORIGIN` in backend + `frontend/src/config/site.js` + `public/sitemap.xml` / `robots.txt` / `index.html` all use `https://www.aithworld.com`.
2. Edit `frontend/vercel.json`: replace `REPLACE_WITH_API_HOST` with the real FastAPI hostname (no `https://` duplication — destination already includes scheme).
3. Set frontend env:
   - `REACT_APP_API_URL` — **empty** when `/api` is rewritten same-origin; otherwise absolute API origin
   - `REACT_APP_SHOW_LEGAL_DRAFT=true` until counsel approval
4. `cd frontend && npm ci && npm run build`
5. Deploy; smoke `/`, `/contact`, `/blogs`, `/admin` (`noindex`), and `https://www.aithworld.com/api/health` → **JSON** (not SPA HTML).

### Backend (FastAPI)

1. Install deps from `backend/requirements.txt`.
2. Set production env (table below). **`APP_ENV=production` refuses to start** without required secrets / CORS / secure cookies.
3. Prefer **Supabase Session pooler** URI (`*.pooler.supabase.com`) for IPv4 hosts (Railway/Render). Optional: set `DATABASE_POOLER_HOST` to rewrite `db.<ref>.supabase.co`.
4. Apply one-time RLS migration if not already applied: `backend/sql/migrations/20260921_enable_rls.sql` (Supabase SQL editor). Startup only runs idempotent `CREATE IF NOT EXISTS` from `schema.sql`.
5. Start: `uvicorn server:app --host 0.0.0.0 --port $PORT` from `backend/`.
6. Confirm `GET https://<API_HOST>/api/health` → JSON with `database: true`.

There is **no** checked-in Dockerfile — choose and document the host yourself.

---

## 3. Required environment variables

Copy from `backend/.env.example`. Never commit real secrets.

| Variable | Production requirement |
|----------|------------------------|
| `DATABASE_URL` | Required — Supabase **Session pooler** URI preferred |
| `CORS_ORIGINS` | `https://www.aithworld.com,https://aithworld.com` — **no `*`** |
| `ADMIN_SESSION_SECRET` | Cryptographically random, **≥32 characters**, from environment only. Production refuses to start if missing/short — **no** `.admin_session_secret` file fallback and **no** generated-on-boot secret. |
| `ADMIN_COOKIE_SECURE` | **`true`** |
| `SITE_ORIGIN` | `https://www.aithworld.com` |
| `APP_ENV` | **`production`** |

### Optional / recommended

| Variable | Notes |
|----------|--------|
| `DATABASE_POOLER_HOST` | Rewrites direct `db.<ref>` → Session pooler |
| `DATABASE_SSL` | `verify` preferred; `require` encrypts without CA verify; **`disable` forbidden in production** |
| `DATABASE_POOL_MIN` / `DATABASE_POOL_MAX` | Default 1 / 5; capped at 15 for Supabase budgets |
| SMTP stack | Optional if Admin monitoring owner is named (below). Required for in-admin **Reply** delivery. |
| `OPS_ENQUIRY_NEW_HOURS` / `OPS_QUOTE_UNASSIGNED_HOURS` / `OPS_CAREER_UNTOUCHED_DAYS` | Internal attention thresholds only — **not** contractual SLA |
| `ADMIN_MFA_ENABLED` | Default **off** for soft launch |
| `MEDIA_PROVIDER` | Default `url_only` |
| `APP_VERSION` / `GIT_SHA` | Surfaced on health / Admin → System |

### Frontend

| Variable | Notes |
|----------|--------|
| `REACT_APP_API_URL` | Empty if same-origin rewrite; else public API origin |
| `REACT_APP_SHOW_LEGAL_DRAFT` | Keep `true` until Privacy/Terms approved |

---

## 4. Healthcheck

```http
GET /api/health
```

Expect JSON: `status: ok`, `database: true|false`, `notifications: …`. No secrets in payload.

**Production gate:** `https://www.aithworld.com/api/health` must be FastAPI JSON. SPA `index.html` = API not wired → **DEPLOYMENT BLOCKED**.

---

## 5. Direct forms (no mailto submit)

Contact / Quote / Careers submit only via `POST /api/contact` and `POST /api/quote`.

- **Success** = HTTP 2xx and body `{ "ok": true }` (row in Postgres).
- **Failure** = on-site error UI (`network` / `server` / `rate_limit` / `validation`). Never auto-open mailto / Gmail / Outlook.
- Passive `mailto:` links in footer / contact cards remain OK as contact info only.

### SMTP optional — Admin monitoring owner

If SMTP is unset, enquiries still persist. Name an owner who monitors **Admin → Enquiries / Quotes / Careers**:

| Role | Name | Cadence |
|------|------|---------|
| Form / enquiry monitor | *[NAME]* | *[e.g. twice daily]* |

Until named, treat notification ops as incomplete for **SOFT LAUNCH READY**.

---

## 6. Blog sitemap proxy

API: `GET /api/blog-sitemap.xml` (published only; excludes `seo.index=false`).

Public: `https://www.aithworld.com/blog-sitemap.xml` via `frontend/vercel.json` rewrite.

Slug remaps: `GET /api/blog-redirects/{slug}` → **HTTP 301**.

---

## 7. Admin account lifecycle

Run from `backend/` with `DATABASE_URL` loaded (`.env` or shell). **Never** reuse `admin@aith.local` / chat-exposed passphrases on production. Create a **new** production admin after API is live; share credentials out-of-band.

### Create admin

```bash
python scripts/create_admin.py
```

### Reset password

```bash
python scripts/reset_admin_password.py
```

### Disable admin

```bash
python scripts/disable_admin.py
```

### Legacy password flag

```bash
python scripts/mark_legacy_passwords.py --apply
```

### Seed blogs (optional, idempotent)

```bash
python scripts/seed_blogs.py
```

---

## 8. Session secret rotation

1. Generate ≥32 random secret: `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
2. Update `ADMIN_SESSION_SECRET` on the production API host; restart.
3. All admin sessions invalidate; users re-login.
4. Confirm `/api/health` + fresh admin login.
5. Log rotation time (never the secret value).

---

## 9. Failed SMTP notifications

Order on Contact / Quote / Careers:

1. Validate → rate limit → honeypot
2. **Postgres insert** (source of truth)
3. Best-effort SMTP notify
4. Patch `notificationStatus` to `sent` | `failed` | `disabled`

SMTP failure does **not** roll back Postgres. API still returns success when the row was stored. Monitor Admin CMS + `notificationStatus`.

Admin **Reply** on a record also uses SMTP. If not configured, the UI must show “Email delivery is not configured” and allow copy — do not silently open mailto as the primary path.

---

## 9b. Careers / jobs CMS

- **Source of truth:** `job_postings` in Postgres after CMS adoption.
- **Public:** `GET /api/careers/jobs`, `GET /api/careers/jobs/{slug}`, page `/careers/:slug`.
- **Closed roles:** archived-style public page with `acceptingApplications: false` (not 404). Drafts remain 404.
- **seed-defaults:** one-time helper only — never treat as ongoing sync from `frontend/src/data/careers.js`.
- **RLS verify:**

```sql
SELECT c.relname, c.relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'job_postings','contact_submissions','quote_submissions','career_submissions',
    'ops_activity','ops_notes','ops_messages'
  );
```

Expect `relrowsecurity = true` after applying `backend/sql/migrations/20260921_enable_rls.sql`.

---

## 10. Backup ownership (placeholders)

| Asset | Owner | Cadence | Notes |
|-------|-------|---------|--------|
| Supabase Postgres | *[NAME]* | *[PITR / daily]* | Confirm restore drill |
| Blog JSON exports | *[NAME]* | Before bulk edits | Admin export / `scripts/seed_data/` |
| Env secrets (Vercel + API host) | *[NAME]* | On change | Password manager — not git |
| Vercel deployments | *[NAME]* | Each release | Keep previous for rollback |

---

## 11. MFA (optional)

- `ADMIN_MFA_ENABLED=true` (pyotp TOTP). Default **off**.
- Enable only after enrollment + recovery process is documented.

---

## 12. Incident checklist

1. Scope: frontend / API / Postgres / auth / forms / blogs?
2. Capture `X-Request-ID` + API logs.
3. `GET /api/health` — `database` + `notifications`.
4. Recent deploys — consider `ROLLBACK_PLAN.md`.
5. Forms: Admin enquiries + Postgres rows; confirm no mailto submit path.
6. Admin lockout: reset/disable scripts; rotate session secret only if cookie theft suspected.
7. Do **not** claim **PRODUCTION LIVE** until P0 gates in `GO_LIVE_REPORT.md` pass.

---

## 13. Hardening behaviours operators should know

- Production startup **exits** if `ADMIN_SESSION_SECRET` &lt; 32, `ADMIN_COOKIE_SECURE` false, or CORS is wildcard.
- Production refuses `DATABASE_SSL=disable`.
- Startup schema: **idempotent CREATE IF NOT EXISTS only**; destructive DDL forbidden (`backend/sql/migrations/` for ALTER/RLS).
- Editors blocked from enquiries / quotes / careers **PII** (admin-only).
- Pool size capped (`DATABASE_POOL_MAX`, default 5).
- Media default `url_only`.
- Analytics scripts skip `/admin`.
