#!/usr/bin/env python3
"""Apply backend/sql/schema.sql to DATABASE_URL (Supabase)."""
from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / '.env')


async def main() -> int:
    url = (os.environ.get('DATABASE_URL') or '').strip()
    if not url:
        print('DATABASE_URL is required.', file=sys.stderr)
        return 1
    from cms.pg_store import create_pool, ensure_schema

    pool = await create_pool(url)
    try:
        await ensure_schema(pool)
        await pool.fetchval('SELECT 1')
        print('Schema applied and connection OK.')
        return 0
    finally:
        await pool.close()


if __name__ == '__main__':
    raise SystemExit(asyncio.run(main()))
