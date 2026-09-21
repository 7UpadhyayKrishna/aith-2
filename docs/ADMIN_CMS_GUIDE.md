# AITH Admin CMS Guide

Operational guide for `/admin` and the blog publishing workflow.

Related: [BLOG_JSON_SCHEMA.md](./BLOG_JSON_SCHEMA.md) · [BLOG_SEO_PLAYBOOK.md](./BLOG_SEO_PLAYBOOK.md)

---

## Admin UI overview

Shell: dark forest sidebar + ivory main chrome, sticky header with breadcrumb, optional **New Blog** action, account menu, and API/DB health dots.

### Sidebar groups

| Section | Routes |
|---------|--------|
| **Overview** | Dashboard (`/admin`) |
| **Content** | Blogs (`/admin/blogs`), Calendar (`/admin/blogs/calendar`) |
| **Operations** | Enquiries, Quote Requests, Careers |
| **SEO** | SEO Health (`/admin/seo`) |
| **System** | Users, Audit Log, System Health |

Collapsible desktop sidebar; mobile drawer. Role-gated: **`admin`** sees Operations (PII) + System; **`editor`** gets blogs, calendar, SEO only (no enquiry/quote/career PII).

### Dashboard

Postgres-backed counts: published / draft / scheduled blogs, ops metrics for admins (open jobs, new/unassigned applications, unassigned enquiries/quotes, needs-attention), pipeline columns, SEO attention list, API / DB / SMTP status (no secrets).

Ops attention indicators are **internal only** — not a contractual customer SLA.

---

## Login / session expiry

1. Open `/admin` on the configured site origin.
2. Sign in with an account from `backend/scripts/create_admin.py` or **Users** (admin).
3. **No public signup.**

**Sessions**

- Auth cookie: HttpOnly `aith_admin_session` (name configurable).
- CSRF: readable cookie `aith_admin_csrf` + `X-CSRF-Token` on mutating requests.
- Idle timeout default **8h**; absolute max **7d** (env-overridable).
- Logout invalidates the session server-side.
- On **401**, the UI surfaces “session expired” and returns to login; blog editor keeps in-memory / `sessionStorage` draft recovery for the current browser tab — **not** auth tokens.

---

## Blog workflow

Preferred path:

**draft → review → scheduled → published** (then **archived** when retiring).

| Status | Use |
|--------|-----|
| `draft` | Writing / JSON prep |
| `review` | Ready for second pass |
| `scheduled` | Future `scheduledAt`; becomes publicly readable when due (no cron required) |
| `published` | Live |
| `archived` | Off index/sitemap; prefer over hard-delete |

Editor actions: Save Draft, move to Review, set schedule, Publish (with checklist). Autosave after idle editing; unsaved navigation warns.

Prefer useful maintained articles over volume. See calendar cadence and [BLOG_SEO_PLAYBOOK.md](./BLOG_SEO_PLAYBOOK.md).

---

## Creating a blog

1. **Blogs → New Blog** (or Dashboard / Calendar quick action).
2. Editor preloads `createBlogTemplate()` (see schema doc).
3. Enter title (slug auto-generates; editable).
4. Write Markdown body. Public template supplies page **H1** — start with `##`.
5. Fill excerpt/subtitle, category, tags, author.
6. Set **cover** image + alt (synced to legacy `featuredImage`).
7. Add **contentImages** and embed with `![alt](media:image-id)`.
8. Complete brief / SEO / internal links / sources as needed.
9. **Save Draft** → **Review** → schedule or **Publish**.

---

## JSON template + JSON toolbar

**JSON** tab tools:

| Action | Behavior |
|--------|----------|
| Validate | Server validate (`forPublish` optional) |
| Apply | Parse JSON → editor state |
| Format | Pretty-print |
| Reset Template | Load exact `createBlogTemplate()` into JSON (not applied until Apply) |
| Import file | Load file into JSON pane |
| Download / Copy | Export current JSON |

See [BLOG_JSON_SCHEMA.md](./BLOG_JSON_SCHEMA.md) for the full object. Use `JSON.parse` only — never evaluate JSON as code.

