# AITH — Production Runbook

Operational procedures for the **hardened codebase**. This document does **not** claim production is live. Deploy targets must be verified by the owner before treating any step as complete.

**Related:** `PRODUCTION_CHECKLIST.md`, `ROLLBACK_PLAN.md`, `GO_LIVE_REPORT.md`, `ADMIN_CMS_GUIDE.md`

---

## 1. Architecture (as shipped)

| Layer | Stack | Typical host |
|-------|--------|----------------|
| Frontend | React SPA (CRA/CRACO) | **Vercel** static build |
| Backend | FastAPI + Motor/MongoDB | Owner-chosen (Railway / Render / Fly / VPS / etc.) — **not assumed deployed** |
| Data | MongoDB | Atlas or equivalent — **owner-managed** |

Same-origin `/api` is preferred via Vercel rewrites (see `frontend/vercel.json.example`). Otherwise set `REACT_APP_API_URL` to the public API origin at build time.

---

## 2. Deployment

### Frontend (Vercel)

1. Confirm canonical host decision (`SITE_ORIGIN` in backend + `frontend/src/config/site.js` / sitemap / robots agree with DNS).
2. Copy `frontend/vercel.json.example` → `vercel.json` and replace `REPLACE_WITH_API_HOST` with the real API base (no trailing slash path issues).
3. Set frontend env (dashboard or build):
   - `REACT_APP_API_URL` — empty only if `/api` is rewritten same-origin; otherwise absolute API origin
   - `REACT_APP_SHOW_LEGAL_DRAFT=true` until counsel approval
4. `cd frontend && npm ci && npm run build`
5. Deploy the build to Vercel; smoke `/`, `/contact`, `/blogs`, an SEO service route, `/admin` (`noindex`).

### Backend (FastAPI)

1. Install deps from `backend/requirements.txt` (includes `pyotp` for optional MFA).
2. Set production env (table below). **`APP_ENV=production` refuses to start** without required secrets/CORS/cookie flags.
3. Run with a process manager or platform start command, e.g. `uvicorn server:app --host 0.0.0.0 --port $PORT` from `backend/`.
4. Confirm `GET /api/health` returns JSON (not SPA HTML).
5. Ensure the frontend rewrite / `REACT_APP_API_URL` points at this instance.

There is **no** checked-in Dockerfile or IaC for a specific cloud — choose and document the host yourself.

---

## 3. Required environment variables

Copy from `backend/.env.example`. Never commit real secrets.

| Variable | Production requirement |
|----------|------------------------|
| `MONGO_URL` | Required |
| `DB_NAME` | Required |
| `CORS_ORIGINS` | **Explicit** comma-separated origins (e.g. `https://www.example.com,https://example.com`). **No `*`** when `APP_ENV=production` |
| `ADMIN_SESSION_SECRET` | Cryptographically random, **≥32 characters**. No ephemeral fallback in production |
| `ADMIN_COOKIE_SECURE` | **`true`** in production (HTTPS) |
| `SITE_ORIGIN` | Public canonical origin used in blog sitemap / redirects / System hints (must match real DNS) |
| `APP_ENV` | **`production`** (also accepts `prod` / `live`) |

### Optional / recommended

| Variable | Notes |
|----------|--------|
| SMTP stack | `OPS_NOTIFICATION_EMAIL`, `SMTP_HOST`, `SMTP_FROM` (+ port/user/pass/TLS). Incomplete set → startup **WARNING**, notify-disabled behaviour |
| `ADMIN_MFA_ENABLED` | `true` to enable TOTP (pyotp). **Off by default** |
| `ADMIN_MFA_REQUIRED` | Require MFA for admin role when MFA is enabled |
| `MEDIA_PROVIDER` | Default `url_only` (no ephemeral disk uploads) |
| `APP_VERSION` / `GIT_SHA` | Surfaced on health / Admin → System |

### Frontend

| Variable | Notes |
|----------|--------|
| `REACT_APP_API_URL` | Public API origin if not same-origin proxied |
| `REACT_APP_SHOW_LEGAL_DRAFT` | Keep `true` until Privacy/Terms approved |

---

## 4. Healthcheck

```http
GET /api/health
```

Expect JSON roughly: `status: ok`, `database: true|false`, `notifications: enabled|disabled|…`. Payload must **not** include secrets.

**Production gate:** response must be FastAPI JSON. If the path returns SPA `index.html`, the API is not wired.

---

## 5. Blog sitemap proxy

API serves: `GET /api/blog-sitemap.xml` (published posts only; excludes `seo.index=false`).

Public URL should be: `https://<canonical>/blog-sitemap.xml`

Use the rewrite in `frontend/vercel.json.example`:

```json
{ "source": "/blog-sitemap.xml", "destination": "https://REPLACE_WITH_API_HOST/api/blog-sitemap.xml" }
```

