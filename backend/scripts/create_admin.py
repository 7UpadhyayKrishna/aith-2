#!/usr/bin/env python3
"""
Provision an AITH administrator account.

Usage (from backend/):
  python scripts/create_admin.py

Prompts for email, display name, and password (never echoed).
Requires MONGO_URL and DB_NAME in environment or backend/.env.
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

from cms.config import MIN_PASSWORD_LENGTH, PASSWORD_POLICY_VERSION
from cms.security import hash_password


def main() -> int:
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    if not mongo_url or not db_name:
        print('MONGO_URL and DB_NAME are required.', file=sys.stderr)
        return 1

    email = input('Admin email: ').strip().lower()
    if '@' not in email:
        print('Invalid email.', file=sys.stderr)
        return 1

    display_name = input('Display name: ').strip() or 'Administrator'
    role = input('Role [admin/editor] (default admin): ').strip().lower() or 'admin'
    if role not in ('admin', 'editor'):
        print('Role must be admin or editor.', file=sys.stderr)
        return 1

    from cms.config import MIN_PASSWORD_LENGTH, PASSWORD_POLICY_VERSION

    password = getpass.getpass(f'Password (min {MIN_PASSWORD_LENGTH} chars): ')
    confirm = getpass.getpass('Confirm password: ')
    if password != confirm:
        print('Passwords do not match.', file=sys.stderr)
        return 1
    if len(password) < MIN_PASSWORD_LENGTH:
        print(f'Password must be at least {MIN_PASSWORD_LENGTH} characters.', file=sys.stderr)
        return 1

    client = MongoClient(mongo_url)
    db = client[db_name]
    existing = db.admin_users.find_one({'email': email})
    if existing:
        print(f'User already exists: {email}', file=sys.stderr)
        client.close()
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
    db.admin_users.insert_one(doc)
    db.admin_users.create_index('email', unique=True)
    print(f'Created {role} user id={doc["id"]} email={email}')
    # Never print password
    client.close()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
