# AITH — Go-Live Verification Report

**Verification date:** 17 September 2026 (updated after code-hardening pass)  
**Repo:** AITH (local working tree includes admin/CMS security hardening beyond prior shipped commits)  
**Launch state (exact):**

# DEPLOYMENT BLOCKED

Production host / API / canonical DNS were **not verified** as a complete, consistent stack in this environment. Code hardening is **PASS** locally; live go-live remains **BLOCKED**.

Do **not** claim **PRODUCTION LIVE**.

---

## Verdict summary

| State | Status |
|-------|--------|
| CODE HARDENED | **Yes** (local engineering — see § Hardening matrix) |
| CODE READY (product features) | **Yes** (local) |
| STAGING VERIFIED | **No** |
| SOFT LAUNCH READY | **No** |
| PRODUCTION LIVE | **No** — **DEPLOYMENT BLOCKED** |

---

## P0 release gates (evidence style)

| Gate | Result | Evidence / notes |
|------|--------|------------------|
| Canonical DNS matches `SITE_ORIGIN` | **FAIL** | Code default / config: `https://aithinternational.com` — previously **NXDOMAIN**. Live serve observed: `https://www.aithworld.com`. Owner must pick one strategy. |
| Frontend production deploy = current tree | **FAIL** | Prior probe: live Vercel bundle stale vs local (SEO routes 404; footer TBD; analytics flags diverge). Re-verify after redeploy. |
| Backend public API deployed | **FAIL** | Prior probe: `GET https://www.aithworld.com/api/health` → SPA HTML, not FastAPI JSON. No verified production API host in-repo. |
| `GET /api/health` on production | **FAIL** | Not available on live frontend origin; local-only health previously **PASS**. |
| Production `MONGO_URL` + `DB_NAME` | **BLOCKED** | Unverified — no production API to attach. |
| Production `CORS_ORIGINS` explicit (no `*`) | **BLOCKED** | Code enforces at startup when `APP_ENV=production` (**PASS** code). Live env **not verified**. |
| `ADMIN_SESSION_SECRET` ≥32 + no ephemeral secret in prod | **PASS** (code) / **BLOCKED** (live) | Startup fatals in production if missing/short. Live secret unset/unverified. |
| `ADMIN_COOKIE_SECURE=true` in prod | **PASS** (code) / **BLOCKED** (live) | Required when `APP_ENV=production`. |
| `APP_ENV=production` on real API | **BLOCKED** | Not verified on a deployed host. |
| Contact + Quote durable on production | **FAIL** | Live forms previously fell through to non-API / mailto path. Local Mongo path **PASS**. |
| SMTP **or** named Mongo-only monitoring owner | **FAIL** | Owner name/cadence not recorded. Code path for `notificationStatus=failed` **PASS**. |
| Blog sitemap proxy `/blog-sitemap.xml` → API | **BLOCKED** | Template: `frontend/vercel.json.example`. Not verified on live host. |
| Legal Privacy/Terms approved **or** written soft-launch waiver | **BLOCKED** | Still **draft**; pending owner/counsel. |
| Admin provisioned on production Mongo | **BLOCKED** | Scripts ready (`create_admin.py`); production DB unreachable. |
| Secrets not in public frontend bundle | **PASS** (prior live probe) | No `MONGO_URL`/SMTP in JS. Re-check after each deploy. |
| HTTPS on serving host | **PASS** (prior) | `www.aithworld.com` Vercel TLS + HSTS. Re-verify after canonical cutover. |

---

## What was hardened in code (vs owner/infra)

### Code — treat as PASS (local / tests)

