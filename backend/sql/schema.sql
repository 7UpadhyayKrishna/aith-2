-- AITH CMS schema for Supabase Postgres (JSONB document tables).
-- Idempotent only: CREATE TABLE/INDEX IF NOT EXISTS.
-- Startup (ensure_schema) REJECTS DROP / ALTER / TRUNCATE / CREATE OR REPLACE.
-- Future non-idempotent changes: add dated files under backend/sql/migrations/
-- and apply manually (or via Alembic) — never auto-run destructive DDL on boot.
-- Apply: py -3 scripts/apply_schema.py  (also runs on API startup)

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_revisions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_redirects (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS quote_submissions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS career_submissions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS job_postings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Append-only ops timeline / notes / outbound messages (JSONB documents)
CREATE TABLE IF NOT EXISTS ops_activity (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS ops_notes (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS ops_messages (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- Unique / lookup indexes (expression on JSONB)
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_uidx
  ON admin_users ((lower(data->>'email')));

CREATE UNIQUE INDEX IF NOT EXISTS admin_sessions_hash_uidx
  ON admin_sessions ((data->>'sessionHash'));

CREATE INDEX IF NOT EXISTS admin_sessions_user_idx
  ON admin_sessions ((data->>'userId'));

CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx
  ON admin_sessions ((data->>'expiresAt'));

CREATE UNIQUE INDEX IF NOT EXISTS blogs_slug_uidx
  ON blogs ((data->>'slug'));

CREATE INDEX IF NOT EXISTS blogs_status_published_idx
  ON blogs ((data->>'status'), (data->>'publishedAt') DESC);

CREATE INDEX IF NOT EXISTS blogs_updated_idx
  ON blogs ((data->>'updatedAt') DESC);

CREATE INDEX IF NOT EXISTS blog_revisions_blog_idx
  ON blog_revisions ((data->>'blogId'), (data->>'timestamp') DESC);

CREATE UNIQUE INDEX IF NOT EXISTS blog_redirects_from_uidx
  ON blog_redirects ((data->>'fromSlug'));

CREATE INDEX IF NOT EXISTS audit_timestamp_idx
  ON admin_audit_logs ((data->>'timestamp') DESC);

CREATE INDEX IF NOT EXISTS audit_user_idx
  ON admin_audit_logs ((data->>'adminUserId'));

CREATE INDEX IF NOT EXISTS audit_action_idx
  ON admin_audit_logs ((data->>'action'));

CREATE INDEX IF NOT EXISTS contact_created_idx
  ON contact_submissions ((data->>'createdAt') DESC);

CREATE INDEX IF NOT EXISTS contact_status_idx
  ON contact_submissions ((data->>'internalStatus'));

CREATE INDEX IF NOT EXISTS quote_created_idx
  ON quote_submissions ((data->>'createdAt') DESC);

CREATE INDEX IF NOT EXISTS quote_status_idx
  ON quote_submissions ((data->>'internalStatus'));

CREATE INDEX IF NOT EXISTS career_created_idx
  ON career_submissions ((data->>'createdAt') DESC);

CREATE INDEX IF NOT EXISTS career_status_idx
  ON career_submissions ((data->>'internalStatus'));

CREATE INDEX IF NOT EXISTS contact_assigned_idx
  ON contact_submissions ((data->>'assignedTo'));

CREATE INDEX IF NOT EXISTS quote_assigned_idx
  ON quote_submissions ((data->>'assignedTo'));

CREATE INDEX IF NOT EXISTS career_assigned_idx
  ON career_submissions ((data->>'assignedTo'));

CREATE UNIQUE INDEX IF NOT EXISTS job_postings_slug_uidx
  ON job_postings ((lower(data->>'slug')));

CREATE INDEX IF NOT EXISTS job_postings_status_idx
  ON job_postings ((data->>'status'), (data->>'postedAt') DESC);

CREATE INDEX IF NOT EXISTS job_postings_updated_idx
  ON job_postings ((data->>'updatedAt') DESC);

CREATE INDEX IF NOT EXISTS ops_activity_record_idx
  ON ops_activity ((data->>'recordType'), (data->>'recordId'), (data->>'createdAt'));

CREATE INDEX IF NOT EXISTS ops_notes_record_idx
  ON ops_notes ((data->>'recordType'), (data->>'recordId'), (data->>'createdAt'));

CREATE INDEX IF NOT EXISTS ops_messages_record_idx
  ON ops_messages ((data->>'recordType'), (data->>'recordId'), (data->>'sentAt') DESC);

-- RLS (ALTER … ENABLE ROW LEVEL SECURITY) is NOT run on startup.
-- Apply once: backend/sql/migrations/20260921_enable_rls.sql
-- (Table owner / service role used by DATABASE_URL bypasses RLS; anon cannot.)
