#!/usr/bin/env python3
"""
Mark legacy admin accounts that predate the strong password policy.

Usage (from backend/):
  py -3 scripts/mark_legacy_passwords.py
  py -3 scripts/mark_legacy_passwords.py --apply
"""
from __future__ import annotations

import argparse
import asyncio
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


async def _run(apply: bool, email: str | None) -> int:
    async with open_db() as db:
        q = {}
        if email:
            q['email'] = email.strip().lower()

        cursor = db.admin_users.find(q)
        candidates = []
        async for doc in cursor:
            ver = int(doc.get('passwordPolicyVersion') or 0)
            if ver < config.PASSWORD_POLICY_VERSION or doc.get('mustChangePassword'):
                candidates.append(doc)

        print(
            f'Found {len(candidates)} candidate account(s). '
            f'Current policy version={config.PASSWORD_POLICY_VERSION}'
        )
        for doc in candidates:
            print(
                f"  - {doc.get('email')} policy={doc.get('passwordPolicyVersion')} "
                f"mustChange={doc.get('mustChangePassword')}"
            )

        if not apply:
            print('Dry-run only. Re-run with --apply to set mustChangePassword=true.')
            return 0

        now = datetime.now(timezone.utc).isoformat()
        for doc in candidates:
            await db.admin_users.update_one(
                {'id': doc['id']},
                {
                    '$set': {
                        'mustChangePassword': True,
                        'passwordPolicyVersion': min(
                            int(doc.get('passwordPolicyVersion') or 0),
                            config.PASSWORD_POLICY_VERSION - 1,
                        ),
                        'updatedAt': now,
                    }
                },
            )
            await db.admin_audit_logs.insert_one({
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
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description='Flag legacy admins for password change')
    parser.add_argument('--apply', action='store_true', help='Write changes (default is dry-run)')
    parser.add_argument('--email', help='Limit to one email')
    args = parser.parse_args()
    return asyncio.run(_run(args.apply, args.email))


if __name__ == '__main__':
    raise SystemExit(main())
