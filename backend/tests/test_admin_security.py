"""Security regression tests for admin CMS authz (sync TestClient).

Isolation: forces a unique DB_NAME per pytest worker (or process) so parallel
runs cannot wipe each other's data. Never use production DB_NAME.
"""
from __future__ import annotations

import os
import uuid

import pytest

# --- Test env MUST be set before importing server ---
_WORKER = os.environ.get('PYTEST_XDIST_WORKER', 'gw0')
_TEST_DB = f"aith_test_cms_{_WORKER}_{os.getpid()}"
os.environ['MONGO_URL'] = os.environ.get('MONGO_URL') or 'mongodb://localhost:27017'
os.environ['DB_NAME'] = _TEST_DB
os.environ['CORS_ORIGINS'] = 'http://localhost:3000'
os.environ['ADMIN_SESSION_SECRET'] = 'test-secret-key-at-least-32-chars!!'
os.environ['ADMIN_COOKIE_SECURE'] = 'false'
os.environ['APP_ENV'] = 'test'
os.environ.pop('ADMIN_MFA_ENABLED', None)

from fastapi.testclient import TestClient  # noqa: E402

from server import app, client as mongo_client  # noqa: E402
from cms import config  # noqa: E402
from cms.security import hash_password, iso_now  # noqa: E402


@pytest.fixture(scope='module')
def api():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def clean_db():
    from cms.auth_router import reset_login_rate_limits

    reset_login_rate_limits()
    db = mongo_client[_TEST_DB]
    for name in (
        'admin_users', 'admin_sessions', 'blogs', 'blog_revisions',
        'blog_redirects', 'admin_audit_logs', 'contact_submissions', 'quote_submissions',
    ):
        db[name].delete_many({})
    yield


def _insert_user(*, email: str, role: str, must_change: bool = False, active: bool = True):
    doc = {
        'id': str(uuid.uuid4()),
        'email': email,
        'displayName': role.title(),
        'passwordHash': hash_password('CorrectHorseBattery!'),
        'role': role,
        'active': active,
        'createdAt': iso_now(),
        'updatedAt': iso_now(),
        'lastLoginAt': None,
        'passwordPolicyVersion': config.PASSWORD_POLICY_VERSION,
        'mustChangePassword': must_change,
        'mfaEnabled': False,
    }
    mongo_client[_TEST_DB].admin_users.insert_one(doc)
    return doc


def login(api, email, password='CorrectHorseBattery!'):
    res = api.post('/api/admin/auth/login', json={'email': email, 'password': password})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data.get('ok') is True
    csrf = data.get('csrfToken') or res.cookies.get('aith_admin_csrf')
    return csrf


def test_unauthenticated_admin_blogs_blocked(api):
    res = api.get('/api/admin/blogs')
    assert res.status_code == 401


def test_unauthenticated_post_blocked(api):
    res = api.post('/api/admin/blogs', json={'title': 'x', 'excerpt': 'y', 'contentMarkdown': 'z'})
    assert res.status_code in (401, 403)


def test_login_and_me(api):
    _insert_user(email='ops@aith.test', role='admin')
    csrf = login(api, 'ops@aith.test')
    res = api.get('/api/admin/auth/me')
    assert res.status_code == 200
    assert res.json()['user']['email'] == 'ops@aith.test'
    assert csrf
    assert res.headers.get('X-Request-ID')


def test_invalid_credentials_generic(api):
    _insert_user(email='ops2@aith.test', role='admin')
    res = api.post(
        '/api/admin/auth/login',
        json={'email': 'ops2@aith.test', 'password': 'wrong-password-here'},
    )
    assert res.status_code == 401
    assert res.json()['detail'] == 'Invalid credentials.'


def test_editor_cannot_list_users(api):
    _insert_user(email='editor@aith.test', role='editor')
    login(api, 'editor@aith.test')
    res = api.get('/api/admin/users')
    assert res.status_code == 403


def test_editor_cannot_access_enquiries_pii(api):
    _insert_user(email='editor-pii@aith.test', role='editor')
    login(api, 'editor-pii@aith.test')
    res = api.get('/api/admin/enquiries')
    assert res.status_code == 403
    res2 = api.get('/api/admin/quotes')
    assert res2.status_code == 403


