# AITH Website — Production Readiness & Content Report

**Prepared for:** Stakeholder / experienced developer handoff  
**Project:** Asian International Trade House (AITH) marketing site  
**Date:** 15 September 2026  
**Stack:** React 19 + CRA/CRACO, React Router 7, Tailwind CSS 3, Framer Motion, Lenis  
**Canonical host (config):** `https://aithinternational.com` — centralised in `frontend/src/config/site.js`

---

## 1. Executive Summary

This pass refined the **existing** editorial trade site — it did not replace the visual system.

**Primary fix:** Official logo no longer renders as a white square or CSS-inverted mono JPEG. Production assets are transparent WebP/PNG (navy + gold preserved). Navbar uses a larger full-colour lockup with soft environmental contrast on the dark hero (top gradient + radial veil + drop-shadow — not a white box).

**Also delivered:** `/partner`, `/quality-compliance`, `/privacy`, `/terms`; expanded FAQ library; Contact + Request Quote integration boundaries (API + mailto fallback); SEO/schema hardening; Lenis/scroll tuning; deferred analytics; footer/legal IA; accessibility upgrades for mobile menu.

**Not done (intentional):** Next.js/SSR migration, final legal counsel copy, inventing phone/WhatsApp/address/SLA/MOQ numbers, self-hosting Unsplash heroes, live email/CRM credentials in frontend.

---

## 2. Final Site Map

| Path | Purpose |
|------|---------|
| `/` | Home — editorial long-scroll story |
| `/about` | Company narrative + brand lockup |
| `/services` | Capabilities |
| `/products` | Categories & discovery |
| `/markets` | Regions + TradeMap |
| `/insights` | Stories + resource stubs |
| `/insights/:id` | Article + Article schema |
| `/faq` | Categorised FAQ + FAQPage schema |
| `/contact` | General / partnership / support enquiries |
| `/partner` | Supplier/manufacturer partnership page |
| `/quality-compliance` | Quality & compliance process |
| `/request-quote` | Structured trade brief wizard |
| `/privacy` | Privacy shell — `[TBD — LEGAL REVIEW]` |
| `/terms` | Terms of Trade shell — `[TBD — LEGAL REVIEW]` |
| `*` | Editorial 404 |

**Primary desktop nav:** About · Products · Services · Markets · Insights · Contact · Partner · Request Quote  
**Mobile also:** Quality · FAQ  
**Footer:** full navigate set + legal

---

## 3. Architecture Overview

```
frontend/
├── public/
│   ├── brand/          # transparent logos, OG, favicon, source JPG
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── site.webmanifest
│   └── index.html      # default meta; deferred analytics
└── src/
    ├── config/site.js  # SITE_ORIGIN, brand paths, social TBD
    ├── data/           # content.js, faqs.js, contact.js
    ├── services/forms.js
    ├── components/     # BrandLogo, Nav, Footer, Seo, PageHero, …
    └── pages/          # route screens (lazy except Home)
backend/
└── server.py           # FastAPI + /api/contact + /api/quote (+ existing status)
```

**Content ownership**

| Concern | File |
|---------|------|
| Domain / OG defaults | `src/config/site.js` |
| Marketing copy / categories | `src/data/content.js` |
| FAQ Q&A | `src/data/faqs.js` |
| Phone, WhatsApp, hours, SLA | `src/data/contact.js` |
| Form transport | `src/services/forms.js` |
| Brand rasters | `public/brand/` |

---

## 4. Brand & Logo Implementation

### Assets created

| File | Role |
|------|------|
| `logo-transparent.webp` (~86KB) | Primary nav/footer lockup |
| `logo-transparent.png` (~350KB) | Fallback |
| `logo-transparent@1.5x.webp` | Retina srcset |
| `logo-mark-transparent.webp/png` | Icon-only crop (available) |
| `og-image.jpg` | Ivory-backed square for OG/social |
| `apple-touch-icon.png` | Touch icon |
| `logo-source.jpg` | Master reference (white-bg source) |

