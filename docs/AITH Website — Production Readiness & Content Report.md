# AITH Website — Production Readiness & Content Report

**Date:** 17 September 2026  
**Repository:** AITH (React 19 CRA/CRACO + FastAPI/Motor)  
**Phase:** Code hardening + production ops documentation  

### Update — Security / CMS hardening (local)

Engineering completed production-fail-closed admin security, MFA feature flag, request/audit hardening, blog sitemap/redirect rules, recovery scripts, frontend SafeImage / analytics admin skip, and ops docs (`PRODUCTION_RUNBOOK.md`, `ROLLBACK_PLAN.md`, refreshed `GO_LIVE_REPORT.md`). This does **not** clear production deployment blockers.

---

## 1. Executive Summary

**CODE HARDENED ≠ PRODUCTION VERIFIED. Launch state: DEPLOYMENT BLOCKED.**

Local codebase now refuses insecure production startup (session secret, secure cookies, explicit CORS), ships admin recovery scripts, optional MFA (`ADMIN_MFA_ENABLED` / pyotp), PII RBAC for editors, and blog SEO safeguards. A public frontend still exists at **https://www.aithworld.com** (Vercel), but prior evidence showed:

1. Canonical `https://aithinternational.com` — **DNS NXDOMAIN**  
2. FastAPI `/api/health` — **not on live host** (SPA HTML fallback)  
3. Live bundle **stale** vs hardened tree  
4. Privacy/Terms **draft** — counsel / waiver outstanding  
5. Production Mongo / CORS / SMTP-or-monitoring owner — **unverified**

| State | Status |
|-------|--------|
| **CODE HARDENED** | Yes — local engineering |
| **CODE READY** (features) | Yes — local |
| **STAGING VERIFIED** | No |
| **SOFT LAUNCH READY** | No |
| **PRODUCTION LIVE** | No — **DEPLOYMENT BLOCKED** |

Evidence detail: `docs/GO_LIVE_REPORT.md`. Ops: `docs/PRODUCTION_RUNBOOK.md`, `docs/ROLLBACK_PLAN.md`.

---

## 2. Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, CRA/CRACO, React Router 7, Tailwind 3, Framer Motion, Lenis |
| Backend | FastAPI, Motor/MongoDB, optional SMTP, Argon2id admin sessions |
| Analytics | PostHog SPA `$pageview` (session recording off in local HTML; skip `/admin`) |
| Admin MFA | Optional TOTP via **pyotp** (`ADMIN_MFA_ENABLED`, default off) |

---

## 3. Architecture

CSR SPA with lazy routes, centralized site origin, Mongo-first form persistence, best-effort SMTP, in-memory rate limits, honeypots. Admin CMS on `/admin/*` with HttpOnly session + CSRF. Media: `MEDIA_PROVIDER=url_only` (no ephemeral disk uploads).

**Prerender/SSR:** not implemented (P1 debt).

**Hosting (observed / assumed only where evidenced):** frontend on Vercel; backend host **not deployed** in last verification. No invented PaaS.

---

## 4. Final Route Map

**Core:** `/` `/about` `/services` `/products` `/markets` `/insights` `/insights/:id` `/faq` `/contact` `/request-quote` `/partner` `/quality-compliance` `/careers` `/privacy` `/terms`

**Services:** `/global-sourcing-services` `/import-export-services` `/international-procurement` `/supplier-sourcing` `/trade-documentation` `/freight-coordination`

**Industries:** `/industries` + healthcare, agriculture, minerals-metals, chemicals, textiles

**Blogs:** `/blogs` `/blogs/:slug`

**Admin:** `/admin/*` (lazy, `noindex`)

**404:** `*` + invalid industry/service/article → noindex

---

## 5. Brand System

Forest `#17231D` · Copper `#B65A32` · Ivory `#F3F0E8` · Manrope / Instrument Serif / JetBrains Mono · dual-tone logos. Preserved.

---

## 6. Navigation

Desktop: restrained primary links + Partner + Request Quote. Mobile: grouped Explore/Company, focus trap, Escape, Lenis pause, Quote CTA. SEO/deep routes via content and footer — not dumped into primary nav. Admin has no public Nav/Footer.

---

## 7. Motion System

| Tier | Duration | Use |
|------|----------|-----|
| MICRO | ~180–260ms | colour, small shifts |
| STANDARD | ~280–420ms | arrows, nav hovers |
| EDITORIAL | ~600–1200ms | Line/Fade reveals, image scale |

