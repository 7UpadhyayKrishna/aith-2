#!/usr/bin/env python3
"""
Disable an AITH admin account and revoke sessions.

Usage (from backend/):
  py -3 scripts/disable_admin.py

Requires DATABASE_URL in environment or backend/.env.
"""
from __future__ import annotations

import asyncio
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / '.env')

from cms.script_db import open_db


async def _run() -> int:
    email = input('Admin email to disable: ').strip().lower()
    if '@' not in email:
        print('Invalid email.', file=sys.stderr)
        return 1

    confirm = input(f'Type DISABLE to confirm deactivating {email}: ').strip()
    if confirm != 'DISABLE':
        print('Aborted.', file=sys.stderr)
        return 1

    async with open_db() as db:
        user = await db.admin_users.find_one({'email': email})
        if not user:
            print('User not found.', file=sys.stderr)
            return 1

        now = datetime.now(timezone.utc).isoformat()
        await db.admin_users.update_one({'id': user['id']}, {'$set': {'active': False, 'updatedAt': now}})
        deleted = await db.admin_sessions.delete_many({'userId': user['id']})
        await db.admin_audit_logs.insert_one({
            'id': str(uuid.uuid4()),
            'timestamp': now,
            'adminUserId': None,
            'action': 'ADMIN_DISABLED_CLI',
            'resourceType': 'admin_user',
            'resourceId': user['id'],
            'result': 'ok',
            'meta': {'sessionsRevoked': deleted.deleted_count, 'via': 'disable_admin.py'},
            'ip': None,
        })
        print(f'Disabled {email}; revoked {deleted.deleted_count} session(s).')
    return 0


def main() -> int:
    return asyncio.run(_run())


if __name__ == '__main__':
    raise SystemExit(main())