### Rules applied

- White raster background removed; navy + gold preserved; artwork not redrawn.
- **No** `brightness-0` / `invert` / grayscale on the official lockup.
- Site theme remains forest `#17231D` / copper `#B65A32` / ivory `#F3F0E8` — logo navy/gold stays inside the asset only.
- Nav sizing uses height clamp ~`5.25rem–7.25rem` with `object-contain` and intrinsic width/height to limit CLS.
- Dark hero contrast: stronger top gradient under nav + soft radial behind logo + light drop-shadow (not a white rectangle).

### Known residual

- Vertical lockup geometry means the tagline remains the smallest line at mobile widths; desktop/scrolled ivory nav is the strongest presentation.
- Old `logo-full.jpg` / `logo-mono-ivory.jpg` remain on disk but are unused by `BrandLogo`.

---

## 5. Navigation System

- Sticky header with transparent → ivory scrolled transition preserved.
- Partner → `/partner` (was query-only quote flow).
- Mobile: Escape closes, body scroll lock, Lenis stop/start, route change closes, focus moves to close control, Partner + Quality + FAQ included.
- Skip link + `main#main-content` retained.
- Fixed mobile Request Quote bar; footer uses `pb-mobile-cta` clearance.

---

## 6. Page-by-Page Content Inventory

| Page | H1 concept | Notes |
|------|------------|-------|
| Home | FROM ASIA. TO EVERYWHERE. | WebSite + Organization schema; FAQ strip; quality link to `/quality-compliance` |
| About | WE CONNECT PRODUCTS… | Larger transparent brand showcase |
| Services | SOLUTIONS FOR REAL TRADE. | Existing |
| Products | PRODUCTS, MATERIALS… | Existing |
| Markets | ONE SOURCE. MANY MARKETS. | TradeMap |
| Insights / Article | Per story | Article + BreadcrumbList schema; related stories |
| FAQ | QUESTIONS. ANSWERED. | Expanded library |
| Contact | LET'S TALK TRADE. | Intent field; TBD channels gated |
| Partner | BUILD TRADE TOGETHER. | New |
| Quality | QUALITY IS A PROCESS. | New |
| Request Quote | Dynamic / confirmation | Enhanced fields; submit service |
| Privacy / Terms | Legal titles | Shell + LEGAL REVIEW markers |
| 404 | ROUTE NOT FOUND. | noindex |

---

## 7. SEO Implementation

- Per-route `Seo` component: title, description, canonical, robots, OG, Twitter.
- Domain centralised: `SITE_ORIGIN` in `config/site.js`.
- `sitemap.xml` includes partner, quality-compliance, privacy, terms.
- `robots.txt` points at sitemap on `aithinternational.com`.
- Misleading Home `SearchAction` removed (client-only product search is not a crawlable search endpoint).
- Default OG image → `/brand/og-image.jpg`.
- Fonts: dropped unused Manrope weight 300 from Google Fonts URL; `display=swap` retained.
- **CSR limitation:** meta updates run client-side; prerender/SSR remains a P1 recommendation (not implemented — risk to Lenis/Motion).

---

## 8. Structured Data

| Type | Where |
|------|--------|
| Organization | Home (+ reusable `orgJsonLd`) |
| WebSite | Home |
| FAQPage | `/faq` |
| Article | Insight articles |
| BreadcrumbList | Partner, Quality, Privacy, Terms, Articles |
| Service | Helper exported (`serviceJsonLd`) for future use |

No AggregateRating / fake awards / fabricated metrics.

---

## 9. Performance Optimizations

Concrete changes:

