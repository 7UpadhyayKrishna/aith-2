# AITH — Go-Live Verification Report

**Verification date:** 21 September 2026  
**Repo:** AITH (direct forms, www canonical, Supabase Postgres hardening, Vercel rewrite template)  
**Launch state (exact):**

# DEPLOYMENT BLOCKED

Code and docs for soft launch are in place. Production FastAPI host, Vercel `REPLACE_WITH_API_HOST`, and live smoke evidence are **not** completed in this environment. Do **not** claim **PRODUCTION LIVE**.

**Status ladder:** `LOCAL DEV READY` → `STAGING VERIFIED` → `SOFT LAUNCH READY` → `PRODUCTION LIVE` / `DEPLOYMENT BLOCKED`

---

## Verdict summary

| State | Status |
|-------|--------|
| LOCAL DEV READY | **Yes** (forms direct + Postgres schema path + admin scripts) |
| CODE HARDENED (this pass) | **Yes** |
| STAGING VERIFIED | **No** |
| SOFT LAUNCH READY | **No** |
| PRODUCTION LIVE | **No** — **DEPLOYMENT BLOCKED** |

---

## P0 release gates

| Gate | Result | Evidence / notes |
|------|--------|------------------|
| Canonical = `https://www.aithworld.com` | **PASS** (code) | `site.js`, backend `SITE_ORIGIN` default, `public/sitemap.xml`, `robots.txt`, `index.html` |
| Apex → www | **PASS** (prior) / re-verify | Owner confirms DNS after cutover |
| Frontend deploy = current tree | **BLOCKED** | Redeploy required after this pass |
| `frontend/vercel.json` API host set | **BLOCKED** | File present; still `REPLACE_WITH_API_HOST` until owner fills real host |
| Backend public FastAPI deployed | **BLOCKED** | No verified production API URL in-repo |
| `GET www…/api/health` → JSON `database: true` | **BLOCKED** | Must not return SPA HTML |
| `DATABASE_URL` Session pooler + SSL | **PASS** (code) / **BLOCKED** (live) | Pooler rewrite, SSL policy, pool caps in `pg_store.py` |
| `CORS_ORIGINS` explicit | **PASS** (code) / **BLOCKED** (live) | Enforced at production startup |
| `ADMIN_SESSION_SECRET` ≥32 + `ADMIN_COOKIE_SECURE=true` | **PASS** (code) / **BLOCKED** (live) | |
| Contact / Quote / Careers durable persist | **PASS** (code) | Success only on API `ok: true`; no mailto submit fallback |
| API failure → error UI only (no mailto) | **PASS** (code) | `forms.js` + Contact / RequestQuote / Careers |
| SMTP **or** named Admin monitoring owner | **BLOCKED** | Name owner in runbook §5 |
| Blog sitemap proxy | **BLOCKED** (live) | Rewrite in `vercel.json`; needs API host |
| Legal draft / waiver | **BLOCKED** | Draft banner remains until counsel |
| Fresh production admin (not `admin@aith.local`) | **BLOCKED** | Create after API live via `create_admin.py` |
| Secrets not in frontend bundle | **PASS** (design) | Re-check after each deploy |
| HTTPS on www | **PASS** (prior) | Re-verify after redeploy |

---

## What changed this pass (code)

| Item | Status |
|------|--------|
| Direct forms: typed errors; no mailto submit fallback | **PASS** |
| Canonical www across FE/BE/public SEO files | **PASS** |
| `frontend/vercel.json` (+ example) rewrites `/api`, blog-sitemap, SPA fallback | **PASS** (template host placeholder) |
| Postgres: pooler preference, prod SSL policy, pool caps, idempotent startup schema only | **PASS** |
| RLS moved to one-time migration file | **PASS** |
| Docs de-Mongo → Supabase Postgres + status ladder + forms gates | **PASS** |

---

## Deployment URL (last known)

