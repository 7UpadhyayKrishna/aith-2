# AITH Website — Readiness & Content Report

**Prepared for:** Stakeholder / experienced developer handoff  
**Project:** Asian International Trade House (AITH) marketing site  
**Date:** 15 September 2026  
**Stack:** React 19 + CRA/CRACO, React Router 7, Tailwind CSS 3, Framer Motion, Lenis  
**Scope of this pass:** Logo integration, new pages, FAQ system, SEO semantics, scroll performance, UX polish

---

## 1. Executive summary

The site is a premium editorial multi-page SPA for an international trade house. This pass:

- Wired the official logo (full-color + mono treatment) into nav, footer, About, favicon/manifest
- Added **About**, **Services**, **FAQ**, **Contact**, and a real **404**
- Built a categorized customer FAQ with contextual strips on Home, Services, Products, Contact
- Hardened SPA SEO (per-route titles/meta, OG defaults, JSON-LD, robots, sitemap, H1 discipline)
- Reduced scroll stutter (Process section no longer re-renders every frame; Lenis ↔ Framer sync; lazy routes; lighter images; fonts via HTML link)
- Preserved the forest / copper / ivory theme and signature motion language

**Not done in this pass (intentional):** Next.js/SSR migration, live CRM/email backend, final legal copy, final phone/WhatsApp/address/SLA/MOQ numbers (placeholders marked `[TBD]`).

---

## 2. Site map & routes

| Path | Page | Purpose |
|------|------|---------|
| `/` | Home | Long-scroll editorial story + FAQ strip |
| `/about` | About | Company story, approach, brand lockup |
| `/services` | Services | Capabilities + freight modes + FAQ |
| `/products` | Products | Categories, discovery, product FAQ |
| `/markets` | Markets | Map, regions, lanes |
| `/insights` | Insights | Stories + Resource Center |
| `/insights/:id` | Article | Long-form insight |
| `/faq` | FAQ | Full categorized Q&A + FAQPage schema |
| `/contact` | Contact | Channels (TBD), form stub, FAQ |
| `/request-quote` | Request Quote | 6-step trade brief |
| `*` | NotFound | Editorial 404 (no longer falls through to Home) |

**In-page anchors retained on Home:** `#about`, `#what-we-do`, `#discover`, `#quality`, `#industries`, `#sourcing`, `#partners` (where present in section components).

**Primary nav:** About · Products · Services · Markets · Insights · Contact · Partner · Request Quote  
**Mobile also:** FAQ  
**Footer:** full navigate set including FAQ & Contact

---

## 3. Architecture map

```
frontend/
├── public/
│   ├── brand/           # logo-full.jpg, logo-mono-ivory.jpg, favicon.svg, source
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── site.webmanifest
│   └── index.html       # default meta, OG, font link, analytics
└── src/
    ├── App.js           # Router, Lenis, lazy routes, Suspense
    ├── data/
    │   ├── content.js   # Products, capabilities, stories, images
    │   ├── faqs.js      # FAQ categories + context ID lists
    │   └── contact.js   # Contact placeholders [TBD]
    ├── components/
    │   ├── BrandLogo.js
    │   ├── Seo.js
    │   ├── PageHero.js
    │   ├── FaqAccordion.js
    │   ├── Nav.js / Footer.js / Reveal.js / TradeMap.js
    │   └── home/*       # Home section composition
    └── pages/           # Route-level screens
```

**Content ownership**

| Concern | File |
|---------|------|
| Marketing copy / categories / Unsplash IDs | `src/data/content.js` |
| FAQ Q&A | `src/data/faqs.js` |
| Phone, WhatsApp, address, hours, SLA | `src/data/contact.js` |
| Brand images | `public/brand/` |

---

## 4. Brand & logo rules