1. **Lenis:** slightly tighter feel (`duration` 0.95, `lerp` 0.1); `smoothWheel` disabled on coarse pointers; `lenis` / `lenis-smooth` classes applied; respects `prefers-reduced-motion`.
2. **Process section:** spring damping increased (less oscillatory work); still motion-value driven (no per-frame React setState).
3. **Analytics:** PostHog + Emergent scripts deferred via `requestIdleCallback` / post-load timeout — no longer block first paint in `<head>`.
4. **Logo:** WebP primary (~86KB) vs prior ~108KB JPEG with white plate; preload WebP in HTML.
5. **Hero:** intrinsic width/height + `fetchPriority="high"`; top gradient for nav contrast without extra image.
6. Lazy routes retained; `content-visibility` retained on long sections.

**Remaining costs:** Unsplash remote heroes; TradeMap + world-atlas on Home/Markets; continuous marquees; session recording when analytics wake.

---

## 10. Animation / Scroll Architecture

- Single Lenis rAF loop; Framer scroll alignment via synthetic `scroll` event (unchanged pattern, tuned params).
- Reveal `Line` / `Fade` / `Tag` + `EASE` preserved.
- Nav scrolled flag still threshold-gated (ref guard).
- Reduced-motion CSS kills marquees and shortens transitions.

---

## 11. UI/UX System

- Forest / copper / ivory editorial system preserved.
- PageHero used for new marketing/legal pages.
- Copper primary CTA language standardised (Request Quote / Partnership Enquiry / Discuss Specification).
- Dead footer `#` / `preventDefault` social & legal links removed — social shows `[TBD]` until URLs configured; legal routes to real pages.

---

## 12. FAQ Architecture

Categories retained; coverage expanded (imports/exports, quote inputs, MOQ variance, timelines, air vs sea, quote inclusions, document types, packaging, OEM, claims, insurance, updates, confidentiality, etc.).

Company-specific answers still use `[TBD]` where facts are unknown.

Contextual strips: Home, Services, Products, Contact, Partner, Quality.

---

## 13. Contact & Quote Workflow

| Flow | Intent |
|------|--------|
| `/contact` | General, supplier, partnership, support (+ intent select) |
| `/request-quote` | Product / qty / destination / timeline / mode / company / contact (+ optional origin, Incoterm, notes) |
| `/partner` → quote `?type=partner` | Partnership-shaped brief |

Honeypot field `website` on both forms.

---

## 14. Forms / Backend Integration Status

| Layer | Status |
|-------|--------|
| Frontend `services/forms.js` | POST `/api/contact` & `/api/quote`; honeypot; mailto fallback if API unreachable |
| Backend `server.py` | Persists to MongoDB collections `contact_submissions` / `quote_submissions` |
| Email/CRM forwarding | **Not wired** — add ops layer; do not put secrets in CRA |
| `REACT_APP_API_URL` | Optional absolute API base; empty = same-origin `/api` |

**Recommendation:** reverse-proxy rate limiting; server-side validation already minimal; add transactional email after persist.

---

## 15. Accessibility Status

| Item | Status |
|------|--------|
| Skip link / landmarks / one H1 | Present |
| Focus-visible copper ring | Present |
| Mobile menu Escape + scroll lock | Done |
| FAQ accordion (Radix) | Keyboard / aria |
| Decorative vs descriptive images | Pattern retained |
| TradeMap keyboard | Still mouse-oriented (P2) |
| Discovery tabs | Incomplete tabpanel pattern (P2) |

---

## 16. Responsive Behaviour

Logo + CTA + hamburger validated conceptually at mobile widths; desktop logo larger with ivory scrolled state strongest. Footer padding accounts for sticky mobile CTA. Touch devices prefer native scroll over Lenis wheel smoothing.

---

## 17. Analytics / Tracking

PostHog (Emergent host) + `emergent-main.js` still present but **deferred** after idle/load. Session recording config unchanged when loaded. Document for privacy policy cookie section (`[TBD — LEGAL REVIEW]`).

---

## 18. Legal / Compliance Pages

`/privacy` and `/terms` exist as professional shells with explicit `[TBD — LEGAL REVIEW]` markers. Not legal advice; counsel must finalise before treating as binding.

---

## 19. Business Data Still Marked TBD