---

## Cover image + article images

**Cover** (`cover` — not `coverLetter`)

- Eyebrow, headline, deck, and `cover.image` (`url`, `alt`, `caption`, `credit`).
- Recommended ~1600×900; avoid logo-only / generic stock.
- On save, `cover.image` is source of truth; `featuredImage` is mirrored for legacy clients.
- Publish **errors** if cover URL exists without alt.

**Article images** (`contentImages`)

- Up to ~30 assets with stable `id`.
- Embed: `![Descriptive alt](media:image-1)`.
- Alt required unless marked decorative.
- Optional `placement` hint (e.g. `after:introduction`).

---

## Content brief

Internal-only **Brief** panel (`brief` + mirrored editorial fields):

- Primary search intent / keyword / supporting topics
- Audience + reader question
- Recommended service + industry links
- Competitor + author notes

Fill the brief before deep drafting. Brief is **never** public.

---

## Publishing calendar

Route: `/admin/blogs/calendar`

Lightweight board: Draft · In review · Scheduled · Published · Refresh due.

Guidance shown in UI: **~3 substantial new articles / month + 1 meaningful refresh**. Adjust to quality capacity — **frequency alone is not an SEO strategy.**

Links through to filtered blog lists (`?status=` / `?needsRefresh=true`).

---

## Refresh workflow

Internal fields on `editorial`:

| Field | Purpose |
|-------|---------|
| `lastReviewedAt` | Last substantive content review (ISO) |
| `nextReviewAt` | Next planned review |
| `needsRefresh` | Manual “due for refresh” flag |

**Refresh due** when: `needsRefresh` is true, or `nextReviewAt` ≤ now, or published content older than ~180 days since last review / update / publish.

Filter: `/admin/blogs?needsRefresh=true`. SEO Health also surfaces refresh counts.

After refreshing: update body/meta as needed, clear `needsRefresh`, set `lastReviewedAt`, set next `nextReviewAt`.

---

## SEO warnings (no fake scores)

Admin SEO health uses discrete checks: **PASS / WARNING / ERROR**.

There is **no** 0–100 “SEO score.” Character-length meta guidance is advisory. Errors block publish; warnings may be overridden consciously.

SEO Health (`/admin/seo`): published/draft/scheduled/refresh/review counts, missing metadata/alt, canonical overrides, noindex published, orphan candidates, post-publish checklist links (sitemap, Search Console, rich results).

---

## Post-publish checklist

From SEO Health / ops:

1. **Day 0** — Verify live URL, canonical, BlogPosting schema, images, sitemap eligibility, internal links.
2. **Day 14–30** — Check indexing / impressions in Search Console; note queries in `searchPerformance`.
3. **Day 30–90** — Review clicks/queries; change title/intro only if data supports it.
4. **~6 months** — Content review (`lastReviewedAt` / `nextReviewAt`).

Also: confirm related slugs, pillar service link, and that the post is discoverable from `/blogs` or related content.

---

## Importing blogs

`/admin/blogs/import` accepts a JSON **array**.

1. Upload / paste  
2. Dry-run validation  
3. Confirm only when all records pass  

Partial import of a failing batch is blocked.

---

## Publishing & scheduling

**Publish** runs validation + SEO checks.

- **Errors** block  
- **Warnings** may be overridden  
- Meta length folklore does not hard-block alone  

Set future `scheduledAt` → status `scheduled`. Elapsed schedules become publicly readable without a background job.

### Slugs

Changing slug on a **published** post stores the old slug in `blog_redirects`. Prefer archive over casual hard-delete.

### Revisions

Meaningful saves / publish create revisions (`blog_revisions`, capped). View/restore from the editor.

---

## Password policy

- Length **15–128** characters (passphrase preferred over complex short passwords).
- Hashed with **Argon2id**.
- Enforced on user create / password change (`ADMIN_MIN_PASSWORD_LENGTH` / `ADMIN_MAX_PASSWORD_LENGTH` override only if intentionally configured).

---

## Security notes

