"""FastAPI dependencies for admin auth / authorization."""
from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, Request

from cms import config
from cms.pg_store import Database
from cms.security import (
    check_origin,
    hash_session_token,
    parse_iso,
    require_csrf,
    session_expiry_fields,
    utcnow,
)

_AUTH_ALLOW_SUFFIXES = (
    '/admin/auth/change-password',
    '/admin/auth/logout',
    '/admin/auth/me',
    '/admin/auth/mfa/verify',
    '/admin/auth/mfa/setup',
    '/admin/auth/mfa/confirm',
)


def get_db(request: Request) -> Database:
    db = getattr(request.app.state, 'db', None)
    if db is None:
        raise HTTPException(status_code=503, detail='Database unavailable')
    return db


def _password_change_required(user: dict) -> bool:
    """Only accounts explicitly flagged (migration script) must rotate before CMS use."""
    return bool(user.get('mustChangePassword'))


def _mfa_enrollment_required(user: dict) -> bool:
    """When MFA is globally required for admins, block CMS until TOTP is enrolled."""
    if not config.MFA_ENABLED or not config.MFA_REQUIRED_FOR_ADMIN:
        return False
    if user.get('role') != config.ROLE_ADMIN:
        return False
    return not bool(user.get('mfaEnabled'))


def _path_allowed_during_auth_gate(path: str) -> bool:
    return any(path.endswith(s) for s in _AUTH_ALLOW_SUFFIXES) or '/admin/auth/' in path


def _deny_if_auth_gates(request: Request, user: dict) -> None:
    path = request.url.path.rstrip('/')
    if _path_allowed_during_auth_gate(path):
        return
    if _password_change_required(user):
        raise HTTPException(
            status_code=403,
            detail='Password change required before continuing. Visit /admin/change-password.',
        )
    if _mfa_enrollment_required(user):
        raise HTTPException(
            status_code=403,
            detail='MFA enrollment required before continuing. Complete authenticator setup.',
        )


async def get_current_admin(
    request: Request,
    db: Database = Depends(get_db),
) -> dict[str, Any]:
    token = request.cookies.get(config.SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail='Not authenticated')

    session_hash = hash_session_token(token)
    session = await db.admin_sessions.find_one({'sessionHash': session_hash})
    if not session:
        raise HTTPException(status_code=401, detail='Session expired')

    now = utcnow()
    abs_exp = parse_iso(session.get('expiresAt'))
    idle_exp = parse_iso(session.get('idleExpiresAt'))
    if (abs_exp and now > abs_exp) or (idle_exp and now > idle_exp):
        await db.admin_sessions.delete_one({'sessionHash': session_hash})
        raise HTTPException(status_code=401, detail='Session expired')

    user = await db.admin_users.find_one({'id': session['userId']})
    if not user or not user.get('active', True):
        await db.admin_sessions.delete_one({'sessionHash': session_hash})
        raise HTTPException(status_code=401, detail='Account inactive')

    # Sliding idle window
    fields = session_expiry_fields(now)
    await db.admin_sessions.update_one(
        {'sessionHash': session_hash},
        {'$set': {'lastUsedAt': fields['lastUsedAt'], 'idleExpiresAt': fields['idleExpiresAt']}},
    )

    request.state.admin_user = user
    request.state.session_hash = session_hash
    return user


async def require_admin_csrf(
    request: Request,
    user: dict = Depends(get_current_admin),
) -> dict:
    require_csrf(request)
    check_origin(request)
    return user


def require_role(*roles: str):
    async def _inner(
        request: Request,
        user: dict = Depends(require_admin_csrf),
    ) -> dict:
        if user.get('role') not in roles:
            raise HTTPException(status_code=403, detail='Insufficient permissions')
        _deny_if_auth_gates(request, user)
        return user

    return _inner


def require_role_read(*roles: str):
    """Authenticated read (GET) - no CSRF."""

    async def _inner(
        request: Request,
        user: dict = Depends(get_current_admin),
    ) -> dict:
        if user.get('role') not in roles:
            raise HTTPException(status_code=403, detail='Insufficient permissions')
        _deny_if_auth_gates(request, user)
        return user

    return _inner


# Convenience composites
AdminWrite = Depends(require_role(config.ROLE_ADMIN, config.ROLE_EDITOR))
AdminOnlyWrite = Depends(require_role(config.ROLE_ADMIN))
AdminRead = Depends(require_role_read(config.ROLE_ADMIN, config.ROLE_EDITOR))
AdminOnlyRead = Depends(require_role_read(config.ROLE_ADMIN))
OpsRead = Depends(require_role_read(config.ROLE_ADMIN))  # PII: enquiries/quotes/careers
OpsWrite = Depends(require_role(config.ROLE_ADMIN))