| Field | Location |
|-------|----------|
| Phone, WhatsApp, street, hours, SLA | `contact.js` |
| Social profile URLs | `config/site.js` → `SOCIAL` |
| MOQ, Incoterms preference, quote validity, currency, payment terms | FAQ answers |
| Full office address / visiting hours | FAQ `delhi-hub` |
| Legal governing law / processors / cookie table | Privacy & Terms pages |
| Resource PDF downloads | Insights toasts (placeholder) |

Email live: `trade@aithinternational.com`.

---

## 20. Known Technical Debt

1. CRA SPA — crawlers see JS-dependent meta (prerender/Next.js future).
2. Unsplash CDN dependency for photography.
3. Large unused shadcn/ui surface + unused npm deps (axios, recharts, etc.).
4. TradeMap duplicated Home + Markets.
5. Insights resource “downloads” still toast stubs.
6. No automated Lighthouse CI in repo.
7. Contact.js formatting (extra blank lines) from editing pass — functionally fine, tidy later.

---

## 21. Lighthouse / Performance Findings

**Environment:** Production `npm run build` succeeded (2026-09-15). Full Lighthouse on production host not run in this session (no public deploy URL).

**Code-level before → after (this pass):**

| Area | Before | After |
|------|--------|-------|
| Logo | White JPG + invert filter → white square on dark | Transparent WebP/PNG, full colour |
| Analytics | Sync in `<head>` | Idle/deferred |
| Lenis | Always smoothWheel | Coarse pointer → native; tuned lerp |
| Home schema | Misleading SearchAction | Removed |
| Forms | Toast-only stubs | API boundary + mailto fallback + backend routes |

**Targets (aim, not measured here):** LCP &lt; 2.5s, CLS &lt; 0.1, INP &lt; 200ms; Lighthouse Perf/A11y/BP/SEO 90–95+ on production CDN.

---

## 22. QA Results

| Check | Result |
|-------|--------|
| Production build | **Pass** |
| Routes registered (incl. partner, quality, privacy, terms, 404) | **Pass** |
| Logo transparent assets present | **Pass** |
| Nav no longer uses invert filter | **Pass** |
| Partner page loads | **Pass** (lazy chunk) |
| Footer legal → real routes | **Pass** |
| FAQ expansion present | **Pass** |
| Forms service + backend endpoints | **Pass** (code); live email delivery **not** verified |

**Manual visual note:** Navy lockup on dark hero remains the hardest contrast case; mitigated with gradient/veil/shadow. Strongest logo read is scrolled ivory nav and About/footer.

---

## 23. Launch Blockers

1. Fill or hide remaining `[TBD]` commercial/contact facts.  
2. Legal review of Privacy + Terms.  
3. Confirm production domain matches `SITE_ORIGIN` / sitemap.  
4. Wire email/CRM notification from Mongo submissions (or confirmed mailto ops).  
5. Social URLs or keep `[TBD]` suppressed.  
6. Optional: prerender for SEO before paid acquisition spend.

---

## 24. Post-launch Recommendations

1. Prerender (`react-snap`) or Next.js App Router if organic SEO is critical.  
2. Self-host hero/category images (WebP/AVIF + `srcset`).  
3. Lighthouse + Web Vitals on real hosting.  
4. Keyboard-accessible TradeMap.  
5. Remove unused UI kit / deps to shrink install surface.  
6. Partner success stories only when verified (no fake metrics).

---

## 25. Developer Handoff Notes

- Change domain in **one place:** `frontend/src/config/site.js` → `SITE_ORIGIN`, then sync `public/sitemap.xml`, `robots.txt`, `index.html` defaults if needed.  
- Replace contact TBDs in `src/data/contact.js`.  
- Set `SOCIAL.*` URLs or leave null.  
- Set `REACT_APP_API_URL` if API is on another origin; ensure CORS.  
- Logo: replace `public/brand/logo-source.jpg` and re-run the transparency export script (or re-export manually); update `BrandLogo` / `BRAND` dimensions if crop size changes.  
- Do **not** reintroduce CSS invert on the official lockup.

