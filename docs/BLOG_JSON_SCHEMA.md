# AITH Blog JSON Schema

Canonical shape for New Blog preload, JSON editor reset, single-blog JSON mode, and bulk import.

**Keep in sync with:** `frontend/src/data/blogTemplate.js` (`createBlogTemplate`) and `backend/cms/blog_models.py`.

---

## Exact preloaded template

This is the object returned by `createBlogTemplate()` (and the JSON shown by **Reset Template**):

```json
{
  "title": "",
  "slug": "",
  "subtitle": "",
  "excerpt": "",
  "category": "Global Sourcing",
  "tags": [],
  "author": {
    "type": "Organization",
    "name": "AITH Editorial Team",
    "url": null
  },
  "cover": {
    "eyebrow": "TRADE JOURNAL",
    "headline": "",
    "deck": "",
    "image": {
      "url": "",
      "alt": "",
      "caption": "",
      "credit": ""
    }
  },
  "featuredImage": {
    "url": "",
    "alt": "",
    "caption": ""
  },
  "contentMarkdown": "## Introduction\n\nWrite a clear opening that immediately answers why this topic matters to the reader.\n\n## Key Considerations\n\nOutline the practical factors buyers or operators should weigh before acting.\n\n## What Buyers Should Check\n\nList concrete verification points, documents, or decision criteria.\n\n## Practical Next Steps\n\nClose with actionable next steps and link to the relevant AITH service or industry page.\n",
  "contentImages": [
    {
      "id": "image-1",
      "url": "",
      "alt": "",
      "caption": "",
      "credit": "",
      "placement": "after:introduction",
      "decorative": false
    }
  ],
  "status": "draft",
  "featured": false,
  "publishedAt": null,
  "scheduledAt": null,
  "seo": {
    "primaryIntent": "",
    "primaryKeyword": "",
    "supportingKeywords": [],
    "metaTitle": "",
    "metaDescription": "",
    "canonicalUrl": null,
    "index": true,
    "follow": true,
    "ogTitle": "",
    "ogDescription": "",
    "ogImage": {
      "url": "",
      "alt": ""
    }
  },
  "internalLinks": [
    {
      "anchor": "",
      "url": "",
      "reason": ""
    }
  ],
  "relatedSlugs": [],
  "sources": [
    {
      "label": "",
      "url": ""
    }
  ],
  "editorial": {
    "contentType": "evergreen",
    "searchIntent": "informational",
    "audience": "",
    "readerQuestion": "",
    "recommendedServiceLink": "",
    "recommendedIndustryLink": "",
    "competitorNotes": "",
    "authorNotes": "",
    "lastReviewedAt": null,
    "nextReviewAt": null,
    "needsRefresh": false
  },
  "searchPerformance": {
    "targetQueries": [],
    "opportunityNotes": "",
    "lastReviewedAt": null
  },
  "brief": {
    "primarySearchIntent": "",
    "primaryKeyword": "",
    "supportingTopics": [],
    "audience": "",
    "readerQuestion": "",
    "recommendedServiceLink": "",
    "recommendedIndustryLink": "",
    "competitorNotes": "",
    "authorNotes": ""
  }
}
```

---

## Field visibility

| Visibility | Fields |
|------------|--------|
| **PUBLIC** (API + rendered article when published/scheduled-due) | `title`, `slug`, `subtitle`, `excerpt`, `contentMarkdown`, `category`, `tags`, `author`, `cover`, `featuredImage`, `contentImages`, `status`, `featured`, `publishedAt`, `scheduledAt`, `createdAt`, `updatedAt`, `relatedSlugs`, `sources`, `internalLinks` |
| **PUBLIC SEO subset** | `seo.metaTitle`, `seo.metaDescription`, `seo.canonicalUrl`, `seo.index`, `seo.follow`, `seo.ogTitle`, `seo.ogDescription`, `seo.ogImage` |
| **SEO planning (admin / JSON; stripped from public `seo`)** | `seo.primaryIntent`, `seo.primaryKeyword`, `seo.supportingKeywords` |
| **INTERNAL-ONLY** (never on public blog payload) | `editorial`, `brief`, `searchPerformance` |

