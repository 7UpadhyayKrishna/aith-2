#!/usr/bin/env python3
"""One-off: replace em/en dashes with ASCII hyphens in string fields."""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / '.env')

from cms.script_db import open_db


def scrub(val):
    if isinstance(val, str):
        if '\u2014' in val or '\u2013' in val:
            return val.replace('\u2014', '-').replace('\u2013', '-'), True
        return val, False
    if isinstance(val, list):
        out, hit = [], False
        for item in val:
            nv, h = scrub(item)
            out.append(nv)
            hit = hit or h
        return out, hit
    if isinstance(val, dict):
        out, hit = {}, False
        for k, v in val.items():
            if k == '_id':
                out[k] = v
                continue
            nv, h = scrub(v)
            out[k] = nv
            hit = hit or h
        return out, hit
    return val, False


async def _run() -> int:
    total = 0
    async with open_db() as db:
        for name in await db.list_collection_names():
            col = getattr(db, name)
            updated = 0
            async for doc in col.find({}):
                new_doc, hit = scrub(doc)
                if not hit:
                    continue
                new_doc.pop('_id', None)
                await col.replace_one({'id': doc['id']}, new_doc)
                updated += 1
            if updated:
                print(f'{name}: {updated} docs')
                total += updated
    print(f'total={total}')
    return 0


def main() -> int:
    return asyncio.run(_run())


if __name__ == '__main__':
    raise SystemExit(main())
