"""Admin authentication endpoints."""
from __future__ import annotations

import hashlib
import logging
import os
import secrets
import time
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field

from cms import config
from cms.audit import write_audit
from cms.deps import get_current_admin, get_db, require_admin_csrf
from cms.security import (
    clear_session_cookies,
    hash_password,
    hash_session_token,
    needs_rehash,
    new_csrf_token,
    new_session_token,
    public_user,
    session_expiry_fields,
    set_session_cookies,
    verify_password,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/admin/auth', tags=['admin-auth'])

_LOGIN_RATE: Dict[str, list] = {}
_ACCOUNT_RATE: Dict[str, list] = {}


def reset_login_rate_limits() -> None:
    """Test helper — clear in-process login rate buckets."""
    _LOGIN_RATE.clear()
    _ACCOUNT_RATE.clear()


def _client_ip(request: Request) -> str:
    from cms.request_utils import client_ip

    return client_ip(request)


def _rate_bucket(store: Dict[str, list], key: str, window: int, maximum: int, *, detail: str) -> None:
    now = time.time()
    bucket = [t for t in store.get(key, []) if now - t < window]
    if len(bucket) >= maximum:
        raise HTTPException(status_code=429, detail=detail)
    bucket.append(now)
    store[key] = bucket


def _login_rate_limit(request: Request, email: str) -> None:
    if (os.environ.get('APP_ENV') or '').strip().lower() == 'test':
        return
    ip = _client_ip(request)
    _rate_bucket(
        _LOGIN_RATE,
        f'ip:{ip}',
        config.LOGIN_RATE_WINDOW,
        config.LOGIN_RATE_MAX,
        detail='Too many login attempts. Please try again shortly.',
    )
    # Account-scoped soft limit (email hash — avoid storing raw email in rate map keys in logs)
    account_key = hashlib.sha256(email.encode('utf-8')).hexdigest()[:24]
    _rate_bucket(
        _ACCOUNT_RATE,
        f'acct:{account_key}',
        config.LOGIN_ACCOUNT_WINDOW,
        config.LOGIN_ACCOUNT_MAX,
        detail='Too many login attempts. Please try again shortly.',
    )


class LoginBody(BaseModel):
    email: str = Field(max_length=200)
    password: str = Field(max_length=200)
    totpCode: Optional[str] = Field(default=None, max_length=16)


class ChangePasswordBody(BaseModel):
    currentPassword: str = Field(max_length=config.MAX_PASSWORD_LENGTH)
    newPassword: str = Field(min_length=config.MIN_PASSWORD_LENGTH, max_length=config.MAX_PASSWORD_LENGTH)


class MfaConfirmBody(BaseModel):
    code: str = Field(min_length=6, max_length=16)


class MfaVerifyBody(BaseModel):
    code: str = Field(min_length=6, max_length=32)


def _hash_recovery_code(code: str) -> str:
    return hashlib.sha256(f'{config.SESSION_SECRET}:mfa-recovery:{code}'.encode('utf-8')).hexdigest()


def _verify_totp(secret: str, code: str) -> bool:
    if not config.MFA_ENABLED:
        return False
    try:
        import pyotp
    except ImportError:
        logger.error('ADMIN_MFA_ENABLED but pyotp is not installed')
        return False
    totp = pyotp.TOTP(secret)
    return bool(totp.verify(code.strip(), valid_window=1))


async def _create_session(db, user: dict, request: Request, response: Response) -> dict:
    session_token = new_session_token()
    csrf = new_csrf_token()
    fields = session_expiry_fields()
    ip = _client_ip(request)
    await db.admin_sessions.insert_one({
        'sessionHash': hash_session_token(session_token),
        'userId': user['id'],
        'csrfToken': csrf,
        **fields,
        'ip': ip,
        'userAgent': (request.headers.get('user-agent') or '')[:240],
    })
    from cms.security import iso_now

    await db.admin_users.update_one({'id': user['id']}, {'$set': {'lastLoginAt': iso_now()}})
    set_session_cookies(response, session_token, csrf)
    await write_audit(
        db,
        action='LOGIN_SUCCESS',
        admin_user_id=user['id'],
        resource_type='admin_user',
        resource_id=user['id'],
        result='ok',
        ip=ip,
        meta={'requestId': getattr(request.state, 'request_id', None)},
    )
    return {'ok': True, 'user': public_user(user), 'csrfToken': csrf}


@router.post('/login')
async def login(body: LoginBody, request: Request, response: Response, db=Depends(get_db)):
    email = body.email.strip().lower()
    _login_rate_limit(request, email)
    ip = _client_ip(request)

    user = await db.admin_users.find_one({'email': email})
    ok = bool(user and user.get('active', True) and verify_password(user.get('passwordHash', ''), body.password))

    if not ok:
        await write_audit(
            db,
            action='LOGIN_FAILURE',
            admin_user_id=user.get('id') if user else None,
            resource_type='admin_user',
            result='denied',
            meta={
                'emailDomain': email.split('@')[-1] if '@' in email else None,
                'requestId': getattr(request.state, 'request_id', None),
            },
            ip=ip,
        )
        raise HTTPException(status_code=401, detail='Invalid credentials.')

    if needs_rehash(user['passwordHash']):
        await db.admin_users.update_one(
            {'id': user['id']},
            {'$set': {'passwordHash': hash_password(body.password)}},
        )

    # MFA challenge (optional feature flag)
    if config.MFA_ENABLED and user.get('mfaEnabled') and user.get('mfaSecret'):
        code = (body.totpCode or '').strip()
        if not code:
            return {
                'ok': False,
                'mfaRequired': True,
                'message': 'Enter authenticator code to continue.',
            }
        recovery_ok = False
        if len(code) > 8:
            hashed = _hash_recovery_code(code.upper())
            codes: List[str] = list(user.get('mfaRecoveryHashes') or [])
            if hashed in codes:
                recovery_ok = True
                codes = [c for c in codes if c != hashed]
                await db.admin_users.update_one(
                    {'id': user['id']},
                    {'$set': {'mfaRecoveryHashes': codes}},
                )
        if not recovery_ok and not _verify_totp(user['mfaSecret'], code):
            await write_audit(
                db,
                action='MFA_FAILURE',
                admin_user_id=user['id'],
                resource_type='admin_user',
                resource_id=user['id'],
                result='denied',
                ip=ip,
            )
            raise HTTPException(status_code=401, detail='Invalid credentials.')

    return await _create_session(db, user, request, response)


@router.post('/mfa/verify')
async def mfa_verify(body: MfaVerifyBody, request: Request, response: Response, db=Depends(get_db)):
    """Complete MFA after password step when challenge id flow is used (optional)."""
    if not config.MFA_ENABLED:
        raise HTTPException(status_code=404, detail='MFA is not enabled')
    raise HTTPException(
        status_code=400,
        detail='Submit totpCode with /admin/auth/login after password verification.',
    )


@router.post('/mfa/setup')
async def mfa_setup(user: dict = Depends(require_admin_csrf), db=Depends(get_db)):
    """Begin TOTP enrollment. Returns otpauth URI once; secret never re-shown after confirm."""
    if not config.MFA_ENABLED:
        raise HTTPException(status_code=404, detail='MFA is not enabled on this deployment')
    try:
        import pyotp
    except ImportError as exc:
        raise HTTPException(status_code=503, detail='MFA library unavailable') from exc

    secret = pyotp.random_base32()
    await db.admin_users.update_one(
        {'id': user['id']},
        {'$set': {'mfaPendingSecret': secret, 'mfaEnabled': False}},
    )
    uri = pyotp.TOTP(secret).provisioning_uri(name=user.get('email') or 'admin', issuer_name='AITH Admin')
    await write_audit(
        db,
        action='MFA_SETUP_STARTED',
        admin_user_id=user['id'],
        resource_type='admin_user',
        resource_id=user['id'],
        result='ok',
    )
    return {'ok': True, 'otpauthUri': uri, 'secret': secret}


@router.post('/mfa/confirm')
async def mfa_confirm(
    body: MfaConfirmBody,
    request: Request,
    user: dict = Depends(require_admin_csrf),
    db=Depends(get_db),
):
    if not config.MFA_ENABLED:
        raise HTTPException(status_code=404, detail='MFA is not enabled on this deployment')
    fresh = await db.admin_users.find_one({'id': user['id']})
    pending = (fresh or {}).get('mfaPendingSecret')
    if not pending or not _verify_totp(pending, body.code):
        raise HTTPException(status_code=400, detail='Invalid authenticator code')

    # Generate recovery codes once — store hashes only
    raw_codes = [secrets.token_hex(4).upper() for _ in range(8)]
    hashes = [_hash_recovery_code(c) for c in raw_codes]
    await db.admin_users.update_one(
        {'id': user['id']},
        {
            '$set': {
                'mfaSecret': pending,
                'mfaEnabled': True,
                'mfaRecoveryHashes': hashes,
                'mfaPendingSecret': None,
            }
        },
    )
    await write_audit(
        db,
        action='MFA_ENABLED',
        admin_user_id=user['id'],
        resource_type='admin_user',
        resource_id=user['id'],
        result='ok',
        ip=_client_ip(request),
    )
    return {
        'ok': True,
        'recoveryCodes': raw_codes,
        'message': 'Store recovery codes now. They will not be shown again.',
    }


@router.post('/logout')
async def logout(
    request: Request,
    response: Response,
    user: dict = Depends(require_admin_csrf),
    db=Depends(get_db),
):
    session_hash = getattr(request.state, 'session_hash', None)
    if session_hash:
        await db.admin_sessions.delete_one({'sessionHash': session_hash})
    clear_session_cookies(response)
    await write_audit(
        db,
        action='LOGOUT',
        admin_user_id=user.get('id'),
        resource_type='admin_user',
        resource_id=user.get('id'),
        result='ok',
        ip=_client_ip(request),
    )
    return {'ok': True}


@router.get('/me')
async def me(request: Request, user: dict = Depends(get_current_admin)):
    csrf = request.cookies.get(config.CSRF_COOKIE)
    return {
        'user': public_user(user),
        'csrfToken': csrf,
        'mfaEnabledGlobally': config.MFA_ENABLED,
    }


@router.post('/change-password')
async def change_password(
    body: ChangePasswordBody,
    request: Request,
    response: Response,
    user: dict = Depends(require_admin_csrf),
    db=Depends(get_db),
):
    if not verify_password(user.get('passwordHash', ''), body.currentPassword):
        raise HTTPException(status_code=400, detail='Current password is incorrect')
    if len(body.newPassword) < config.MIN_PASSWORD_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f'New password must be at least {config.MIN_PASSWORD_LENGTH} characters',
        )
    if body.newPassword == body.currentPassword:
        raise HTTPException(status_code=400, detail='New password must differ from the current password')

    from cms.security import iso_now

    await db.admin_users.update_one(
        {'id': user['id']},
        {
            '$set': {
                'passwordHash': hash_password(body.newPassword),
                'updatedAt': iso_now(),
                'mustChangePassword': False,
                'passwordPolicyVersion': config.PASSWORD_POLICY_VERSION,
            }
        },
    )
    # Invalidate all sessions for this user (including current)
    await db.admin_sessions.delete_many({'userId': user['id']})
    clear_session_cookies(response)
    await write_audit(
        db,
        action='PASSWORD_CHANGED',
        admin_user_id=user['id'],
        resource_type='admin_user',
        resource_id=user['id'],
        result='ok',
        ip=_client_ip(request),
        meta={'sessionsRevoked': True},
    )
    return {'ok': True, 'reloginRequired': True}
