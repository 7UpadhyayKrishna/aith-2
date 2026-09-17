#!/usr/bin/env python3
"""
Disable an AITH admin account and revoke sessions.

Usage (from backend/):
  python scripts/disable_admin.py
"""
from __future__ import annotations

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


def main() -> int:
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    if not mongo_url or not db_name:
        print('MONGO_URL and DB_NAME are required.', file=sys.stderr)
        return 1

    email = input('Admin email to disable: ').strip().lower()
    if '@' not in email:
        print('Invalid email.', file=sys.stderr)
        return 1

    confirm = input(f'Type DISABLE to confirm deactivating {email}: ').strip()
    if confirm != 'DISABLE':
        print('Aborted.', file=sys.stderr)
        return 1

    client = MongoClient(mongo_url)
    db = client[db_name]
    user = db.admin_users.find_one({'email': email})
    if not user:
        print('User not found.', file=sys.stderr)
        client.close()
        return 1

    now = datetime.now(timezone.utc).isoformat()
    db.admin_users.update_one({'id': user['id']}, {'$set': {'active': False, 'updatedAt': now}})
    deleted = db.admin_sessions.delete_many({'userId': user['id']})
    db.admin_audit_logs.insert_one({
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
    client.close()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
