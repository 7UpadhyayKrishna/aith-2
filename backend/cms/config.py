"""CMS / admin configuration — no secrets logged."""
from __future__ import annotations

import logging
import os
import secrets
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

# Session cookie
SESSION_COOKIE = os.environ.get('ADMIN_SESSION_COOKIE', 'aith_admin_session')
CSRF_COOKIE = os.environ.get('ADMIN_CSRF_COOKIE', 'aith_admin_csrf')
CSRF_HEADER = 'X-CSRF-Token'

# Timeouts (seconds)
SESSION_IDLE_SECONDS = int(os.environ.get('ADMIN_SESSION_IDLE_SECONDS', str(60 * 60 * 8)))  # 8h idle
SESSION_ABSOLUTE_SECONDS = int(os.environ.get('ADMIN_SESSION_ABSOLUTE_SECONDS', str(60 * 60 * 24 * 7)))  # 7d

# Cookie flags
COOKIE_SECURE = os.environ.get('ADMIN_COOKIE_SECURE', '').lower() in ('1', 'true', 'yes')
COOKIE_SAMESITE = os.environ.get('ADMIN_COOKIE_SAMESITE', 'lax')  # lax | strict | none
COOKIE_PATH = '/'

# Site origin for canonical / sitemap
SITE_ORIGIN = os.environ.get('SITE_ORIGIN', 'https://aithinternational.com').rstrip('/')

# Revision retention
BLOG_REVISION_CAP = int(os.environ.get('BLOG_REVISION_CAP', '30'))

# Pagination
MAX_PAGE_SIZE = 50
DEFAULT_PAGE_SIZE = 20

# Markdown size guard (chars)
MAX_MARKDOWN_CHARS = 200_000

# Login rate limit (stricter than form submissions)
LOGIN_RATE_WINDOW = 60
LOGIN_RATE_MAX = 5
# Per-account soft lockout (in-process; edge limits still preferred)
LOGIN_ACCOUNT_WINDOW = 900  # 15 minutes
LOGIN_ACCOUNT_MAX = 10

# Roles
ROLE_ADMIN = 'admin'
ROLE_EDITOR = 'editor'

BLOG_CATEGORIES = [
    'Global Sourcing',
    'Supplier Sourcing',
    'Import & Export',
    'Procurement',
    'Trade Documentation',
    'Logistics',
    'Quality & Compliance',
    'Industry Guides',
]

# Public statuses. Internal flag editorial.needsRefresh is separate (not a public status).
BLOG_STATUSES = ('draft', 'review', 'scheduled', 'published', 'archived')

# Strong passphrase policy (same everywhere). Prefer length over character-class rules.
# Override only via ADMIN_MIN_PASSWORD_LENGTH if a controlled environment truly requires it.
MIN_PASSWORD_LENGTH = int(os.environ.get('ADMIN_MIN_PASSWORD_LENGTH', '15'))
MAX_PASSWORD_LENGTH = int(os.environ.get('ADMIN_MAX_PASSWORD_LENGTH', '128'))

# Bump when policy strengthens. Legacy accounts get mustChangePassword via migration script.
PASSWORD_POLICY_VERSION = 2

# MFA (TOTP) — optional until enabled. Do not invent crypto; use pyotp when enabled.
MFA_ENABLED = os.environ.get('ADMIN_MFA_ENABLED', '').lower() in ('1', 'true', 'yes')
MFA_REQUIRED_FOR_ADMIN = os.environ.get('ADMIN_MFA_REQUIRED', '').lower() in ('1', 'true', 'yes')

# Reserved slugs that collide with Insights / static routes
RESERVED_BLOG_SLUGS = {
    'commodity-markets',
    'trade-documents',
    'bulk-procurement',
    'admin',
    'rss',
    'rss.xml',
}

# App version (safe identifier for health / System page)
APP_VERSION = os.environ.get('APP_VERSION') or os.environ.get('GIT_SHA') or os.environ.get('COMMIT_SHA') or 'dev'


def is_production() -> bool:
    env = (os.environ.get('APP_ENV') or os.environ.get('ENVIRONMENT') or '').strip().lower()
    return env in ('production', 'prod', 'live')


def ensure_session_secret() -> str:
    """
    Return ADMIN_SESSION_SECRET.

    Production: missing or short secret fails startup (no ephemeral fallback).
    Development: ephemeral secret allowed with a warning (sessions reset on restart).
    Never generate a new secret on every boot in production — that invalidates all sessions.
    """
    secret = os.environ.get('ADMIN_SESSION_SECRET', '').strip()
    if secret and len(secret) >= 32:
        return secret

    if is_production():
        logger.error(
            'ADMIN_SESSION_SECRET missing or shorter than 32 characters. '
            'Refusing to start in production with an ephemeral/insecure secret.'
        )
        sys.exit(
            'FATAL: Set ADMIN_SESSION_SECRET to a cryptographically random string '
            'of at least 32 characters before starting in production.'
        )

    logger.warning(
        'ADMIN_SESSION_SECRET missing or too short — using ephemeral secret (dev only). '
        'Sessions reset on restart. Set a 32+ char secret for stable sessions.'
    )
    return secrets.token_hex(32)


def validate_production_security() -> list[str]:
    """
    Return list of fatal production misconfigurations.
    Caller should refuse to start (or disable admin) when non-empty.
    """
    errors: list[str] = []
    if not is_production():
        return errors

    secret = os.environ.get('ADMIN_SESSION_SECRET', '').strip()
    if not secret or len(secret) < 32:
        errors.append('ADMIN_SESSION_SECRET must be set to ≥32 characters in production')

    if not COOKIE_SECURE:
        errors.append('ADMIN_COOKIE_SECURE must be true in production (HTTPS)')

    cors = os.environ.get('CORS_ORIGINS', '').strip()
    if not cors or cors == '*' or '*' in [o.strip() for o in cors.split(',')]:
        errors.append('CORS_ORIGINS must be an explicit allowlist in production (no *)')

    if not os.environ.get('MONGO_URL', '').strip():
        errors.append('MONGO_URL is required')

    if not os.environ.get('DB_NAME', '').strip():
        errors.append('DB_NAME is required')

    return errors


SESSION_SECRET = ensure_session_secret()
