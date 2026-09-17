"""Password hashing (Argon2id), session tokens, CSRF helpers."""
from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
from fastapi import HTTPException, Request, Response

from cms import config

_ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=2,
    hash_len=32,
    salt_len=16,
)


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _ph.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def needs_rehash(password_hash: str) -> bool:
    try:
        return _ph.check_needs_rehash(password_hash)
    except Exception:
        return False


def new_session_token() -> str:
    return secrets.token_urlsafe(48)


def hash_session_token(token: str) -> str:
    return hmac.new(
        config.SESSION_SECRET.encode('utf-8'),
        token.encode('utf-8'),
        hashlib.sha256,
    ).hexdigest()


def new_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return utcnow().isoformat()


def parse_iso(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except (TypeError, ValueError):
        return None


def set_session_cookies(response: Response, session_token: str, csrf_token: str) -> None:
    common = {
        'httponly': True,
        'secure': config.COOKIE_SECURE,
        'samesite': config.COOKIE_SAMESITE,
        'path': config.COOKIE_PATH,
        'max_age': config.SESSION_ABSOLUTE_SECONDS,
    }
    response.set_cookie(config.SESSION_COOKIE, session_token, **common)
    # CSRF readable by JS for custom header
    response.set_cookie(
        config.CSRF_COOKIE,
        csrf_token,
        httponly=False,
        secure=config.COOKIE_SECURE,
        samesite=config.COOKIE_SAMESITE,
        path=config.COOKIE_PATH,
        max_age=config.SESSION_ABSOLUTE_SECONDS,
    )


def clear_session_cookies(response: Response) -> None:
    response.delete_cookie(config.SESSION_COOKIE, path=config.COOKIE_PATH)
    response.delete_cookie(config.CSRF_COOKIE, path=config.COOKIE_PATH)


def require_csrf(request: Request) -> None:
    """Double-submit cookie + header for state-changing methods."""
    if request.method in ('GET', 'HEAD', 'OPTIONS'):
        return
    cookie = request.cookies.get(config.CSRF_COOKIE, '')
    header = request.headers.get(config.CSRF_HEADER, '')
    if not cookie or not header or not hmac.compare_digest(cookie, header):
        raise HTTPException(status_code=403, detail='CSRF validation failed')


def check_origin(request: Request) -> None:
    """Reject cross-site state-changing requests when Origin is present."""
    if request.method in ('GET', 'HEAD', 'OPTIONS'):
        return
    origin = request.headers.get('origin')
    if not origin:
        # Non-browser clients / same-origin navigations may omit Origin
        return
    allowed = [
        o.strip()
        for o in os_environ_cors()
        if o.strip() and o.strip() != '*'
    ]
    if not allowed:
        return
    if origin.rstrip('/') not in [a.rstrip('/') for a in allowed]:
        raise HTTPException(status_code=403, detail='Origin not allowed')


def os_environ_cors() -> list:
    import os

    raw = os.environ.get('CORS_ORIGINS', '').strip()
    if not raw:
        return []
    return [o.strip() for o in raw.split(',') if o.strip()]


def public_user(doc: dict) -> dict[str, Any]:
    # mustChangePassword is set explicitly by migration / reset scripts — never inferred from Argon2.
    policy_ver = int(doc.get('passwordPolicyVersion') or config.PASSWORD_POLICY_VERSION)
    must_change = bool(doc.get('mustChangePassword'))
    mfa_enabled = bool(doc.get('mfaEnabled'))
    return {
        'id': doc.get('id') or str(doc.get('_id', '')),
        'email': doc.get('email'),
        'displayName': doc.get('displayName'),
        'role': doc.get('role', config.ROLE_ADMIN),
        'active': bool(doc.get('active', True)),
        'lastLoginAt': doc.get('lastLoginAt'),
        'createdAt': doc.get('createdAt'),
        'passwordPolicyVersion': policy_ver,
        'mustChangePassword': must_change,
        'mfaEnabled': mfa_enabled,
        'mfaRequired': bool(
            config.MFA_ENABLED
            and config.MFA_REQUIRED_FOR_ADMIN
            and doc.get('role') == config.ROLE_ADMIN
            and not mfa_enabled
        ),
    }


def is_safe_http_url(url: str, *, allow_relative: bool = True) -> bool:
    """Allow https (preferred), http, or site-relative paths. Block javascript:/data:/etc."""
    if not url or not isinstance(url, str):
        return False
    value = url.strip()
    if not value:
        return False
    lower = value.lower()
    if lower.startswith(('javascript:', 'data:', 'vbscript:', 'file:', 'blob:')):
        return False
    if value.startswith('/'):
        return allow_relative and not value.startswith('//')
    from urllib.parse import urlparse

    try:
        parsed = urlparse(value)
    except Exception:
        return False
    return parsed.scheme in ('http', 'https') and bool(parsed.netloc)


def session_expiry_fields(now: Optional[datetime] = None) -> dict[str, Any]:
    now = now or utcnow()
    abs_exp = now + timedelta(seconds=config.SESSION_ABSOLUTE_SECONDS)
    idle_exp = now + timedelta(seconds=config.SESSION_IDLE_SECONDS)
    return {
        'createdAt': now.isoformat(),
        'lastUsedAt': now.isoformat(),
        'expiresAt': abs_exp.isoformat(),
        'idleExpiresAt': idle_exp.isoformat(),
        # BSON date for Mongo TTL index (expireAfterSeconds=0)
        'expiresAtDate': abs_exp,
    }
