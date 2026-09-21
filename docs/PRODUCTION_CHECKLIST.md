# AITH Production Checklist

Operational go-live list. Mark items only when verified in the target environment.

**Last verification:** 21 September 2026 (code pass — direct forms + www canonical + Postgres hardening)  
**Launch state:** **DEPLOYMENT BLOCKED** (API host + Vercel rewrite target not yet live-verified)

**Status ladder:** `LOCAL DEV READY` → `STAGING VERIFIED` → `SOFT LAUNCH READY` → `PRODUCTION LIVE` / `DEPLOYMENT BLOCKED`

## DOMAIN

- [x] Canonical locked: **`https://www.aithworld.com`** (`frontend/src/config/site.js`, backend default `SITE_ORIGIN`, sitemap/robots/index.html)
- [x] HTTPS valid on **www.aithworld.com** (Vercel TLS + HSTS) — re-verify after each deploy
- [ ] DNS re-confirmed: www resolves; apex `aithworld.com` → 301/308 to www
- [ ] `aithinternational.com` intentionally **not** used in production configs

## FRONTEND

- [ ] Production build deployed from **current** tree (includes direct forms + www canonical)
- [ ] `frontend/vercel.json`: `REPLACE_WITH_API_HOST` replaced with real FastAPI host
- [ ] Same-origin `/api` rewrite works (`/api/health` → JSON, not SPA HTML)
- [ ] `/blog-sitemap.xml` rewrite → API
- [ ] SPA fallback does not swallow `/api/*`
- [ ] `REACT_APP_API_URL` empty (preferred with rewrite) or absolute API origin
- [ ] `REACT_APP_SHOW_LEGAL_DRAFT` remains true until counsel approval
- [x] Sitemap / robots / OG use `https://www.aithworld.com` (code)
- [x] Favicon / webmanifest / OG image paths present

## BACKEND

- [ ] FastAPI deployed to a public long-lived host (Railway / Render / Fly / VPS)
- [ ] `DATABASE_URL` = Supabase **Session pooler** URI (+ SSL)
- [ ] One-time RLS applied: `backend/sql/migrations/20260921_enable_rls.sql`
- [ ] `CORS_ORIGINS=https://www.aithworld.com,https://aithworld.com` (not `*`)
- [ ] `APP_ENV=production`, `ADMIN_SESSION_SECRET` ≥32, `ADMIN_COOKIE_SECURE=true`, `SITE_ORIGIN=https://www.aithworld.com`
- [ ] Healthcheck: `GET https://<API_HOST>/api/health` → JSON `database: true`
- [ ] Healthcheck via www: `GET https://www.aithworld.com/api/health` → same JSON
- [ ] Pool caps understood (`DATABASE_POOL_MAX` default 5)
- [ ] Rate limit understood (in-memory 8/IP/60s; add proxy limits for multi-instance)
- [ ] Application logs reachable

## FORMS (direct persist — no mailto submit)

- [ ] Contact → Postgres row + Admin → Enquiries
- [ ] Quote → Postgres row + Admin → Quotes
- [ ] Careers → Postgres row + Admin → Careers
- [ ] API down / 5xx → **error UI only** (no mail client auto-open)
- [ ] 429 mapped to rate-limit message
- [ ] Passive footer/contact `mailto:` links still work as contact info only

## EMAIL / MONITORING

- [ ] SMTP configured **or** named Admin monitoring owner + cadence in `PRODUCTION_RUNBOOK.md` §5
- [ ] SMTP failure after Postgres success still returns user success (`notificationStatus=failed`)

## LEGAL

- [ ] Privacy approved by counsel **or** explicit soft-launch acceptance recorded
- [ ] Terms approved by counsel **or** explicit soft-launch acceptance recorded
- [ ] Analytics / cookie consent decision recorded

## SEO

- [ ] Search Console property verified for **www.aithworld.com**
- [ ] Sitemap submitted only after locs use www and routes 200
- [ ] Spot-check canonicals / OG against www

## ANALYTICS

- [ ] Initial landing = 1 pageview
- [ ] SPA navigations increment without duplicates
- [ ] Session recording remains disabled

## QA

- [ ] Homepage loads on www (brand + hero)
- [ ] Desktop + mobile smoke after redeploy
- [ ] Contact / Quote / Careers happy path against **production** API
- [ ] 404 / invalid routes; SEO service routes not 404
- [ ] Keyboard + `prefers-reduced-motion`

## ADMIN CMS / BLOGS

- [ ] **New** production admin created (`scripts/create_admin.py`) — not `admin@aith.local`
- [ ] Any prod copy of leaked local admin rotated/disabled
- [ ] Blogs seeded/published if needed (`scripts/seed_blogs.py`)
- [ ] Public blogs: published only; draft slug 404
- [ ] `/blog-sitemap.xml` → 200 XML
- [ ] Unauthenticated `GET /api/admin/blogs` → 401
- [ ] Admin login/logout/CMS via same-origin rewrite (cookies)
- [ ] `/admin` `noindex`; absent from sitemap
- [ ] Editors cannot open Enquiries / Quotes / Careers / Jobs PII
- [ ] Ops docs current: runbook, checklist, go-live report

## OPS CONSOLE / CAREERS CMS

- [ ] `job_postings` (+ `ops_activity` / `ops_notes` / `ops_messages`) schema applied
- [ ] RLS migration applied and verified (`relrowsecurity = true` for CMS tables incl. `job_postings`)
- [ ] Production `ADMIN_SESSION_SECRET` set from environment (≥32 chars; no file fallback)
- [ ] Public jobs API works (`GET /api/careers/jobs`)
- [ ] Job publish → appears on `/careers` and `/careers/:slug`
- [ ] Job apply with `jobId` → application row linked to job
- [ ] Admin application detail: assign, notes, timeline, status
- [ ] Enquiry/quote/application assignment works (admin assignees only)
- [ ] CSV export for enquiries, quotes, career applications
- [ ] Bulk status/archive requires confirm for archive
- [ ] PII blocked for editor (403 on ops + jobs)
- [ ] Reply delivery configured **or** UI clearly shows email not configured
- [ ] Closed/expired roles show “no longer accepting applications” (archived page, not silent remove)

## EXIT CRITERIA

| Label | When |
|-------|------|
| LOCAL DEV READY | Local API + Postgres + forms + admin work |
| STAGING VERIFIED | Staging host passes health + forms + admin gates |
| SOFT LAUNCH READY | Production stack passes P0 gates; legal waiver OK |
| PRODUCTION LIVE | Owner signs off after soft launch soak |
| DEPLOYMENT BLOCKED | Any P0 gate fails |