| Item | Status |
|------|--------|
| Production startup fails without `ADMIN_SESSION_SECRET` (≥32), `ADMIN_COOKIE_SECURE`, explicit CORS when `APP_ENV=production` | **PASS** |
| No ephemeral session secret in production | **PASS** |
| `mustChangePassword` + `scripts/mark_legacy_passwords.py` | **PASS** |
| Admin change-password gate before other CMS routes | **PASS** |
| MFA architecture `ADMIN_MFA_ENABLED` (default off, pyotp) | **PASS** (feature flag) |
| Request ID middleware `X-Request-ID` | **PASS** |
| Security headers on API | **PASS** |
| Session TTL index via `expiresAtDate` | **PASS** |
| Editors blocked from enquiries/quotes/careers PII | **PASS** |
| Blog sitemap excludes `seo.index=false` | **PASS** |
| HTTP 301 on `/api/blog-redirects/{slug}` | **PASS** |
| Recovery scripts: create / reset / disable admin | **PASS** |
| Audit filters expanded; audit avoids secret fields | **PASS** |
| Test isolation unique DB per worker; expanded security tests | **PASS** |
| `MediaProvider` `url_only` abstraction | **PASS** |
| `SafeImage` scheme validation | **PASS** |
| Canonical override wired on `BlogPost` | **PASS** |
| Analytics deferred scripts skip `/admin` | **PASS** |
| `vercel.json.example` for `/api` + blog-sitemap proxy | **PASS** (template only) |

### Owner / infrastructure — still BLOCKED or FAIL

| Item | Status |
|------|--------|
| Choose + implement canonical DNS | **FAIL** / owner |
| Deploy FastAPI + production Mongo | **FAIL** / owner |
| Wire Vercel rewrites or `REACT_APP_API_URL` | **BLOCKED** |
| Set production secrets and `APP_ENV=production` | **BLOCKED** |
| Redeploy current frontend to Vercel | **FAIL** (stale at last probe) |
| SMTP or Mongo monitoring owner | **FAIL** |
| Mongo backup owner + restore drill | **NOT APPLICABLE** until cluster exists — then **BLOCKED** until named |
| Counsel Privacy/Terms or waiver | **BLOCKED** |
| Search Console on canonical host | **BLOCKED** (do not submit dead-host sitemap) |
| Live MFA enrollment ops | **NOT APPLICABLE** until flag on + API live |

---

## Deployment URL (last observed)

| Role | URL | Status |
|------|-----|--------|
| Live frontend | https://www.aithworld.com | Up (Vercel) — **stale vs hardened tree at last check** |
| Apex | https://aithworld.com | 308 → www (prior) |
| Configured canonical | https://aithinternational.com | **DNS NXDOMAIN** (prior) |
| Backend / API | *(none verified)* | **Not deployed** on www `/api` |

---

## Ops documents added this pass

| Doc | Purpose |
|-----|---------|
| `docs/PRODUCTION_RUNBOOK.md` | Deploy, env, health, admin scripts, secret rotation, incidents |
| `docs/ROLLBACK_PLAN.md` | FE/BE/env/DB/blog rollback; when not to mark live |
| `docs/PRODUCTION_CHECKLIST.md` | Checkbox list (still largely unchecked for production) |

---

## Owner action sequence (minimum to exit BLOCKED)

1. Decide canonical host; align DNS + `SITE_ORIGIN` + sitemap/robots + frontend config.  
2. Deploy FastAPI with production env (`MONGO_URL`, `DB_NAME`, explicit `CORS_ORIGINS`, `ADMIN_SESSION_SECRET` ≥32, `ADMIN_COOKIE_SECURE=true`, `APP_ENV=production`, `SITE_ORIGIN`).  
3. Apply `vercel.json` (from example) or set `REACT_APP_API_URL`; redeploy **current** frontend.  
4. Create admin; optionally seed blogs; proxy `/blog-sitemap.xml`.  
5. SMTP **or** document Mongo-only monitoring owner + cadence.  
6. Counsel approve Privacy/Terms **or** written soft-launch acceptance.  
7. Re-run this report’s P0 table against **production** evidence only.  

Until then launch state remains:

**DEPLOYMENT BLOCKED**
