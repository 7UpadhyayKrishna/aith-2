"""Admin audit logging - never log secrets."""
from __future__ import annotations

import logging
import uuid
from typing import Any, Optional

from cms.security import iso_now

logger = logging.getLogger(__name__)

SENSITIVE_KEYS = {
    'password',
    'passwordHash',
    'sessionToken',
    'csrf',
    'csrfToken',
    'SMTP_PASSWORD',
    'MONGO_URL',
    'DATABASE_URL',
    'ADMIN_SESSION_SECRET',
}


def _scrub(meta: Optional[dict]) -> dict:
    if not meta:
        return {}
    out = {}
    for k, v in meta.items():
        if k in SENSITIVE_KEYS or any(s.lower() in k.lower() for s in ('password', 'secret', 'token', 'cookie')):
            continue
        if isinstance(v, str) and len(v) > 500:
            out[k] = v[:500] + '…'
        else:
            out[k] = v
    return out


async def write_audit(
    db,
    *,
    action: str,
    admin_user_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    result: str = 'ok',
    meta: Optional[dict[str, Any]] = None,
    ip: Optional[str] = None,
) -> None:
    doc = {
        'id': str(uuid.uuid4()),
        'timestamp': iso_now(),
        'adminUserId': admin_user_id,
        'action': action,
        'resourceType': resource_type,
        'resourceId': resource_id,
        'result': result,
        'meta': _scrub(meta),
        'ip': ip,
    }
    try:
        await db.admin_audit_logs.insert_one(doc)
    except Exception:
        logger.exception('Failed to write audit log action=%s', action)
