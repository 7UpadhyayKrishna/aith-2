#!/usr/bin/env python3
"""
Mark legacy admin accounts that predate the strong password policy.

Does NOT inspect Argon2 hashes for original password length.
Sets mustChangePassword=true so the next successful login forces /admin/change-password.

Usage (from backend/):
  python scripts/mark_legacy_passwords.py            # dry-run
  python scripts/mark_legacy_passwords.py --apply
  python scripts/mark_legacy_passwords.py --email ops@example.com --apply
"""
from __future__ import annotations

import argparse
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


def main() -> int:
    parser = argparse.ArgumentParser(description='Flag legacy admins for password change')
    parser.add_argument('--apply', action='store_true', help='Write changes (default is dry-run)')
    parser.add_argument('--email', help='Limit to one email')
    args = parser.parse_args()

    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    if not mongo_url or not db_name:
        print('MONGO_URL and DB_NAME are required.', file=sys.stderr)
        return 1

    client = MongoClient(mongo_url)
    db = client[db_name]
    q = {}
    if args.email:
        q['email'] = args.email.strip().lower()

    # Candidates: missing policy version or older than current
    cursor = db.admin_users.find(q)
    candidates = []
    for doc in cursor:
        ver = int(doc.get('passwordPolicyVersion') or 0)
        if ver < config.PASSWORD_POLICY_VERSION or doc.get('mustChangePassword'):
            candidates.append(doc)

    print(f'Found {len(candidates)} candidate account(s). Current policy version={config.PASSWORD_POLICY_VERSION}')
    for doc in candidates:
        print(f"  - {doc.get('email')} policy={doc.get('passwordPolicyVersion')} mustChange={doc.get('mustChangePassword')}")

    if not args.apply:
        print('Dry-run only. Re-run with --apply to set mustChangePassword=true.')
        client.close()
        return 0

    now = datetime.now(timezone.utc).isoformat()
    for doc in candidates:
        db.admin_users.update_one(
            {'id': doc['id']},
            {
                '$set': {
                    'mustChangePassword': True,
                    'passwordPolicyVersion': min(int(doc.get('passwordPolicyVersion') or 0), config.PASSWORD_POLICY_VERSION - 1),
                    'updatedAt': now,
                }
            },
        )
        db.admin_audit_logs.insert_one({
            'id': str(uuid.uuid4()),
            'timestamp': now,
            'adminUserId': None,
            'action': 'LEGACY_PASSWORD_FLAGGED',
            'resourceType': 'admin_user',
            'resourceId': doc['id'],
            'result': 'ok',
            'meta': {'via': 'mark_legacy_passwords.py'},
            'ip': None,
        })
    print(f'Flagged {len(candidates)} account(s).')
    client.close()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
