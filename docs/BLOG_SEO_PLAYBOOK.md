# AITH Blog SEO Playbook

Editorial operating system for AITH Insights / blogs. Complements [ADMIN_CMS_GUIDE.md](./ADMIN_CMS_GUIDE.md) and [BLOG_JSON_SCHEMA.md](./BLOG_JSON_SCHEMA.md).

**Principle:** Publishing frequency alone is not an SEO strategy. Prefer fewer, useful, maintained articles that support service and industry pillars.

---

## 1. AITH topic clusters

Pillars are **service and industry pages**. Blogs add topical depth and internal paths into those pillars.

| Cluster | Pillar routes (examples) | Example blog topics |
|---------|--------------------------|---------------------|
| Global sourcing | `/global-sourcing-services`, `/supplier-sourcing`, `/request-quote` | How to source products from India; preparing a sourcing brief; MOQ for international buyers |
| Supplier sourcing / verification | `/supplier-sourcing`, `/quality-compliance` | Supplier verification checklists; factory capability vs. trading company |
| Import & export | `/import-export-services`, `/trade-documentation` | Import process overview; export documentation traps |
| Procurement | `/international-procurement`, `/request-quote` | RFQ hygiene; total landed cost thinking |
| Trade documentation | `/trade-documentation`, `/import-export-services` | Incoterms for buyers; commercial invoice / packing list / BoL |
| Logistics / freight | `/freight-coordination`, `/import-export-services` | Air vs sea freight; lead-time planning |
| Quality & compliance | `/quality-compliance`, `/supplier-sourcing` | Pre-shipment inspection; spec alignment |
| Industry guides | `/industries`, `/industries/{slug}`, `/products` | Sector-specific sourcing notes (healthcare, agriculture, minerals, chemicals, textiles) |

Categories in CMS should map to these clusters (including **Supplier Sourcing**).

---

## 2. Recommended publishing cadence

- **~3 substantial new articles per month** + **1 meaningful refresh**, when capacity allows.
- Monthly mix: evergreen · commercial/service · industry or timely · refresh.
- Skip a slot rather than ship thin content.
- Calendar: `/admin/blogs/calendar`.

**Publishing frequency alone is not an SEO strategy.**

---

## 3. How to choose a topic

1. Start from a **buyer question** AITH can answer with operational credibility.
2. Map to one **primary pillar** (service or industry URL).
3. Check existing blogs for overlap (editor cannibalization hints + manual search).
4. Prefer topics that can stay accurate for 6–12+ months (evergreen) unless there is a clear time-bound need.
5. Reject topics that only exist to “add a keyword” without a distinct angle.

---

## 4. Search intent

Record in `brief.primarySearchIntent` / `seo.primaryIntent` and `editorial.searchIntent`.

| Intent | Typical use |
|--------|-------------|
| Informational | How / what / why guides |
| Commercial investigation | Comparing options, checklists before RFQ |
| Transactional | Rare for blogs — usually point to `/request-quote` |

One primary intent per article. Supporting keywords amplify; they do not fork the page into multiple intents.

---

## 5. Blog brief process

Complete **Brief** before long drafting:

1. Primary intent + primary keyword  
2. Supporting topics (not a keyword dump)  
3. Audience + exact reader question  
4. Recommended service + industry links  
5. Competitor notes (what others miss)  
6. Author notes (claims to verify, sources to cite)

Then draft Markdown from the template skeleton (Introduction → considerations → checks → next steps).

---

## 6. Internal linking

- At least one **pillar** service (or industry) link in body or `internalLinks`.
- Prefer descriptive anchors — avoid “click here” / “learn more”.
- Use `relatedSlugs` for sibling articles in the same cluster.
- Editor suggestions come from category + intent (`suggestInternalLinks` / server helpers).
- Do not orphan publish: ensure discovery via `/blogs`, related, featured, or pillar context.

---

## 7. Image requirements

| Asset | Requirement |
|-------|-------------|
| Cover (`cover.image`) | Real operational context when possible; ~1600×900 preferred; **alt required** if URL set |
| Article (`contentImages`) | Alt unless `decorative`; embed via `![alt](media:image-id)` |
| OG | Optional override; otherwise fall back to cover / site defaults |

Avoid logo-as-hero and irrelevant stock. Credit when required.

---

## 8. Source requirements

- Cite primary or professional sources for regulations, Incoterms, customs, certificates, legal/compliance claims (`sources[]` with absolute URLs).
- SEO health warns when such topics lack sources.
- Do not invent statistics. Prefer verifiable references over vague authority claims.

---

## 9. SEO QA

Before publish, confirm:

- [ ] Distinct title / slug (no near-duplicate of an existing post)
- [ ] Excerpt + meta title/description present
- [ ] Single H1 from template; body uses `##`
- [ ] Cover alt; article image alts
- [ ] Primary intent set
- [ ] Pillar internal link + related slug where useful
- [ ] Sources for claim-heavy topics
- [ ] `index`/`follow` intentional
- [ ] Custom canonical only for deliberate republishing cases

Admin checks are **PASS / WARNING / ERROR** — not a vanity score. Length guidance for meta is advisory.

---

## 10. Publishing

Workflow: **draft → review → scheduled → published**.

1. Save draft; validate JSON/schema.  
2. Move to review for second pass.  
3. Schedule or publish; resolve **errors**; override **warnings** only consciously.  
4. Prefer **archive** over delete for formerly public URLs.

---

## 11. Search Console review (manual notes)

No Search Console API is required. After publish, record manually in `searchPerformance`:

| Field | Use |
|-------|-----|
| `targetQueries` | Queries you intended or observed |
| `opportunityNotes` | CTR, impressions, follow-ups |
| `lastReviewedAt` | When you last checked GSC |

Suggested rhythm: Day 14–30 indexing check; Day 30–90 query/click review. Change titles/intros only when data supports it.

---

## 12. Refresh cycle

| Signal | Action |
|--------|--------|
| `editorial.needsRefresh` | Queue rewrite/update |
| `nextReviewAt` due | Review accuracy + links |
| ~180 days since last review/update | Treat published posts as refresh candidates |

After refresh: update content, set `lastReviewedAt`, clear `needsRefresh`, set next `nextReviewAt`. Filter: `/admin/blogs?needsRefresh=true`.

---

## 13. Cannibalization prevention

- One clear primary keyword / intent per URL.
- Before drafting, search existing titles/slugs; heed editor overlap hints (shared significant tokens).
- If two posts compete: merge, differentiate intent, or archive the weaker URL with redirects as needed.
- Do not spin near-duplicate “guides” for the same buyer question.

---

## 14. What NOT to do

- Treat publishing volume as an SEO strategy.
- Ship thin keyword pages without operational value.
- Use fake SEO scores or obsess over exact meta character counts.
- Put planning notes (`brief`, `editorial`, `searchPerformance`, keyword planning fields) into public copy.
- Skip alt text, sources on regulatory claims, or pillar links.
- Soft-delete public URLs without archive/redirect thinking.
- Store admin tokens in `localStorage`.
- Override publish errors without fixing them.

---

## Quick references

- Schema: [BLOG_JSON_SCHEMA.md](./BLOG_JSON_SCHEMA.md)  
- Admin ops: [ADMIN_CMS_GUIDE.md](./ADMIN_CMS_GUIDE.md)  
- Calendar: `/admin/blogs/calendar`  
- SEO Health: `/admin/seo`
