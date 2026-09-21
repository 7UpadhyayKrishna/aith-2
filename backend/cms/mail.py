"""Outbound email helpers for ops notifications and admin replies."""
from __future__ import annotations

import logging
import os
import smtplib
from email.message import EmailMessage
from typing import Any, Optional, Tuple

logger = logging.getLogger(__name__)

SMTP_KEYS = (
    'OPS_NOTIFICATION_EMAIL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'SMTP_FROM',
    'SMTP_USE_TLS',
)


def smtp_present_keys() -> list[str]:
    return [k for k in SMTP_KEYS if os.environ.get(k)]


def smtp_configured() -> bool:
    return bool(
        os.environ.get('OPS_NOTIFICATION_EMAIL')
        and os.environ.get('SMTP_HOST')
        and os.environ.get('SMTP_FROM')
    )


def smtp_startup_state() -> str:
    present = smtp_present_keys()
    if not present:
        return 'disabled'
    if smtp_configured():
        return 'enabled'
    return 'error'


def send_email(
    *,
    to: str,
    subject: str,
    body: str,
    reply_to: Optional[str] = None,
    meta: Optional[dict[str, Any]] = None,
) -> Tuple[str, Optional[str]]:
    """
    Send email via SMTP when configured.
    Returns (deliveryStatus, errorMessage).
    """
    if not smtp_configured():
        return 'not_configured', 'Email delivery is not configured.'

    host = os.environ['SMTP_HOST']
    port = int(os.environ.get('SMTP_PORT', '587'))
    username = os.environ.get('SMTP_USERNAME', '')
    password = os.environ.get('SMTP_PASSWORD', '')
    from_addr = os.environ['SMTP_FROM']
    use_tls = os.environ.get('SMTP_USE_TLS', 'true').lower() not in ('0', 'false', 'no')

    from cms.request_utils import header_safe, safe_reply_to

    msg = EmailMessage()
    msg['Subject'] = header_safe(subject, max_len=180) or 'AITH'
    msg['From'] = from_addr
    msg['To'] = to.strip()
    clean_reply = safe_reply_to(reply_to)
    if clean_reply:
        msg['Reply-To'] = clean_reply
    msg.set_content(body)

    try:
        with smtplib.SMTP(host, port, timeout=20) as smtp:
            if use_tls:
                smtp.starttls()
            if username:
                smtp.login(username, password)
            smtp.send_message(msg)
        logger.info(
            'mail sent to=%s kind=%s id=%s',
            to[:80],
            (meta or {}).get('kind'),
            (meta or {}).get('id'),
        )
        return 'sent', None
    except Exception as exc:
        err = f'{type(exc).__name__}: {exc}'[:240]
        logger.error(
            'mail failed to=%s kind=%s id=%s error=%s',
            to[:80],
            (meta or {}).get('kind'),
            (meta or {}).get('id'),
            err,
        )
        return 'failed', err


def notify_ops(
    kind: str,
    subject: str,
    body: str,
    reply_to: Optional[str] = None,
    meta: Optional[dict[str, Any]] = None,
) -> Tuple[str, Optional[str]]:
    """Ops inbox notify after public form persist."""
    if not smtp_configured():
        logger.info(
            'enquiry notify=disabled kind=%s id=%s stored=yes',
            kind,
            (meta or {}).get('id'),
        )
        return 'disabled', None
    status, err = send_email(
        to=os.environ['OPS_NOTIFICATION_EMAIL'],
        subject=subject,
        body=body,
        reply_to=reply_to,
        meta={**(meta or {}), 'kind': kind},
    )
    return status, err