def test_public_draft_not_leaked(api):
    _insert_user(email='pub@aith.test', role='admin')
    csrf = login(api, 'pub@aith.test')
    create = api.post(
        '/api/admin/blogs',
        json={
            'title': 'Secret Draft Guide',
            'slug': 'secret-draft-guide',
            'excerpt': 'Not for public.',
            'contentMarkdown': '## Hidden\n\nDraft body.',
            'category': 'Global Sourcing',
            'author': {'type': 'Organization', 'name': 'AITH Editorial Team'},
            'seo': {'metaTitle': 'Secret', 'metaDescription': 'Secret draft description here.'},
        },
        headers={'X-CSRF-Token': csrf},
    )
    assert create.status_code == 200, create.text
    pub = api.get('/api/blogs/secret-draft-guide')
    assert pub.status_code == 404


def test_publish_and_public_read(api):
    _insert_user(email='author@aith.test', role='admin')
    csrf = login(api, 'author@aith.test')
    create = api.post(
        '/api/admin/blogs',
        json={
            'title': 'Public Sourcing Note',
            'slug': 'public-sourcing-note',
            'excerpt': 'A short practical excerpt for buyers.',
            'contentMarkdown': '## Overview\n\nUseful content with a [sourcing](/global-sourcing-services) link.',
            'category': 'Global Sourcing',
            'tags': ['sourcing'],
            'author': {'type': 'Organization', 'name': 'AITH Editorial Team'},
            'featuredImage': {'url': '/brand/og-image.jpg', 'alt': 'Cargo operations'},
            'seo': {
                'metaTitle': 'Public Sourcing Note | AITH',
                'metaDescription': 'Practical note on sourcing for international buyers.',
            },
        },
        headers={'X-CSRF-Token': csrf},
    )
    assert create.status_code == 200, create.text
    blog_id = create.json()['id']
    pub = api.post(
        f'/api/admin/blogs/{blog_id}/publish',
        json={'overrideWarnings': True},
        headers={'X-CSRF-Token': csrf},
    )
    assert pub.status_code == 200, pub.text
    got = api.get('/api/blogs/public-sourcing-note')
    assert got.status_code == 200
    assert got.json()['title'] == 'Public Sourcing Note'


def test_csrf_missing_rejected(api):
    _insert_user(email='csrf@aith.test', role='admin')
    login(api, 'csrf@aith.test')
    res = api.post(
        '/api/admin/blogs',
        json={
            'title': 'No CSRF',
            'excerpt': 'Should fail.',
            'contentMarkdown': '## x',
            'category': 'Global Sourcing',
        },
    )
    assert res.status_code == 403


def test_csrf_invalid_rejected(api):
    _insert_user(email='csrf2@aith.test', role='admin')
    login(api, 'csrf2@aith.test')
    res = api.post(
        '/api/admin/blogs',
        json={
            'title': 'Bad CSRF',
            'excerpt': 'Should fail.',
            'contentMarkdown': '## x',
            'category': 'Global Sourcing',
        },
        headers={'X-CSRF-Token': 'not-the-real-token'},
    )
    assert res.status_code == 403


def test_disabled_admin_denied(api):
    _insert_user(email='disabled@aith.test', role='admin', active=False)
    res = api.post(
        '/api/admin/auth/login',
        json={'email': 'disabled@aith.test', 'password': 'CorrectHorseBattery!'},
    )
    assert res.status_code == 401
    assert res.json()['detail'] == 'Invalid credentials.'


def test_password_minimum_enforced(api):
    _insert_user(email='pwmin@aith.test', role='admin')
    csrf = login(api, 'pwmin@aith.test')
    res = api.post(
        '/api/admin/users',
        json={
            'email': 'short@aith.test',
            'displayName': 'Short',
            'password': 'tooshort',
            'role': 'editor',
        },
        headers={'X-CSRF-Token': csrf},
    )
    assert res.status_code == 422


def test_must_change_password_blocks_cms(api):
    _insert_user(email='legacy@aith.test', role='admin', must_change=True)
    csrf = login(api, 'legacy@aith.test')
    res = api.get('/api/admin/blogs')
    assert res.status_code == 403
    # change-password still allowed
    ch = api.post(
        '/api/admin/auth/change-password',
        json={
            'currentPassword': 'CorrectHorseBattery!',
            'newPassword': 'EvenLongerCorrectHorse!!',
        },
        headers={'X-CSRF-Token': csrf},
    )
    assert ch.status_code == 200, ch.text
    assert ch.json().get('reloginRequired') is True
    # old session invalidated
    me = api.get('/api/admin/auth/me')
    assert me.status_code == 401


