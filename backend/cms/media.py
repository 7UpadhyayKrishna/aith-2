"""
Media provider abstraction.

Soft launch uses URL references only (no ephemeral disk uploads).
Future adapters: S3, Cloudinary, Supabase Storage — configure via MEDIA_PROVIDER.
"""
from __future__ import annotations

import os
from typing import Optional, Protocol

from cms.security import is_safe_http_url


class MediaProvider(Protocol):
    name: str

    def validate_url(self, url: str) -> bool:
        ...

    def persist_upload(self, *_args, **_kwargs) -> None:
        """Uploads are not supported in the URL-only provider."""
        ...


class UrlOnlyMediaProvider:
    """Accept https/http or site-relative paths. Never write to local disk."""

    name = 'url_only'

    def validate_url(self, url: str) -> bool:
        return is_safe_http_url(url, allow_relative=True)

    def persist_upload(self, *_args, **_kwargs) -> None:
        raise NotImplementedError(
            'File uploads are not enabled. Configure an external media provider '
            '(S3 / Cloudinary / Supabase) before enabling uploads.'
        )


def get_media_provider() -> MediaProvider:
    kind = (os.environ.get('MEDIA_PROVIDER') or 'url_only').strip().lower()
    if kind in ('url', 'url_only', 'none', ''):
        return UrlOnlyMediaProvider()
    # Future: return S3MediaProvider() etc. when credentials exist
    return UrlOnlyMediaProvider()


def sanitize_image_url(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    provider = get_media_provider()
    return url.strip() if provider.validate_url(url.strip()) else None
