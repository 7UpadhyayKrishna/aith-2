#!/usr/bin/env python3
"""
Reset an AITH admin password securely.

Usage (from backend/):
  python scripts/reset_admin_password.py

- Identifies user by email
- Prompts for new password via getpass (never echoed / never printed)
- Enforces production password policy
- Rehashes with Argon2id
- Clears mustChangePassword and sets passwordPolicyVersion
- Invalidates all existing sessions
"""
from __future__ import annotations

import getpass
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / '.env')

from pymongo import MongoClient

from cms import config
from cms.security import hash_password


def main() -> int:
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    if not mongo_url or not db_name:
        print('MONGO_URL and DB_NAME are required.', file=sys.stderr)
        return 1

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
            f'Password must be {config.MIN_PASSWORD_LENGTH}–{config.MAX_PASSWORD_LENGTH} characters.',
            file=sys.stderr,
        )
        return 1

    client = MongoClient(mongo_url)
    db = client[db_name]
    user = db.admin_users.find_one({'email': email})
    if not user:
        print('User not found.', file=sys.stderr)
        client.close()
        return 1

    now = datetime.now(timezone.utc).isoformat()
    db.admin_users.update_one(
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
    deleted = db.admin_sessions.delete_many({'userId': user['id']})
    db.admin_audit_logs.insert_one({
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
    client.close()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