| Asset | Path | Use |
|-------|------|-----|
| Full color | `/brand/logo-full.jpg` | Ivory/light surfaces, About showcase, OG image |
| Mono source | `/brand/logo-mono-ivory.jpg` (+ CSS `brightness-0 invert`) | Forest/dark nav & footer |
| Favicon | `/brand/favicon.svg` | Browser tab (theme-aligned copper/gold mark on forest) |
| Manifest | `/site.webmanifest` | PWA metadata |

**Theme rule:** Site CSS remains forest `#17231D`, copper `#B65A32`, ivory `#F3F0E8`. Logo navy/gold exists only inside the raster asset — do not retheme the site to logo navy.

**Component:** `BrandLogo` props: `variant` = `full` | `mono` | `mark`.

---

## 5. Content inventory

### 5.1 Pages & primary H1s

| Page | H1 (semantic) |
|------|----------------|
| Home | FROM ASIA. TO EVERYWHERE. |
| About | WE CONNECT PRODUCTS, PEOPLE AND MARKETS. |
| Services | SOLUTIONS FOR REAL TRADE. |
| Products | PRODUCTS, MATERIALS & COMMODITIES. |
| Markets | ONE SOURCE. MANY MARKETS. |
| Insights | TRADE INSIGHTS. |
| FAQ | QUESTIONS. ANSWERED. |
| Contact | LET'S TALK TRADE. |
| Request Quote | Dynamic step headlines |
| 404 | ROUTE NOT FOUND. |

Footer wordmark is **visual only** (`<p>` / decorative), not an H2 — avoids competing with page headings.

### 5.2 FAQ categories (`faqs.js`)

1. Getting Started  
2. Products & Sourcing  
3. Pricing, Quotes & Incoterms  
4. Shipping, Timelines & Documentation  
5. Quality & Compliance  
6. Payments & Partnership  
7. Markets & Destinations  

**Contextual strips:** Home, Services, Products, Contact (ID lists in `FAQ_BY_CONTEXT`).  
**Full page:** `/faq` with category jump links + `FAQPage` JSON-LD.

### 5.3 Placeholders for the business owner (`[TBD]`)

Update these before launch / client presentation as “final”:

| Field | Location |
|-------|----------|
| Phone | `contact.js` → `phone` |
| WhatsApp | `contact.js` → `whatsapp` |
| Street address | `contact.js` → `addressLine1` |
| Business hours | `contact.js` → `hours` |
| Response SLA | `contact.js` → `responseSla` + FAQ `response-time` |
| MOQ policy | FAQ `moq` |
| Preferred Incoterms | FAQ `incoterms` |
| Quote validity / currency | FAQ `price-validity`, `currency` |
| Payment terms | FAQ `payment-terms` |
| Social URLs | Footer (currently `preventDefault` placeholders) |
| Privacy / Terms | Footer legal links (placeholders) |
| Contact form backend | Currently toast-only local stub |
| Quote form backend | Client-side wizard only |

Email already live in UI: `trade@aithinternational.com`.

---

## 6. SEO checklist

| Item | Status |
|------|--------|
| Unique title + description per route | Done (`Seo.js`) |
| Canonical URL per route | Done |
| Open Graph / Twitter defaults | Done (`index.html` + runtime) |
| Organization + WebSite JSON-LD (Home) | Done |
| FAQPage JSON-LD (`/faq`) | Done |
| One H1 per page | Done (audited pattern) |
| H2/H3 section hierarchy | Done on new + key pages |
| `robots.txt` + `sitemap.xml` | Done |
| Favicon / web manifest | Done |
| Skip link + `main` landmark | Done |
| Real 404 | Done |
| SSR / prerender HTML for crawlers | **Not done** (SPA limitation) |
| Production domain confirmation | Sitemap uses `aithinternational.com` — confirm before DNS cutover |

**Developer note:** For stronger organic indexing, plan a follow-up with prerender (e.g. `react-snap`) or migration to Next.js App Router. Current setup is best-practice for a CSR SPA.

---

## 7. Performance changes & remaining risks

### Done this pass