Optional: also rewrite `/api/(.*)` to the API host for same-origin forms and admin.

Slug remaps: `GET /api/blog-redirects/{slug}` returns **HTTP 301** to the canonical `/blogs/{toSlug}` URL.

---

## 6. Admin account lifecycle

Run from `backend/` with `MONGO_URL` + `DB_NAME` loaded (`.env` or shell).

### Create admin

```bash
python scripts/create_admin.py
```

Prompts for email, display name, role (`admin`|`editor`), password (policy: default **15–128** chars, Argon2id).

### Reset password

```bash
python scripts/reset_admin_password.py
```

Rehashes password, clears `mustChangePassword`, bumps policy version, **revokes all sessions** for that user.

### Disable admin

```bash
python scripts/disable_admin.py
```

Requires typing `DISABLE` to confirm. Sets `active=false`, deletes sessions, writes audit `ADMIN_DISABLED_CLI`.

### Legacy password flag

```bash
python scripts/mark_legacy_passwords.py            # dry-run
python scripts/mark_legacy_passwords.py --apply    # set mustChangePassword=true
python scripts/mark_legacy_passwords.py --email user@example.com --apply
```

Does **not** inspect Argon2 hashes. Next login forces `/admin/change-password` before other CMS routes.

### Seed blogs (optional)

```bash
python scripts/seed_blogs.py
```

---

## 7. Session secret rotation

1. Generate a new secret (≥32 random bytes as hex/base64), e.g. `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
2. Update `ADMIN_SESSION_SECRET` on the **production** backend env.
3. Restart / redeploy the API process so all workers load the new value.
4. **Effect:** all admin session cookies become invalid; every user must log in again.
5. Confirm `GET /api/health` and a fresh admin login.
6. Record rotation time in the ops log (no secret values in tickets).

Do **not** rotate casually during an incident unless compromise is suspected — it locks out all editors immediately.

---

## 8. Failed SMTP notifications

Order of operations on Contact / Quote (and similar):

1. Validate → rate limit → honeypot  
2. **Mongo insert** (source of truth)  
3. Best-effort SMTP notify  
4. Patch `notificationStatus` to `sent` | `failed` | `disabled`

SMTP failure **does not** roll back Mongo. API still returns success to the user when the document was stored. Monitor:

- Collections: `contact_submissions`, `quote_submissions`, `career_submissions`
- Field: `notificationStatus` ∈ `pending|sent|failed|disabled`
- Filter failed/disabled older than your SLA; process manually

If SMTP is intentionally off, name a **Mongo-only monitoring owner** and cadence (required for ops-ready).

---

## 9. Backup ownership (placeholders)

| Asset | Owner | Cadence | Notes |
|-------|-------|---------|--------|
| Production Mongo (Atlas/host) | *[NAME]* | *[e.g. continuous + daily snapshots]* | Confirm PITR / restore drill |
| Blog JSON exports | *[NAME]* | *[before bulk edits]* | Admin export / seed JSON under `scripts/seed_data/` |
| Env secrets (Vercel + API host) | *[NAME]* | On change | Password manager / platform secrets — not git |
| Vercel deployments | *[NAME]* | Each release | Keep previous deployment for rollback |

Until owners are named, treat backup readiness as **incomplete**.

---

## 10. MFA (optional)

- Flag: `ADMIN_MFA_ENABLED=true` (uses **pyotp** TOTP).
- Default: **off** (safe for soft launch until enrollment is planned).
- Optional: `ADMIN_MFA_REQUIRED` for admin role.
- Enable only after documenting enrollment + recovery codes process for operators.

---

## 11. Incident checklist

1. **Scope:** frontend-only / API-only / Mongo / auth / forms / blogs?
2. Capture `X-Request-ID` from failing API responses and matching API logs.
3. Hit `GET /api/health` — database + notifications fields.
4. Check recent deploys (Vercel + API image/commit) — consider rollback (`ROLLBACK_PLAN.md`).
5. Forms: query Mongo for recent inserts and `notificationStatus=failed`.
6. Admin lockout: password reset / disable scripts; session secret rotation only if cookie theft suspected.
7. Do **not** claim “PRODUCTION LIVE” or clear Search Console alarms until P0 gates in `GO_LIVE_REPORT.md` pass.
8. After mitigation: note time, root cause, follow-up ticket; restore monitoring cadence.

---

## 12. Hardening behaviours operators should know

- Production startup **exits** if `ADMIN_SESSION_SECRET` &lt; 32, `ADMIN_COOKIE_SECURE` false, or CORS is wildcard.
- Editors are blocked from enquiries / quotes / careers **PII** routes (admin-only).
- Session TTL via Mongo index on `expiresAtDate`.
- API sets security headers + `X-Request-ID`.
- Media provider default `url_only`.
- Analytics scripts skip `/admin` (bootstrap + SPA pageviews).
