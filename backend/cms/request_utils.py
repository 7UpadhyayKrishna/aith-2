"""Shared request helpers (IP, search escaping) — no secrets."""
from __future__ import annotations

import os
import re
from typing import Optional

from fastapi import Request


def trust_proxy_headers() -> bool:
    return os.environ.get('TRUST_PROXY_HEADERS', '').lower() in ('1', 'true', 'yes')


def client_ip(request: Request) -> str:
    """
    Client IP for rate limits / audit.

    Only honour X-Forwarded-For when TRUST_PROXY_HEADERS=true (trusted reverse proxy).
    Otherwise use the direct socket peer to prevent spoofed rate-limit bypass.
    """
    if trust_proxy_headers():
        forwarded = request.headers.get('x-forwarded-for')
        if forwarded:
            # Leftmost = original client when proxy appends; document that edge must overwrite
            return forwarded.split(',')[0].strip() or 'unknown'
    return request.client.host if request.client else 'unknown'


def escape_regex(term: str, max_len: int = 100) -> str:
    """Literal substring match for Mongo $regex — prevents ReDoS via user patterns."""
    cleaned = (term or '').strip()[:max_len]
    return re.escape(cleaned)


def header_safe(value: Optional[str], max_len: int = 200) -> str:
    """Single-line value safe for SMTP / HTTP headers (no CRLF injection)."""
    if value is None:
        return ''
    text = str(value).replace('\r', ' ').replace('\n', ' ').replace('\t', ' ')
    text = ''.join(ch for ch in text if ord(ch) >= 32)
    return text.strip()[:max_len]


def safe_reply_to(email: Optional[str]) -> Optional[str]:
    """Return a single-line email suitable for Reply-To, or None if invalid."""
    if not email:
        return None
    candidate = header_safe(email, max_len=200)
    if candidate.count('@') != 1:
        return None
    local, _, domain = candidate.partition('@')
    if not local or not domain or ' ' in candidate or ',' in candidate or ';' in candidate:
        return None
    if any(ch in candidate for ch in '<>"()[]\\'):
        return None
    return candidate
