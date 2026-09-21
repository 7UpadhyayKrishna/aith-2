"""Jobs CMS + careers application workflow tests."""
from __future__ import annotations

import asyncio
import os
import uuid

import pytest

os.environ['CORS_ORIGINS'] = 'http://localhost:3000'
os.environ['ADMIN_SESSION_SECRET'] = 'test-secret-key-at-least-32-chars!!'
os.environ['ADMIN_COOKIE_SECURE'] = 'false'
os.environ['APP_ENV'] = 'test'
os.environ.pop('ADMIN_MFA_ENABLED', None)

if not os.environ.get('DATABASE_URL'):
    from pathlib import Path
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / '.env')

if not os.environ.get('DATABASE_URL'):
    pytest.skip('DATABASE_URL required for CMS tests', allow_module_level=True)

from fastapi.testclient import TestClient  # noqa: E402

from server import app  # noqa: E402
from cms import config  # noqa: E402
from cms.pg_store import TABLES  # noqa: E402
from cms.security import hash_password, iso_now  # noqa: E402

_API = None


def _run(async_fn, *args, **kwargs):
    """Run async callable on the TestClient portal (same loop as asyncpg pool)."""
    assert _API is not None, 'TestClient fixture not active'
    return _API.portal.call(async_fn, *args, **kwargs)


@pytest.fixture(scope='module')
def api():
    global _API
    with TestClient(app) as c:
        _API = c
        yield c
    _API = None


@pytest.fixture(autouse=True)
def clean_db(api):
    from cms.auth_router import reset_login_rate_limits

    reset_login_rate_limits()

    async def wipe():
        db = app.state.db
        assert db is not None
        for name in TABLES:
            await getattr(db, name).delete_many({})

    _run(wipe)
    yield


def _insert_user(*, email: str, role: str):
    doc = {
        'id': str(uuid.uuid4()),
        'email': email,
        'displayName': role.title(),
        'passwordHash': hash_password('CorrectHorseBattery!'),
        'role': role,
        'active': True,
        'createdAt': iso_now(),
        'updatedAt': iso_now(),
        'passwordPolicyVersion': config.PASSWORD_POLICY_VERSION,
        'mustChangePassword': False,
        'mfaEnabled': False,
    }

    async def go():
        await app.state.db.admin_users.insert_one(doc)

    _run(go)
    return doc


def _login(api, email: str):
    res = api.post('/api/admin/auth/login', json={'email': email, 'password': 'CorrectHorseBattery!'})
    assert res.status_code == 200, res.text
    return res


def _csrf(api):
    me = api.get('/api/admin/auth/me')
    assert me.status_code == 200
    return me.json()['csrfToken']


def test_job_draft_publish_public_list_and_detail(api):
    admin = _insert_user(email='jobs-admin@example.com', role='admin')
    _login(api, admin['email'])
    csrf = _csrf(api)

    create = api.post(
        '/api/admin/jobs',
        headers={'X-CSRF-Token': csrf},
        json={
            'title': 'Trade Coordinator',
            'slug': 'trade-coordinator-test',
            'team': 'Operations',
            'location': 'New Delhi',
            'type': 'Full-time',
            'blurb': 'Coordinate trade lanes.',
            'responsibilities': ['Track milestones'],
            'requirements': ['1-3 years ops'],
            'status': 'draft',
            'salaryMin': 500000,
            'salaryMax': 800000,
            'salaryCurrency': 'INR',
            'salaryPeriod': 'year',
        },
    )
    assert create.status_code == 200, create.text
    job = create.json()
    assert job['status'] == 'draft'
    assert job['salaryCurrency'] == 'INR'

    public_empty = api.get('/api/careers/jobs')
    assert public_empty.status_code == 200
    assert public_empty.json()['total'] == 0

    pub = api.post(f"/api/admin/jobs/{job['id']}/publish", headers={'X-CSRF-Token': csrf}, json={})
    assert pub.status_code == 200

    public_list = api.get('/api/careers/jobs')
    assert public_list.status_code == 200
    items = public_list.json()['items']
    assert len(items) == 1
    assert items[0]['slug'] == 'trade-coordinator-test'
    assert items[0]['acceptingApplications'] is True

    detail = api.get('/api/careers/jobs/trade-coordinator-test')
    assert detail.status_code == 200
    assert detail.json()['title'] == 'Trade Coordinator'


def test_duplicate_slug_rejected(api):
    admin = _insert_user(email='slug-admin@example.com', role='admin')
    _login(api, admin['email'])
    csrf = _csrf(api)
    body = {
        'title': 'Role A',
        'slug': 'dup-slug',
        'team': 'Ops',
        'blurb': 'x',
        'status': 'draft',
    }
    assert api.post('/api/admin/jobs', headers={'X-CSRF-Token': csrf}, json=body).status_code == 200
    clash = api.post('/api/admin/jobs', headers={'X-CSRF-Token': csrf}, json={**body, 'title': 'Role B'})
    assert clash.status_code == 409


def test_unpublish_and_delete_rules(api):
    admin = _insert_user(email='del-admin@example.com', role='admin')
    _login(api, admin['email'])
    csrf = _csrf(api)
    job = api.post(
        '/api/admin/jobs',
        headers={'X-CSRF-Token': csrf},
        json={'title': 'Temp Role', 'slug': 'temp-role', 'blurb': 'x', 'status': 'draft'},
    ).json()
    api.post(f"/api/admin/jobs/{job['id']}/publish", headers={'X-CSRF-Token': csrf}, json={})
    delete_pub = api.delete(f"/api/admin/jobs/{job['id']}", headers={'X-CSRF-Token': csrf})
    assert delete_pub.status_code == 400
    api.post(f"/api/admin/jobs/{job['id']}/unpublish", headers={'X-CSRF-Token': csrf}, json={})
    assert api.delete(f"/api/admin/jobs/{job['id']}", headers={'X-CSRF-Token': csrf}).status_code == 200


