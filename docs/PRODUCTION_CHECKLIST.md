# AITH Production Checklist

Operational go-live list. Mark items only when verified in the target environment.

**Last verification:** 17 September 2026 → see `docs/GO_LIVE_REPORT.md`  
**Launch state:** **DEPLOYMENT BLOCKED**

## DOMAIN

- [ ] DNS configured for **canonical** host (today: `aithinternational.com` = NXDOMAIN; live serve = `www.aithworld.com`)
- [x] HTTPS valid on **www.aithworld.com** (Vercel TLS + HSTS)
- [ ] Canonical host correct (`SITE_ORIGIN` matches what users and crawlers actually hit)
- [x] www / non-www redirect consistent on **aithworld.com** (apex → www); **re-verify** after canonical decision

## FRONTEND

- [ ] Production build deployed from **current** CODE READY tree (live `main.fb402376.js` is stale)
- [ ] `REACT_APP_API_URL` configured (or same-origin `/api` proxy to real FastAPI)
- [ ] `REACT_APP_SHOW_LEGAL_DRAFT` remains true until counsel approval (`false` only after approval)
- [x] Sitemap file accessible on live host (`/sitemap.xml` 200) — **locs still wrong host**
- [x] Robots accessible (`/robots.txt` 200) — **Sitemap: URL still wrong host**
- [x] Favicon / webmanifest (200 on www)
- [x] OG image loads on **www** (`/brand/og-image.jpg` ~59KB) — meta tags still point at dead canonical host

## BACKEND

- [ ] FastAPI deployed to a public host
- [ ] `MONGO_URL` + `DB_NAME` configured on **production**
- [ ] `CORS_ORIGINS` set to explicit production origins (not `*`)
- [ ] Healthcheck: `GET /api/health` returns JSON `status: ok` and `database: true` on **production**
- [ ] Rate limit understood (in-memory 8/IP/60s; add proxy limits for multi-instance)
- [ ] Application logs reachable on production host
- [ ] Startup SMTP warning reviewed if notifications incomplete

## EMAIL

- [ ] SMTP configured **or** Mongo-only monitoring owner named in writing
- [ ] Test Contact enquiry → Mongo row + ops email (or documented Mongo-only path)
- [ ] Test Quote request → Mongo row + ops email (or documented Mongo-only path)
- [ ] SMTP failure after Mongo success still returns user success (verify logs show `notify=failed`)

## LEGAL

- [ ] Privacy approved by counsel **or** explicit soft-launch acceptance recorded
- [ ] Terms approved by counsel **or** explicit soft-launch acceptance recorded
- [ ] Analytics / cookie consent decision recorded

## SEO

- [ ] Search Console property verified for **canonical** host
- [ ] Sitemap submitted (only after locs use canonical host and routes 200 in SPA)
- [ ] Spot-check canonicals against serving host (no NXDOMAIN)

## ANALYTICS

- [ ] Initial landing = 1 pageview
- [ ] SPA navigations increment without duplicates
- [ ] Session recording remains disabled (**fail on current live bundle**)

## QA

- [x] Homepage loads on www (brand + hero)
- [x] Editorial 404 for unknown path (`noindex`)
- [ ] Desktop smoke after redeploy (nav, Process, industries, Who We Work With arrows, footer without TBD)
- [ ] Mobile smoke (320–430 widths, grouped nav, quote CTA)
- [ ] Contact + Request Quote happy path against **production** API
- [ ] 404 / invalid insight / invalid industry (and SEO service routes **not** 404)
- [ ] Keyboard + focus-visible
- [ ] `prefers-reduced-motion`
- [ ] Lighthouse mobile accepted or remediated (baseline Perf 35 / LCP ~9s on current live)

## ADMIN CMS / BLOGS

- [ ] `APP_ENV=production` on API (startup enforces secret, secure cookies, explicit CORS)
- [ ] `ADMIN_SESSION_SECRET` (32+ chars) + `ADMIN_COOKIE_SECURE=true` on HTTPS
- [ ] Admin provisioned: `python scripts/create_admin.py`
- [ ] Legacy weak accounts flagged: `python scripts/mark_legacy_passwords.py --apply` then rotate via `/admin/change-password`
- [ ] Password reset path known: `python scripts/reset_admin_password.py`
- [ ] Password policy enforced (15–128 chars / Argon2id) on create + change
- [ ] MFA: leave `ADMIN_MFA_ENABLED=false` for soft launch **or** enable + enroll admins (P1)
- [ ] Blogs seeded or published: `python scripts/seed_blogs.py`
- [ ] Proxy `/blog-sitemap.xml` → API `/api/blog-sitemap.xml` (`frontend/vercel.json.example`)
- [ ] Unauthenticated `GET /api/admin/blogs` → 401
- [ ] Draft slug not public; published `/blogs/{slug}` + schema OK
- [ ] `/admin` absent from sitemap; admin pages `noindex`
- [ ] Cover + contentImages + `media:image-id` embeds verified on a published post
- [ ] Publishing calendar `/admin/blogs/calendar` + refresh filter `?needsRefresh=true`
- [ ] SEO Health shows PASS/WARNING/ERROR only (no fake scores); docs: `ADMIN_CMS_GUIDE.md`, `BLOG_JSON_SCHEMA.md`, `BLOG_SEO_PLAYBOOK.md`
- [ ] Editors cannot open Enquiries / Quotes / Careers (PII is ADMIN-only)
- [ ] Ops docs: `PRODUCTION_RUNBOOK.md`, `ROLLBACK_PLAN.md`, `GO_LIVE_REPORT.md`