System fields **never trusted from client on write:** `_id`, `id`, `createdAt`, `updatedAt`, ownership fields.

---

## Field reference

| Field | Required | Notes |
|-------|----------|--------|
| `title` | yes (publish) | Max ~200 chars |
| `slug` | yes* | Lowercase hyphenated; auto from title if omitted; unique; reserved Insights/system slugs blocked |
| `subtitle` | no | Deck under title; can satisfy excerpt requirement at publish |
| `excerpt` | publish | Short summary / deck |
| `contentMarkdown` | publish | Prefer starting with `##` (page supplies H1). Max ~200k chars |
| `category` | recommended | Controlled list below |
| `tags` | no | Array of short strings (cap ~20) |
| `author` | yes | `{ type: "Organization"\|"Person", name, url? }` |
| `cover` | recommended | Editorial hero — **not** a recruitment cover letter. See below |
| `featuredImage` | legacy | Mirror of `cover.image` for older clients; **prefer `cover.image`** |
| `contentImages` | no | In-article assets; embed via `media:image-id` (cap ~30) |
| `status` | no | See statuses; create defaults to `draft` |
| `featured` | no | boolean |
| `publishedAt` | server | ISO; set on publish |
| `scheduledAt` | no | Future ISO → `scheduled` |
| `seo` | publish | Meta + planning fields |
| `internalLinks` | recommended | Structured link plan `[{ anchor, url, reason }]` |
| `relatedSlugs` | no | Other blog slugs |
| `sources` | recommended for claims | `[{ label, url }]` — absolute URLs |
| `editorial` | internal | Refresh + planning metadata |
| `brief` | internal | Pre-write content brief |
| `searchPerformance` | internal | Manual Search Console notes |

\*Slug required after normalization.

### `cover` (NOT `coverLetter`)

Editorial cover / hero block:

| Path | Notes |
|------|--------|
| `cover.eyebrow` | Default `TRADE JOURNAL` |
| `cover.headline` | Usually mirrors or refines title |
| `cover.deck` | Supporting line under headline |
| `cover.image.url` | Cover image URL (relative `/…` or absolute) |
| `cover.image.alt` | **Required when url is set** (publish blocks missing alt) |
| `cover.image.caption` / `credit` | Optional |

**`featuredImage`:** legacy mirror of `cover.image` (`url`, `alt`, `caption`). On save, `cover.image` is source of truth; `featuredImage` is synced for API compatibility.

### `contentImages[]`

| Field | Notes |
|-------|--------|
| `id` | Stable id for markdown embeds (e.g. `image-1`) |
| `url` | Image URL |
| `alt` | Required unless `decorative: true` |
| `caption` / `credit` | Optional |
| `placement` | Editorial hint (e.g. `after:introduction`) |
| `decorative` | If true, alt may be empty |

### `seo`

| Field | Visibility | Notes |
|-------|------------|--------|
| `primaryIntent` | planning | Search intent phrase |
| `primaryKeyword` | planning | Focus query |
| `supportingKeywords` | planning | Array |
| `metaTitle` | public | Required to publish (falls back to title checks) |
| `metaDescription` | public | Required to publish |
| `canonicalUrl` | public | Usually `null` (default `SITE_ORIGIN/blogs/{slug}`) |
| `index` / `follow` | public | booleans |
| `ogTitle` / `ogDescription` | public | optional overrides |
| `ogImage` | public | `{ url, alt }` (legacy string URL still accepted) |

### `editorial` (internal)