def test_apply_published_job_and_reject_unpublished(api):
    admin = _insert_user(email='hire-admin@example.com', role='admin')
    _login(api, admin['email'])
    csrf = _csrf(api)
    job = api.post(
        '/api/admin/jobs',
        headers={'X-CSRF-Token': csrf},
        json={
            'title': 'Sourcing Associate',
            'slug': 'sourcing-associate-test',
            'team': 'Sourcing',
            'blurb': 'Support sourcing.',
            'status': 'draft',
        },
    ).json()

    bad = api.post(
        '/api/contact',
        json={
            'name': 'Applicant',
            'email': 'a@example.com',
            'message': 'I would like to apply.',
            'kind': 'careers',
            'intent': 'careers',
            'jobId': job['id'],
            'jobTitle': 'Forged Title',
        },
    )
    assert bad.status_code == 400

    api.post(f"/api/admin/jobs/{job['id']}/publish", headers={'X-CSRF-Token': csrf}, json={})
    ok = api.post(
        '/api/contact',
        json={
            'name': 'Applicant',
            'email': 'a@example.com',
            'message': 'I would like to apply.',
            'kind': 'careers',
            'intent': 'careers',
            'jobId': job['id'],
            'jobTitle': 'Forged Title',
        },
    )
    assert ok.status_code == 200, ok.text
    app_id = ok.json()['id']

    detail = api.get(f'/api/admin/careers/{app_id}')
    assert detail.status_code == 200
    body = detail.json()
    assert body['jobId'] == job['id']
    assert body['jobTitle'] == 'Sourcing Associate'  # trusted from job, not client
    assert body['internalStatus'] == 'new'
    assert any(e.get('eventType') == 'applied' for e in body.get('activity') or [])


def test_invalid_job_id_rejected(api):
    res = api.post(
        '/api/contact',
        json={
            'name': 'X',
            'email': 'x@example.com',
            'message': 'Hello',
            'kind': 'careers',
            'jobId': 'does-not-exist',
        },
    )
    assert res.status_code == 400


def test_assignment_note_status_admin_only_pii(api):
    admin = _insert_user(email='ops-admin@example.com', role='admin')
    editor = _insert_user(email='ops-editor@example.com', role='editor')
    _login(api, admin['email'])
    csrf = _csrf(api)

    # Seed an application
    job = api.post(
        '/api/admin/jobs',
        headers={'X-CSRF-Token': csrf},
        json={'title': 'Role', 'slug': 'role-x', 'blurb': 'x', 'status': 'published', 'postedAt': '2026-09-01'},
    ).json()
    app = api.post(
        '/api/contact',
        json={
            'name': 'Cand',
            'email': 'cand@example.com',
            'message': 'Apply',
            'kind': 'careers',
            'jobId': job['id'],
        },
    ).json()

    assigned = api.post(
        f"/api/admin/careers/{app['id']}/assign",
        headers={'X-CSRF-Token': csrf},
        json={'assignedTo': admin['id']},
    )
    assert assigned.status_code == 200, assigned.text
    assert assigned.json()['assignedTo'] == admin['id']

    note = api.post(
        f"/api/admin/careers/{app['id']}/notes",
        headers={'X-CSRF-Token': csrf},
        json={'body': 'Strong ops background'},
    )
    assert note.status_code == 200

    status = api.patch(
        f"/api/admin/careers/{app['id']}",
        headers={'X-CSRF-Token': csrf},
        json={'internalStatus': 'interview'},
    )
    assert status.status_code == 200

    # Editor cannot access careers PII
    api.post('/api/admin/auth/logout', headers={'X-CSRF-Token': csrf}, json={})
    _login(api, editor['email'])
    assert api.get('/api/admin/careers').status_code == 403
    assert api.get('/api/admin/jobs').status_code == 403


def test_cannot_assign_pii_to_editor(api):
    admin = _insert_user(email='rbac-admin@example.com', role='admin')
    editor = _insert_user(email='rbac-editor@example.com', role='editor')
    _login(api, admin['email'])
    csrf = _csrf(api)

    async def seed_enquiry():
        doc = {
            'id': str(uuid.uuid4()),
            'name': 'Buyer',
            'email': 'buyer@example.com',
            'message': 'Hello',
            'createdAt': iso_now(),
            'internalStatus': 'new',
        }
        await app.state.db.contact_submissions.insert_one(doc)
        return doc['id']

    eid = _run(seed_enquiry)
    res = api.post(
        f'/api/admin/enquiries/{eid}/assign',
        headers={'X-CSRF-Token': csrf},
        json={'assignedTo': editor['id']},
    )
    assert res.status_code == 403


def test_archived_job_detail_not_404(api):
    admin = _insert_user(email='arch-admin@example.com', role='admin')
    _login(api, admin['email'])
    csrf = _csrf(api)
    job = api.post(
        '/api/admin/jobs',
        headers={'X-CSRF-Token': csrf},
        json={'title': 'Closed Role', 'slug': 'closed-role', 'blurb': 'x', 'status': 'published', 'postedAt': '2026-01-01'},
    ).json()
    api.patch(
        f"/api/admin/jobs/{job['id']}",
        headers={'X-CSRF-Token': csrf},
        json={
            'title': 'Closed Role',
            'slug': 'closed-role',
            'blurb': 'x',
            'status': 'archived',
            'responsibilities': [],
            'requirements': [],
        },
    )
    detail = api.get('/api/careers/jobs/closed-role')
    assert detail.status_code == 200
    assert detail.json()['acceptingApplications'] is False
    assert api.get('/api/careers/jobs').json()['total'] == 0
