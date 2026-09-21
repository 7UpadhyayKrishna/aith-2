"""Shared DB bootstrap for CLI scripts (create_admin, seed_blogs, …)."""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from cms.pg_store import Database, create_pool, ensure_schema


@asynccontextmanager
async def open_db(*, apply_schema: bool = False) -> AsyncIterator[Database]:
    url = (os.environ.get('DATABASE_URL') or '').strip()
    if not url:
        raise SystemExit('DATABASE_URL is required.')
    pool = await create_pool(url)
    try:
        if apply_schema:
            await ensure_schema(pool)
        yield Database(pool)
    finally:
        await pool.close()