---

## 26. Final Readiness Verdict

| Dimension | Rating | Why |
|-----------|--------|-----|
| **DESIGN READINESS** | **HIGH** | Identity preserved; logo implementation corrected; editorial system intact |
| **CONTENT READINESS** | **MEDIUM** | Strong structure + FAQ; commercial/legal TBDs remain |
| **FUNCTIONAL READINESS** | **MEDIUM** | Forms have API/mailto path; email ops + TBD contact channels incomplete |
| **SEO READINESS** | **MEDIUM–HIGH** | Meta/schema/sitemap solid; CSR crawl gap remains |
| **PERFORMANCE READINESS** | **MEDIUM** | Meaningful mitigations; Unsplash + map + analytics still weigh |
| **ACCESSIBILITY READINESS** | **MEDIUM–HIGH** | Menu/FAQ/skip strong; map/tabs P2 |
| **COMMERCIAL LAUNCH READINESS** | **MEDIUM** | Presentable for design/stakeholder review; blocked on TBD facts, legal, and inbound email ops for full public launch |

**Bottom line:** Ready for professional presentation and continued content/ops completion. Not fully “flip the switch” commercial-live until TBD fields, legal review, and enquiry delivery are confirmed.

---

## Changelog

### Files created
- `frontend/src/config/site.js`
- `frontend/src/services/forms.js`
- `frontend/src/pages/Partner.js`
- `frontend/src/pages/QualityCompliance.js`
- `frontend/src/pages/Privacy.js`
- `frontend/src/pages/Terms.js`
- `frontend/public/brand/logo-transparent.png`
- `frontend/public/brand/logo-transparent.webp`
- `frontend/public/brand/logo-transparent@1.5x.webp`
- `frontend/public/brand/logo-mark-transparent.png`
- `frontend/public/brand/logo-mark-transparent.webp`
- `frontend/public/brand/og-image.jpg`
- `frontend/public/brand/apple-touch-icon.png` (regenerated)
- `docs/AITH Website — Production Readiness & Content Report.md` (this file)

### Files modified
- `frontend/src/components/BrandLogo.js`
- `frontend/src/components/Nav.js`
- `frontend/src/components/Footer.js`
- `frontend/src/components/Seo.js`
- `frontend/src/components/home/Hero.js`
- `frontend/src/components/home/Process.js`
- `frontend/src/components/home/Industries.js`
- `frontend/src/components/home/Closing.js`
- `frontend/src/App.js`
- `frontend/src/pages/Home.js`
- `frontend/src/pages/About.js`
- `frontend/src/pages/Contact.js`
- `frontend/src/pages/RequestQuote.js`
- `frontend/src/pages/Article.js`
- `frontend/src/data/faqs.js`
- `frontend/src/data/contact.js`
- `frontend/src/index.css`
- `frontend/public/index.html`
- `frontend/public/sitemap.xml`
- `frontend/public/site.webmanifest`
- `frontend/public/brand/logo-source.jpg` (master copy)
- `backend/server.py`

### Files deleted
- None (obsolete JPGs retained unused for safety)

### Dependencies added
- None (npm); backend already listed `email-validator`

### Dependencies removed
- None

### Routes added
- `/partner`
- `/quality-compliance`
- `/privacy`
- `/terms`
- Backend: `POST /api/contact`, `POST /api/quote`

### SEO changes
- Central site config; OG image; sitemap expansion; SearchAction removed; Article + Breadcrumb schemas

### Performance changes
- Deferred analytics; Lenis touch/wheel tuning; logo WebP; Process spring tune; hero image hints

### Content changes
- Expanded FAQs; Partner + Quality pages; legal shells; form intent/fields; internal links to partner/quality

### Remaining TBDs
- Phone, WhatsApp, street, hours, SLA, social URLs, legal counsel text, MOQ/Incoterms/currency/payment FAQ specifics, resource PDFs, production domain confirmation if different from `aithinternational.com`