- Session: **HttpOnly** cookie — **do not** store auth tokens in `localStorage`.
- CSRF: cookie + `X-CSRF-Token` header on mutations.
- Unsaved blog recovery may use **sessionStorage** for draft JSON only — never credentials.
- `/admin` is `noindex`; robots Disallow is **not** the security boundary — authentication is.
- MFA (TOTP) is P1 hardening — not required this phase.
- Production: `ADMIN_SESSION_SECRET` (32+ chars) **required from environment** when `APP_ENV=production` — no file fallback, no generated-on-boot secret. Dev-only fallback: `backend/.admin_session_secret`.
- Account → Security (`/admin/account/security`): list sessions, revoke other sessions (tokens never shown). MFA section appears only when `ADMIN_MFA_ENABLED`.
- Local: leave `REACT_APP_API_URL` empty so `setupProxy.js` forwards `/api` → `http://127.0.0.1:8000`.

---

## Enquiries / quotes / careers (ops console)

Full-page record views (not drawers): ownership, status workflow, append-only internal notes, activity timeline, outbound reply (SMTP when configured), email message history for AITH-sent mail.

### Ownership

Fields: `assignedTo`, `assignedAt`, `assignedBy` (+ display name). Assign to me / assign to admin / unassign. **PII records may only be assigned to `admin` users** (not content editors). Every change is audited and timeline-logged.

### Statuses (validated; no free-text)

| Domain | Statuses |
|--------|----------|
| Enquiries | `new` `read` `in_progress` `resolved` `archived` |
| Quotes | `new` `reviewing` `responded` `closed` `archived` |
| Applications | `new` `reviewing` `shortlisted` `interview` `rejected` `hired` `archived` |

### List tools

Filters: status, assignee, unassigned, needs attention, date (+ quote destination/type; careers job/team/stage). Bulk: assign, change status, archive (confirm), CSV export. Original customer submission fields are never bulk-edited.

### Reply workflow

Admin compose → backend SMTP send → log `ops_messages` + timeline. If SMTP is not configured: UI shows **Email delivery is not configured** and offers copy email / copy response — no silent mailto fallback as the primary path.

### Jobs CMS

Routes: `/admin/careers/jobs`, `/admin/careers/jobs/new`, `/admin/careers/jobs/:id`.

Fields include basics, blurb, `descriptionMarkdown`, responsibilities/requirements, optional salary band, optional deadline, cover image URL/alt, status `draft|published|archived`.

- **Public board:** `GET /api/careers/jobs` — published + still accepting applications only. Empty success → intentional empty state (no static `careers.js` sync).
- **Public detail:** `/careers/:slug` via `GET /api/careers/jobs/{slug}`. Closed/expired/archived roles return an **archived-style page** (`acceptingApplications: false`), not 404. Drafts are 404.
- **Apply:** form must send `jobId`; backend validates job exists and is accepting applications; persists trusted `jobTitle`/`jobSlug` from DB.
- **`seed-defaults`:** one-time import helper only — not ongoing sync. After CMS adoption, **database is source of truth**. Static `frontend/src/data/careers.js` is bootstrap/fallback for API **failure** only.

---

## Users / permissions

| Role | Access |
|------|--------|
| `admin` | Everything including ops PII, jobs CMS, users, audit, system |
| `editor` | Blogs + calendar + SEO content health only |

---

## Scripts

```bash
cd backend
py -3 scripts/create_admin.py
py -3 scripts/seed_blogs.py          # idempotent by slug
py -3 scripts/seed_blogs.py --update # refresh seed content
py -3 scripts/apply_schema.py        # idempotent CREATE IF NOT EXISTS
```

RLS (one-time): apply `backend/sql/migrations/20260921_enable_rls.sql` in Supabase SQL editor. Verify with:

```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('job_postings','contact_submissions','ops_activity','ops_notes','ops_messages');
```

---

## Dynamic blog sitemap

`GET /api/blog-sitemap.xml`

Production should proxy `/blog-sitemap.xml` → FastAPI `/api/blog-sitemap.xml`. Static SPA routes cannot serve a live Postgres sitemap.
