#!/usr/bin/env python3
"""
Reset an AITH admin password securely.

Usage (from backend/):
  py -3 scripts/reset_admin_password.py

Requires DATABASE_URL in environment or backend/.env.
"""
from __future__ import annotations

import asyncio
import getpass
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / '.env')

from cms import config
from cms.script_db import open_db
from cms.security import hash_password


async def _run() -> int:
    email = input('Admin email to reset: ').strip().lower()
    if '@' not in email:
        print('Invalid email.', file=sys.stderr)
        return 1

    password = getpass.getpass(f'New password (min {config.MIN_PASSWORD_LENGTH} chars): ')
    confirm = getpass.getpass('Confirm password: ')
    if password != confirm:
        print('Passwords do not match.', file=sys.stderr)
        return 1
    if len(password) < config.MIN_PASSWORD_LENGTH or len(password) > config.MAX_PASSWORD_LENGTH:
        print(
            f'Password must be {config.MIN_PASSWORD_LENGTH}-{config.MAX_PASSWORD_LENGTH} characters.',
            file=sys.stderr,
        )
        return 1

    async with open_db() as db:
        user = await db.admin_users.find_one({'email': email})
        if not user:
            print('User not found.', file=sys.stderr)
            return 1

        now = datetime.now(timezone.utc).isoformat()
        await db.admin_users.update_one(
            {'id': user['id']},
            {
                '$set': {
                    'passwordHash': hash_password(password),
                    'updatedAt': now,
                    'mustChangePassword': False,
                    'passwordPolicyVersion': config.PASSWORD_POLICY_VERSION,
                }
            },
        )
        deleted = await db.admin_sessions.delete_many({'userId': user['id']})
        await db.admin_audit_logs.insert_one({
            'id': str(uuid.uuid4()),
            'timestamp': now,
            'adminUserId': None,
            'action': 'PASSWORD_RESET_CLI',
            'resourceType': 'admin_user',
            'resourceId': user['id'],
            'result': 'ok',
            'meta': {'sessionsRevoked': deleted.deleted_count, 'via': 'reset_admin_password.py'},
            'ip': None,
        })
        print(f'Reset password for {email}; revoked {deleted.deleted_count} session(s).')
    return 0


def main() -> int:
    return asyncio.run(_run())


if __name__ == '__main__':
    raise SystemExit(main())
