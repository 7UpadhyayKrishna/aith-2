# PRD — Asian International Trade House (AITH)

## Original Problem Statement
Design and build a distinctive, premium, award-level multi-page website for ASIAN INTERNATIONAL TRADE HOUSE (International Trading • Import • Export • Global Sourcing • Procurement • Supply Chain). Editorial/architectural visual identity: Warm Ivory #F3F0E8, Bone #E7E1D5, Forest Black #17231D, Deep Olive #29372E, Burnt Copper #B65A32 accent, Terracotta/Sage/Stone/Sand material accents. Oversized left-aligned typography (Manrope + Instrument Serif + JetBrains Mono), cinematic documentary photography (ports, grain, minerals, textiles, pharma, chemicals), no cards/SaaS/blue-corporate/glassmorphism/neon. Central idea: TRADE IS CONNECTION.

## User Choices (confirmed)
- Trade Request form: FRONTEND-ONLY demo (no storage, no email)
- Photography: curated stock (Unsplash, each image visually verified)
- Structure: multi-page site
- No admin view

## Architecture
- React 19 + react-router-dom 7 (5 pages), Tailwind (custom palette in tailwind.config.js), framer-motion (masked line reveals, scroll-driven process line, clip-path image reveals, AnimatePresence), lenis (smooth momentum scrolling), sonner (toasts), lucide-react icons.
- Backend: untouched stock FastAPI (no backend needed for demo).
- Pages: `/` Home (Hero → 01 Who We Are → 02 Approach split → 03 What We Do interactive rows → 04 Product Discovery + Agriculture showcase → 05 Global Trade cartographic map → 06 Process line → 07 Quality → 08 Industries horizontal gallery → 09 Sage sourcing feature → 10 Partnerships → 11 Insights teaser → marquee → 12 Final CTA), `/products`, `/markets`, `/insights` (+ resource center), `/request-quote` (6-step editorial form with confirmation + reference code).

## Implemented (2026-09-12)
- Full visual system per brief; floating nav (transparent over hero → compact ivory blurred bar on scroll); mobile full-screen menu + persistent REQUEST QUOTE bottom CTA.
- Cartographic REAL world map (Natural Earth 110m land + country borders + graticule via d3-geo/topojson, NaturalEarth1 projection) in engraved ivory-on-forest style, with animated copper trade routes from Asia and hover/click market panels (MARKET/PRODUCTS/OPPORTUNITIES) that flip below the marker near the top edge.
- Scroll-driven 6-step process line; interactive What-We-Do contents page; category discovery with live search + hover image switching; featured Agriculture showcase with hover image swaps.
- Multi-step trade request form (01–06, progress line, slide transitions, validation, partner/sourcing variants via query params, confirmation w/ ref code). MOCKED: submissions not stored or emailed (per user choice).
- All photography individually verified for relevance/palette.

## Verified
- Home all sections, map hover panel, product search + category tabs, full quote form (submitted → confirmation AITH-XXXXXX), insights toast on downloads, footer, mobile hero + menu. Console clean (only platform overlay noise).

## Backlog
- P0: real form submission handling (DB/email via Resend) when user is ready
- P1: full Insight article pages; real downloadable PDF resources
- P2: dedicated Solutions page (currently home anchors); locale/i18n; OG image + favicon set; partner logos; case studies

## Test Credentials
- None — no authentication in this build.
