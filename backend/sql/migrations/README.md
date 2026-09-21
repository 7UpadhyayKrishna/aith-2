# SQL migrations (future)

`backend/sql/schema.sql` is the **idempotent bootstrap** applied on API startup
(`CREATE … IF NOT EXISTS` only).

Do **not** put `DROP`, `ALTER`, `TRUNCATE`, or destructive changes in `schema.sql`.
Startup will refuse them.

For schema evolution after soft launch:

1. Add a dated file here, e.g. `20260321_add_blog_field_index.sql`
2. Apply manually against the target database (Supabase SQL editor or `psql`)
3. Optionally introduce Alembic later; keep this folder as the source of ordered SQL

Until then, prefer additive JSONB fields that need no DDL.
