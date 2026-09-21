#!/usr/bin/env python3
"""
Provision an AITH administrator account.

Usage (from backend/):
  py -3 scripts/create_admin.py

Prompts for email, display name, and password (never echoed).
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

from cms.config import MIN_PASSWORD_LENGTH, PASSWORD_POLICY_VERSION
from cms.script_db import open_db
from cms.security import hash_password


async def _run() -> int:
    email = input('Admin email: ').strip().lower()
    if '@' not in email:
        print('Invalid email.', file=sys.stderr)
        return 1

    display_name = input('Display name: ').strip() or 'Administrator'
    role = input('Role [admin/editor] (default admin): ').strip().lower() or 'admin'
    if role not in ('admin', 'editor'):
        print('Role must be admin or editor.', file=sys.stderr)
        return 1

    password = getpass.getpass(f'Password (min {MIN_PASSWORD_LENGTH} chars): ')
    confirm = getpass.getpass('Confirm password: ')
    if password != confirm:
        print('Passwords do not match.', file=sys.stderr)
        return 1
    if len(password) < MIN_PASSWORD_LENGTH:
        print(f'Password must be at least {MIN_PASSWORD_LENGTH} characters.', file=sys.stderr)
        return 1

    async with open_db(apply_schema=True) as db:
        existing = await db.admin_users.find_one({'email': email})
        if existing:
            print(f'User already exists: {email}', file=sys.stderr)
            return 1

        now = datetime.now(timezone.utc).isoformat()
        doc = {
            'id': str(uuid.uuid4()),
            'email': email,
            'displayName': display_name,
            'passwordHash': hash_password(password),
            'role': role,
            'active': True,
            'createdAt': now,
            'updatedAt': now,
            'lastLoginAt': None,
            'passwordPolicyVersion': PASSWORD_POLICY_VERSION,
            'mustChangePassword': False,
            'mfaEnabled': False,
        }
        await db.admin_users.insert_one(doc)
        print(f'Created {role} user id={doc["id"]} email={email}')
    return 0


def main() -> int:
    return asyncio.run(_run())


if __name__ == '__main__':
    raise SystemExit(main())