| Role | URL | Status |
|------|-----|--------|
| Canonical frontend | https://www.aithworld.com | Vercel (redeploy pending for this tree) |
| Apex | https://aithworld.com | Expect 308 → www |
| Backend / API | *(owner: set REPLACE_WITH_API_HOST)* | **Not verified** |

---

## Owner action sequence (exit BLOCKED)

1. Confirm DNS www + apex redirect.  
2. Deploy FastAPI with production env (`DATABASE_URL` pooler, `SITE_ORIGIN=https://www.aithworld.com`, `CORS_ORIGINS`, `ADMIN_SESSION_SECRET`, `ADMIN_COOKIE_SECURE=true`, `APP_ENV=production`).  
3. Apply `sql/migrations/20260921_enable_rls.sql` once if needed.  
4. Verify `GET https://<API_HOST>/api/health` → `database: true`.  
5. Set `REPLACE_WITH_API_HOST` in `frontend/vercel.json`; redeploy frontend.  
6. Verify `https://www.aithworld.com/api/health` is JSON.  
7. Create **new** production admin; disable any leaked local admin copy.  
8. Smoke Contact / Quote / Careers (no mailto); blogs + `/blog-sitemap.xml`.  
9. Name Admin monitoring owner **or** finish SMTP.  
10. Legal waiver or counsel approval.  
11. Update this report with evidence URLs; only then consider **SOFT LAUNCH READY**.

## Deploy-verify evidence (21 September 2026)

| Check | Result |
|-------|--------|
| Local `GET /api/health` | **PASS** — `{"status":"ok","database":true,…}` |
| Local `POST /api/contact` | **PASS** — `ok:true`, id persisted |
| Local `POST /api/quote` | **PASS** — `ok:true`, reference `AITH-SMOKE1` |
| RLS migration on Supabase | **PASS** — `20260921_enable_rls.sql` applied (incl. `admin_users`) |
| Live `GET https://www.aithworld.com/api/health` | **FAIL** — SPA HTML (FastAPI not wired on Vercel yet) |
| Railway / Vercel / Render CLI | **Absent** in this environment — cannot deploy API or set rewrite host without owner credentials |
| Production admin create | **BLOCKED** — wait until production API host exists; do not reuse `admin@aith.local` |

**Agent-completable deploy steps:** done (code + local smoke + RLS).  
**Owner-required:** provision FastAPI host → fill `REPLACE_WITH_API_HOST` → redeploy Vercel → create fresh prod admin → re-run P0 table.

Until owner completes those steps, launch state remains **DEPLOYMENT BLOCKED**.

---

## Ops console / careers readiness (this pass)

| Area | Status | Notes |
|------|--------|-------|
| Ops workflow (status / filters / bulk) | **READY** (code) | Enquiries, quotes, applications |
| Assignments | **READY** (code) | Admin-only assignees; audited |
| Activity timeline | **READY** (code) | Append-only `ops_activity` |
| Internal notes | **READY** (code) | Append-only `ops_notes` |
| Reply workflow | **PARTIAL** | Backend send + copy fallback; needs SMTP configured in prod |
| Jobs CMS | **READY** (code) | Richer fields, publish/unpublish, delete rules |
| Public jobs + `/careers/:slug` | **READY** (code) | Archived-style closed pages |
| Applications ↔ jobId | **READY** (code) | Rejects unpublished / invalid job |
| CSV parity | **READY** (code) | Enquiries, quotes, careers |
| Dashboard careers/ops | **READY** (code) | Compact metrics + filtered links |
| Authorization (PII admin-only) | **READY** (code) | Editor 403 on ops + jobs |
| Production session secret | **READY** (code) | Fail-closed in production |
| RLS verified live | **PARTIAL** | Migration file updated; re-verify on target DB after schema apply |
| Dedicated jobs/careers tests | **READY** (code) | `backend/tests/test_jobs_careers.py` |
| Docs | **READY** | Guide, runbook, checklist updated |
| Remaining blockers | **BLOCKED** | Public API host + Vercel rewrite still required for soft launch |