| Field | Notes |
|-------|--------|
| `contentType` | Default `evergreen` |
| `searchIntent` | Default `informational` |
| `audience`, `readerQuestion` | Planning |
| `recommendedServiceLink` / `recommendedIndustryLink` | Pillar URLs |
| `competitorNotes` / `authorNotes` | Internal only |
| `lastReviewedAt` / `nextReviewAt` | ISO review dates |
| `needsRefresh` | Manual flag; **not** a public status |

### `brief` (internal)

Pre-write brief: `primarySearchIntent`, `primaryKeyword`, `supportingTopics[]`, `audience`, `readerQuestion`, `recommendedServiceLink`, `recommendedIndustryLink`, `competitorNotes`, `authorNotes`.

### `searchPerformance` (internal)

Manual Search Console notes — no API integration required: `targetQueries[]`, `opportunityNotes`, `lastReviewedAt`.

---

## Statuses

| Status | Meaning |
|--------|---------|
| `draft` | Work in progress; not public |
| `review` | Ready for editorial review |
| `scheduled` | Will go live when `scheduledAt` ≤ now (no background job required) |
| `published` | Public |
| `archived` | Removed from public index / sitemap |

`editorial.needsRefresh` is an **internal flag**, not a status.

---

## Categories

- Global Sourcing
- Supplier Sourcing
- Import & Export
- Procurement
- Trade Documentation
- Logistics
- Quality & Compliance
- Industry Guides

Unknown category → **warning** (not always blocking).

---

## `media:image-id` markdown syntax

Embed a `contentImages` entry by id:

```markdown
![Factory floor inspection](media:image-1)
```

At render time the public/admin article view resolves `media:{id}` to the matching `contentImages[].url` (and uses the markdown alt, falling back to the asset alt).

Editor **Copy markdown** / insert helpers produce this form when an image has an `id`.

---

## Validation path examples

Errors and warnings use dotted paths:

| Path | Example |
|------|---------|
| `title` | Title required to publish |
| `slug` | Invalid or reserved slug |
| `excerpt` | Excerpt (or subtitle) required to publish |
| `contentMarkdown` | Body H1 warning; short body warning |
| `cover.image.url` | Invalid image URL |
| `cover.image.alt` | Required when cover URL exists |
| `featuredImage.url` | Invalid legacy image URL |
| `contentImages[0].url` | Invalid article image URL |
| `contentImages[1].alt` | Alt required unless decorative |
| `seo.metaTitle` | Required to publish; length >70 → warning |
| `seo.metaDescription` | Required to publish; length >160 → warning |
| `seo.canonicalUrl` | Invalid URL |
| `seo.ogImage.url` | Invalid URL |
| `author.name` | Author name required |
| `author.url` | Invalid author URL |
| `internalLinks[0].url` | Invalid URL |
| `internalLinks[0].anchor` | Generic anchor (“click here”) → warning |
| `sources[0].url` | Invalid absolute URL |
| `category` | Unknown category → warning |
| `tags[2]` | Tag cleanup / limits |

Rules summary:

- Publish requires title, excerpt (or subtitle), content, author, SEO meta (or fallbacks), cover alt when cover URL present
- Body H1 (`# `) → **warning**
- Meta length over ~70 / ~160 → **warning** only (never sole hard-block)
- Use `JSON.parse` + schema validation — never `eval`

---

## Bulk import

```json
[
  { "title": "...", "slug": "...", "excerpt": "...", "contentMarkdown": "## ...", "category": "Global Sourcing", "author": { "type": "Organization", "name": "AITH Editorial Team" }, "seo": { "metaTitle": "...", "metaDescription": "..." } },
  { "title": "...", "slug": "...", "excerpt": "...", "contentMarkdown": "## ...", "category": "Supplier Sourcing", "author": { "type": "Organization", "name": "AITH Editorial Team" }, "seo": { "metaTitle": "...", "metaDescription": "..." } }
]
```

Endpoint: `POST /api/admin/blogs/import` with `{ "blogs": [...], "dryRun": true }` then `{ "dryRun": false, "confirm": true }`.
