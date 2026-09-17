# AITH — Rollback Plan

Procedures to reverse a bad release. Assumes the **hardened codebase** and owner-managed hosts (Vercel SPA + FastAPI/Mongo). No claim that production is currently live or that a specific PaaS is configured.

**Related:** `PRODUCTION_RUNBOOK.md`, `GO_LIVE_REPORT.md`

---

## 1. When to roll back

- Healthcheck fails after deploy (`GET /api/health` not JSON / `database: false`)
- Forms or admin auth broken in production
- Frontend white-screen / critical route 404s on previously working paths
- Accidental wildcard CORS or insecure cookie flags in production (prefer **fix-forward** if safe; roll back if unclear)
- Bad blog publish wave that cannot be fixed quickly via CMS

Prefer **forward fix** for typos and content. Prefer **rollback** for broken builds, bad env, or API crashes.

---

## 2. Frontend rollback (Vercel)

1. Open the Vercel project → **Deployments**.
2. Select the last known-good deployment (note commit SHA / build time).
3. Use **Promote to Production** / Instant Rollback (Vercel UI wording may vary).
4. Verify:
   - Homepage brand + hero
   - Critical routes from sitemap (services / industries / contact)
   - `/admin` still loads shell (API may be separate)
   - Bundle hash / Last-Modified changed as expected
5. If `vercel.json` rewrites were wrong, rolling back the frontend alone may restore SPA behaviour but **not** fix a down API — check API next.

**Note:** Env vars on Vercel are project-scoped. Rolling back a deployment does **not** always undo env changes made in the dashboard — revert those manually if needed (`REACT_APP_API_URL`, legal draft flag).

---

## 3. Backend rollback (image / commit + env)

There is no single vendor assumed. Generic steps:

1. Identify previous good **git commit** or container image tag that passed health + smoke.
2. Redeploy that revision to the API host (platform “previous deploy”, or redeploy tagged image / checkout + restart).
3. Restore matching **env** if the bad release changed secrets or flags (see §5).
4. Confirm:
   - `GET /api/health` → JSON `status: ok`, `database: true`
   - Admin login (if CMS in use)
   - One Contact or Quote POST → Mongo row
5. Tail logs for startup fatals (`ADMIN_SESSION_SECRET`, CORS, cookie secure).

If Mongo data was written by the bad release, rolling back code does **not** delete those documents — handle data separately (§4, §7).

---

## 4. Database considerations

- This project **does not assume destructive schema migrations**. Indexes are created idempotently on startup.
- Rolling back the API binary is usually safe relative to Mongo document shapes used by older compatible commits in the same major line.
- **Do not** drop collections or restore over production without a written decision and backup.
- Enquiry / quote / career documents written during an incident remain unless you deliberately purge (rare; prefer status notes in admin).

### Blog content

Prefer non-destructive recovery:

1. **CMS revisions** — restore a prior revision for the affected post (`blog_revisions`, capped by `BLOG_REVISION_CAP`, default 30).
2. **JSON export / re-import** — export good copies before bulk ops; re-import via admin import tools or seed JSON patterns under `backend/scripts/seed_data/`.
3. **Unpublish / archive** — remove bad public content quickly without deleting history.
4. Redirects — remapped slugs use `/api/blog-redirects/{slug}` (HTTP 301); fix or remove redirect docs if a remap was wrong.

Full cluster restore is last resort and must be owned by the Mongo backup owner named in the runbook.

---

## 5. Environment rollback

| Change | Rollback action | Side effect |
|--------|-----------------|-------------|
| Wrong `CORS_ORIGINS` | Restore previous explicit allowlist; restart API | Brief CORS failures until restart |
| Wrong `SITE_ORIGIN` | Restore value matching real DNS; restart; may need frontend rebuild if sitemap baked | Sitemap / canonical URLs |
| `REACT_APP_*` | Revert Vercel env + **redeploy** frontend (build-time) | Stale clients until redeploy |
| SMTP vars | Restore previous complete set or accept notify-disabled | `notificationStatus` behaviour |
| `APP_ENV` | Keep `production` in prod; never “fix” by switching to development | Dev ephemeral secret path is unsafe |

Document the pre-change values **before** editing production env (password manager / change ticket — no secrets in git).

---

## 6. Session secret change impact

Changing `ADMIN_SESSION_SECRET` (or rolling back **to** a different secret than currently hashed cookies expect):

- **Invalidates all admin sessions immediately** after restart
- Users must log in again
- Does **not** change passwords or Mongo blog data

If you roll back the API but leave a **new** secret in env (or vice versa), sessions still drop once. Coordinate secret + binary so you do not thrash logins twice.

Compromise response: rotate secret (runbook §7), force password resets as needed, review `admin_audit_logs`.

---

## 7. Blog content rollback summary

| Method | Use when |
|--------|----------|
| Revision restore | Single/few posts, recent edit |
| Unpublish / archive | Need public removal fast |
| JSON re-import | Bulk restore from known export |
| Mongo restore | Catastrophic loss only |

Always export JSON before large import/bulk publish operations.

---

## 8. When NOT to mark PRODUCTION LIVE

Do **not** declare production live, soft launch complete, or Search Console “ready” if any of the following remain true:

1. Canonical DNS / `SITE_ORIGIN` still mismatch or NXDOMAIN  
2. Production `/api/health` is missing or returns SPA HTML  
3. Contact/Quote not Mongo-durable on the **live** API  
4. `CORS_ORIGINS=*` or missing `ADMIN_SESSION_SECRET` / `ADMIN_COOKIE_SECURE` on a production-labelled API  
5. Live frontend bundle older than the release you are signing off  
6. Privacy/Terms still draft **without** counsel approval **or** written soft-launch waiver  
7. No named owner for Mongo backups / failed-notification monitoring  
8. Rollback of the incident is incomplete or unverified  

Code can be **CODE HARDENED** while launch state remains **DEPLOYMENT BLOCKED**. See `GO_LIVE_REPORT.md`.