1. **Process section:** scroll progress drives Framer motion values only — no React `setState` per frame  
2. **Nav scrolled flag:** updates only when threshold crosses  
3. **Lenis:** slightly tighter duration/lerp; dispatches `scroll` for Framer alignment; respects reduced motion  
4. **Code splitting:** lazy-loaded non-home routes  
5. **Images:** Unsplash widths/quality reduced; `decoding="async"`; lazy below fold  
6. **Fonts:** Google Fonts via `<link>` in HTML (removed CSS `@import`)  
7. **`content-visibility: auto`** on selected long sections  

### Remaining risks

| Risk | Notes |
|------|-------|
| Analytics / session replay (PostHog + Emergent) | Can still cost main-thread time |
| TradeMap + world-atlas | Heavy on Markets; acceptable for that route |
| Continuous CSS marquee | Low cost; keep reduced-motion override |
| Remote Unsplash | No CDN ownership; consider self-hosting heroes later |
| Logo JPG size (~100KB) | Acceptable; WebP export would be a nice follow-up |

---

## 8. How to edit content (ops guide)

### Replace contact details

Edit [`frontend/src/data/contact.js`](../frontend/src/data/contact.js). Footer and Contact page read from this file.

### Add or edit FAQs

1. Add/edit items in [`frontend/src/data/faqs.js`](../frontend/src/data/faqs.js) under the right category  
2. To surface on Home/Services/Products/Contact, add the item `id` to `FAQ_BY_CONTEXT`  
3. Full FAQ page and JSON-LD pick up all items automatically  

### Swap logo files

Replace files under `frontend/public/brand/` keeping filenames, or update paths in `BrandLogo.js`. Prefer transparent PNG/WebP for cleaner mono filtering when available.

### Add a new marketing page

1. Create `src/pages/YourPage.js` with `Seo` + single `h1` via `PageHero`  
2. Lazy-import + `<Route>` in `App.js`  
3. Add links in `Nav.js` / `Footer.js`  
4. Add URL to `public/sitemap.xml`  

---

## 9. Animation / UX contract (do not break)

- Keep Reveal `Line` / `Fade` / `Tag` and `EASE` curve  
- Keep forest hero chapters, copper CTAs, 0–4px radii, mono technical labels  
- Improve motion timing; do not strip parallax, WhatWeDo accordion, or marquee without product approval  
- Banned by design guidelines: generic corporate blue SaaS cards, pill buttons, purple glow themes  

---

## 10. Suggested next phase

1. Confirm production domain; update sitemap/canonical/OG URLs if needed  
2. Fill all `[TBD]` contact & commercial FAQ answers  
3. Wire Contact + Request Quote to email/CRM API  
4. Export logo to optimized WebP/PNG with true mono variants  
5. Legal pages (Privacy, Terms of Trade)  
6. Prerender or Next.js for crawlable HTML  
7. Self-host hero imagery; add real social profile URLs  
8. Lighthouse pass on production host (LCP, CLS, TBT)

---

## 11. Smoke-test checklist for QA

- [ ] Logo readable on transparent forest nav and scrolled ivory nav  
- [ ] Footer mono logo + typographic wordmark  
- [ ] Routes: `/about` `/services` `/faq` `/contact` `/products` `/markets` `/insights` `/request-quote`  
- [ ] Unknown URL shows 404, not Home  
- [ ] FAQ accordion keyboard operable; `/faq` category anchors scroll  
- [ ] Insights Resource “Frequently Asked Questions” → `/faq`  
- [ ] Document title changes when navigating between pages  
- [ ] Home process steps illuminate on scroll without obvious stutter  
- [ ] Mobile menu includes FAQ + Contact; sticky quote CTA present  
- [ ] Contact form shows toast (stub) without crash  

---

## 12. Verdict

**Readiness for design/content review:** High — structure, IA, FAQ, SEO shell, and performance hygiene are in place.  
**Readiness for public commercial launch:** Medium — blocked on real contact details, backend forms, legal pages, and optional SSR/prerender.

This document is sufficient for an experienced developer to understand overall structure, extension points, and remaining launch gaps without reading the full chat history.