def test_session_revoked_on_password_change(api):
    _insert_user(email='rotate@aith.test', role='admin')
    csrf = login(api, 'rotate@aith.test')
    res = api.post(
        '/api/admin/auth/change-password',
        json={
            'currentPassword': 'CorrectHorseBattery!',
            'newPassword': 'BrandNewPassphrase99!',
        },
        headers={'X-CSRF-Token': csrf},
    )
    assert res.status_code == 200
    me = api.get('/api/admin/auth/me')
    assert me.status_code == 401


def test_archived_not_public(api):
    _insert_user(email='arch@aith.test', role='admin')
    csrf = login(api, 'arch@aith.test')
    create = api.post(
        '/api/admin/blogs',
        json={
            'title': 'Archive Candidate',
            'slug': 'archive-candidate',
            'excerpt': 'Will be archived after publish.',
            'contentMarkdown': '## Body\n\nWith [link](/services).',
            'category': 'Global Sourcing',
            'author': {'type': 'Organization', 'name': 'AITH Editorial Team'},
            'featuredImage': {'url': '/brand/og-image.jpg', 'alt': 'Ops'},
            'seo': {
                'metaTitle': 'Archive Candidate | AITH',
                'metaDescription': 'Temporary post for archive test coverage.',
            },
        },
        headers={'X-CSRF-Token': csrf},
    )
    assert create.status_code == 200, create.text
    blog_id = create.json()['id']
    assert api.post(
        f'/api/admin/blogs/{blog_id}/publish',
        json={'overrideWarnings': True},
        headers={'X-CSRF-Token': csrf},
    ).status_code == 200
    assert api.post(
        f'/api/admin/blogs/{blog_id}/archive',
        headers={'X-CSRF-Token': csrf},
    ).status_code == 200
    assert api.get('/api/blogs/archive-candidate').status_code == 404


def test_duplicate_slug_rejected(api):
    _insert_user(email='dupe@aith.test', role='admin')
    csrf = login(api, 'dupe@aith.test')
    payload = {
        'title': 'Unique Slug Post',
        'slug': 'unique-slug-once',
        'excerpt': 'First version of this slug.',
        'contentMarkdown': '## One\n\nBody.',
        'category': 'Global Sourcing',
        'author': {'type': 'Organization', 'name': 'AITH Editorial Team'},
        'seo': {'metaTitle': 'Unique', 'metaDescription': 'Unique slug description text.'},
    }
    assert api.post('/api/admin/blogs', json=payload, headers={'X-CSRF-Token': csrf}).status_code == 200
    again = api.post('/api/admin/blogs', json=payload, headers={'X-CSRF-Token': csrf})
    assert again.status_code in (400, 409)


def test_sitemap_excludes_noindex(api):
    _insert_user(email='sm@aith.test', role='admin')
    csrf = login(api, 'sm@aith.test')
    create = api.post(
        '/api/admin/blogs',
        json={
            'title': 'Noindex Guide',
            'slug': 'noindex-guide',
            'excerpt': 'Published but noindex.',
            'contentMarkdown': '## Body\n\n[Services](/services).',
            'category': 'Global Sourcing',
            'author': {'type': 'Organization', 'name': 'AITH Editorial Team'},
            'featuredImage': {'url': '/brand/og-image.jpg', 'alt': 'Ops'},
            'seo': {
                'metaTitle': 'Noindex Guide | AITH',
                'metaDescription': 'Should not appear in blog sitemap.',
                'index': False,
            },
        },
        headers={'X-CSRF-Token': csrf},
    )
    blog_id = create.json()['id']
    api.post(
        f'/api/admin/blogs/{blog_id}/publish',
        json={'overrideWarnings': True},
        headers={'X-CSRF-Token': csrf},
    )
    sm = api.get('/api/blog-sitemap.xml')
    assert sm.status_code == 200
    assert 'application/xml' in sm.headers.get('content-type', '')
    assert 'noindex-guide' not in sm.text


def test_health_has_version(api):
    res = api.get('/api/health')
    assert res.status_code == 200
    body = res.json()
    assert 'database' in body
    assert 'version' in body
    assert 'notifications' in body