Ease: `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced-motion CSS near-zero transitions.

---

## 8. Who We Work With Arrow Polish

Single outward arrow; row hover/focus-visible rotate/translate/scale to copper; reduced-motion shortened. Local CODE READY; production motion **not** re-verified on stale live bundle.

---

## 9. Horizontal Industries

Wheel / trackpad / drag / touch / keyboard / prev-next / Lenis-safe. `SafeImage` with scheme validation on card media.

---

## 10. Process Timeline

Geometry unchanged. Framer reduced-motion edge polish remains P2.

---

## 11. Footer

Social column omitted when URLs null. Local code has no “Profiles forthcoming / TBD”; live stale deploy previously still showed TBD — redeploy required.

---

## 12–15. Content / SEO / Industries / Insights / Blogs

Service intents differentiated; industry copy disclaims licences. Insights = static evergreen; Blogs = CMS Trade Journal (seed topics avoid duplicating Insights). Invalid slugs → real 404. Blog sitemap omits `seo.index=false`. Slug remaps: API **HTTP 301** via `/api/blog-redirects/{slug}`. BlogPost supports SEO canonical override.

---

## 16–18. Metadata / Structured Data / Internal Linking

`Seo` sets title, description, canonical, OG, Twitter, robots, JSON-LD. Sitemap lists indexable marketing routes. **Live locs previously pointed at dead canonical host** — fix before Search Console submit. Internal links from hubs/footer/related blocks.

---

## 19. CSR / Prerender Status

**P1 debt.** Options A (static prerender) / B (Next.js) documented in prior go-live notes — **not** executed this phase.

---

## 20–22. Forms / Mongo / SMTP

Flow: validate → rate limit → honeypot → **Mongo insert** → notify → patch `notificationStatus` (`pending|sent|failed|disabled`). SMTP failure never undoes insert; user still gets success when stored. Frontend in-flight guards; mailto ≠ API persistence.

**Production:** forms not durable until API wired (**FAIL** at last probe).

---

## 23. Analytics

SPA pageviews skip duplicate first load; **skip `/admin`**. `index.html` deferred bootstrap also skips `/admin`. Session recording disabled in local HTML — confirm on **production** bundle after redeploy (prior live **FAIL**).

---

## 24. Security (hardened)

| Control | Code status |
|---------|-------------|
| Honeypot + IP rate limit + max lengths | PASS |
| Production fail-closed: secret ≥32, `ADMIN_COOKIE_SECURE`, explicit CORS | PASS |
| No ephemeral `ADMIN_SESSION_SECRET` in production | PASS |
| Argon2id + HttpOnly session + CSRF | PASS |
| `mustChangePassword` / change-password gate | PASS |
| Legacy flag script `--apply` | PASS |
| Editors blocked from enquiry/quote/career PII | PASS |
| `X-Request-ID` + API security headers | PASS |
| Session TTL `expiresAtDate` | PASS |
| MFA flag (off by default) | PASS |
| `SafeImage` scheme allowlist | PASS |
| Media `url_only` | PASS |
| Expanded `tests/test_admin_security.py` + unique test DB per worker | PASS |

Live CORS/secrets on a real API: **BLOCKED** until deploy.

---

## 25. Accessibility

Focus-visible copper outline; skip link; FAQ accordion; TradeMap keyboard; mobile dialog; reduced-motion + Lenis skip. Full production keyboard matrix incomplete (time-boxed after P0 failures).

---

## 26. Performance

Lazy routes; transform/opacity motion. Prior live Lighthouse mobile Perf **35** / LCP ~9s — **P1**. Unsplash remote heroes remain a CWV risk.

---

## 27. Legal Status

Privacy + Terms: **LEGAL_STATUS = draft**. Banner when `REACT_APP_SHOW_LEGAL_DRAFT !== 'false'`.

**P0 / BLOCKED:** counsel approval **or** explicit written soft-launch acceptance before treating as binding. Do not set draft flag false until then.

---

## 28. Business Config

Null socials / WhatsApp / hours / SLA / commercial policies gated via `isConfigured` — not rendered as placeholders (local).

---

## 29. Deployment Configuration

| Doc | Role |
|-----|------|
| `backend/.env.example` | Required/optional backend vars |
| `frontend/.env.example` | `REACT_APP_API_URL`, legal draft |
| `frontend/vercel.json.example` | `/api/*` + `/blog-sitemap.xml` rewrites + headers |
| `docs/PRODUCTION_RUNBOOK.md` | Deploy, admin scripts, rotation, incidents |
| `docs/ROLLBACK_PLAN.md` | FE/BE/env/blog rollback |
| `docs/PRODUCTION_CHECKLIST.md` | Checkbox go-live list |
| `docs/GO_LIVE_REPORT.md` | Evidence + **DEPLOYMENT BLOCKED** |

**Last live facts:** Vercel www up; canonical NXDOMAIN; no production API on www `/api`.

---

## 30–31. QA / Build Results

Local: security tests expanded; Contact/Quote → Mongo with notification status; health JSON locally. Production end-to-end: **not cleared**.

---

## 32. Production Checklist

`docs/PRODUCTION_CHECKLIST.md` — treat items unchecked until verified on the **chosen** production stack after redeploy.

---

## 33. Owner Actions

| Action | Before launch? | Status |
|--------|----------------:|--------|
| Decide canonical host + DNS | **YES** | **BLOCKED** |
| Redeploy current frontend | **YES** | **BLOCKED** (stale at probe) |
| Deploy FastAPI + wire API URL / rewrite | **YES** | **BLOCKED** |
| Production env: Mongo, CORS, secret ≥32, cookie secure, `APP_ENV=production` | **YES** | **BLOCKED** |
| SMTP **or** named Mongo-only monitoring owner | **YES** | Outstanding |
| Name Mongo backup owner | **YES** | Placeholder in runbook |
| Legal approve **or** soft-launch waiver | **YES** | **BLOCKED** |
| Analytics / cookie consent decision | YES (jurisdiction) | Outstanding |
| Proxy `/blog-sitemap.xml` | YES if blogs public | Template only |
| Search Console + sitemap | After DNS/API | Do not submit dead host |
| Enable MFA when ops-ready | Optional | Flag off by default |
| Mobile CWV accept/mitigate | P1 | Measured fail |
| Prerender / SSR | P1 | Not started |

---

## 34. Technical Debt

- CSR SEO without prerender/SSR  
- In-memory rate limit (add edge limits if multi-instance)  
- Remote Unsplash imagery / mobile LCP  
- Emergent/PostHog bootstrap ownership  
- Vercel security headers beyond HSTS (example headers in `vercel.json.example`)  
- Dependency prune post-launch only  

---

## 35. Launch Blockers & Priority Lists

### P0 — DEPLOYMENT BLOCKED until cleared (owner/infra)

1. Canonical DNS + `SITE_ORIGIN` consistency  
2. Deploy backend; production Mongo + explicit CORS + fail-closed admin env; forms E2E on live API  
3. SMTP **or** documented Mongo-only monitoring with a **named** owner  
4. Redeploy current CODE HARDENED frontend (SEO routes, footer, analytics flags)  
5. Counsel-approved Privacy & Terms **or** explicit documented soft-launch acceptance  
6. Blog sitemap rewrite live if Trade Journal is in scope  

### P0 — code controls (engineering PASS; live verify still required)

1. Production startup validation (secret / cookie / CORS)  
2. Admin recovery scripts + `mustChangePassword` path  
3. Editor PII isolation on enquiries/quotes/careers  
4. Request ID + API security headers + session TTL  

### P1 — after P0, may accept with written risk

1. CSR prerender/SSR for critical routes  
2. Mobile CWV remediation / acceptance  
3. Proxy-level rate limiting if multi-instance  
4. Confirm session recording disabled on **production** bundle  
5. Turn on `ADMIN_MFA_ENABLED` with enrollment/runbook when ready  

### P2 — post-launch

1. Social / WhatsApp / hours / SLA when known  
2. Dependency prune  
3. Image CDN / self-host heroes  
4. Process Framer reduced-motion edge polish  
5. Durable object storage media provider (beyond `url_only`) when credentials exist  

---

## 36. Final Verdict

**CODE HARDENED / DEPLOYMENT BLOCKED.**

Do **not** declare soft launch or **PRODUCTION LIVE** until P0 owner/infra gates in `docs/GO_LIVE_REPORT.md` are evidenced on real hosts. Hardening improved the **ship-safe** baseline; it did not replace DNS, API hosting, legal approval, or production verification.

---

## Readiness Scoring (0–10, after hardening + prior prod probe)

| Dimension | Score | What prevents a 10 |
|-----------|------:|--------------------|
| Design | 9 | Residual micro-polish |
| Brand | 9 | System locked |
| Content | 7 | Legal draft; live TBD risk until redeploy |
| Functionality | 6 | Local OK; **production API absent** |
| SEO | 4 | Dead canonical; CSR; sitemap proxy unverified |
| Performance | 5 | Mobile Lighthouse weak on last live probe |
| Accessibility | 8 | Strong patterns; full prod pass incomplete |
| Security | 7 | **Code hardened**; live API env unproven |
| Operations | 5 | Runbooks exist; **no verified prod ops stack** |
| Commercial Launch | 2 | **DEPLOYMENT BLOCKED** |

---

## 37. Admin CMS + Blog Platform

### Hardened / READY (local)

| Area | Status |
|------|--------|
| Auth Argon2id + session + CSRF + change-password gate | READY |
| Production fail-closed config | READY |
| Roles admin / editor (+ PII block for editors) | READY |
| Blog CRUD / revisions / JSON import-export | READY |
| Public blogs + sitemap rules + 301 redirects | READY (needs API + proxy) |
| MFA (`ADMIN_MFA_ENABLED`) | READY as **optional flag** (off) |
| Recovery CLI scripts | READY |
| Media `url_only` | READY |
| Security test suite isolation | READY |

### Deployment still BLOCKED

Same site P0: no verified production API, canonical DNS, or live sitemap proxy.

Docs: `ADMIN_CMS_GUIDE.md`, `BLOG_JSON_SCHEMA.md`, `BLOG_SEO_PLAYBOOK.md`, `PRODUCTION_RUNBOOK.md`.
