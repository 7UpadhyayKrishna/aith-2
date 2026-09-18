"""Admin operations: dashboard, enquiries, quotes, careers, SEO, system, users, audit."""
from __future__ import annotations

import csv
import io
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field

from cms import config
from cms.audit import write_audit
from cms.blog_models import seo_health_checks
from cms.deps import get_db, require_role, require_role_read
from cms.security import hash_password, iso_now, public_user, utcnow

router = APIRouter(prefix='/admin', tags=['admin-ops'])

EditorRead = Depends(require_role_read(config.ROLE_ADMIN, config.ROLE_EDITOR))
AdminRead = Depends(require_role_read(config.ROLE_ADMIN))
AdminWrite = Depends(require_role(config.ROLE_ADMIN))
EditorWrite = Depends(require_role(config.ROLE_ADMIN, config.ROLE_EDITOR))
# PII / operations — ADMIN only (editors do not see enquiry/quote/career contact data)
OpsRead = Depends(require_role_read(config.ROLE_ADMIN))
OpsWrite = Depends(require_role(config.ROLE_ADMIN))


def _client_ip(request: Request) -> str:
    from cms.request_utils import client_ip

    return client_ip(request)


@router.get('/dashboard')
async def dashboard(user: dict = EditorRead, db=Depends(get_db)):
    from cms.blog_models import is_refresh_due, seo_health_checks

    now = utcnow().isoformat()
    published = await db.blogs.count_documents({'status': 'published'})
    drafts = await db.blogs.count_documents({'status': 'draft'})
    review = await db.blogs.count_documents({'status': 'review'})
    scheduled = await db.blogs.count_documents({'status': 'scheduled'})
    elapsed_scheduled = await db.blogs.count_documents({'status': 'scheduled', 'scheduledAt': {'$lte': now}})

    new_enquiries = await db.contact_submissions.count_documents({
        '$or': [{'internalStatus': {'$exists': False}}, {'internalStatus': 'new'}],
    })
    new_quotes = await db.quote_submissions.count_documents({
        '$or': [{'internalStatus': {'$exists': False}}, {'internalStatus': 'new'}],
    })

    recent_drafts = [
        serialize_lite(d)
        async for d in db.blogs.find({'status': 'draft'}, {'_id': 0}).sort('updatedAt', -1).limit(5)
    ]
    recent_review = [
        serialize_lite(d)
        async for d in db.blogs.find({'status': 'review'}, {'_id': 0}).sort('updatedAt', -1).limit(5)
    ]
    recent_scheduled = [
        serialize_lite(d)
        async for d in db.blogs.find({'status': 'scheduled'}, {'_id': 0}).sort('scheduledAt', 1).limit(5)
    ]
    recent_published = [
        serialize_lite(d)
        async for d in db.blogs.find({'status': 'published'}, {'_id': 0}).sort('publishedAt', -1).limit(8)
    ]

    recent_enquiries = []
    recent_quotes = []
    is_admin = user.get('role') == config.ROLE_ADMIN
    if is_admin:
        async for d in db.contact_submissions.find({}, {'_id': 0}).sort('createdAt', -1).limit(5):
            recent_enquiries.append({
                'id': d.get('id'),
                'name': d.get('name'),
                'company': d.get('company'),
                'type': d.get('kind') or d.get('intent') or 'contact',
                'status': d.get('internalStatus') or 'new',
                'notificationStatus': d.get('notificationStatus'),
                'createdAt': d.get('createdAt'),
            })
        async for d in db.quote_submissions.find({}, {'_id': 0}).sort('createdAt', -1).limit(5):
            recent_quotes.append({
                'id': d.get('id'),
                'name': d.get('name'),
                'company': d.get('company'),
                'reference': d.get('reference'),
                'status': d.get('internalStatus') or 'new',
                'notificationStatus': d.get('notificationStatus'),
                'createdAt': d.get('createdAt'),
            })

    # Attention needed + SEO warnings
    seo_warnings = []
    attention: dict[str, list] = {
        'missingMeta': [],
        'missingCoverAlt': [],
        'noInternalLink': [],
        'refreshDue': [],
    }
    refresh_due_count = 0
    async for d in db.blogs.find({}, {'_id': 0}).sort('updatedAt', -1).limit(120):
        if is_refresh_due(d):
            refresh_due_count += 1
            if len(attention['refreshDue']) < 8:
                attention['refreshDue'].append({
                    'blogId': d.get('id'),
                    'title': d.get('title'),
                    'slug': d.get('slug'),
                    'filter': 'needsRefresh=true',
                    'message': 'Not reviewed in >180 days or marked needs refresh',
                })
        for c in seo_health_checks(d):
            if c['level'] in ('WARNING', 'ERROR'):
                seo_warnings.append({
                    'blogId': d.get('id'),
                    'slug': d.get('slug'),
                    'title': d.get('title'),
                    **c,
                })
            if c['code'] in ('meta_description', 'meta_title') and c['level'] != 'PASS' and d.get('status') == 'draft':
                if len(attention['missingMeta']) < 8:
                    attention['missingMeta'].append({
                        'blogId': d.get('id'),
                        'title': d.get('title'),
                        'slug': d.get('slug'),
                        'filter': 'seoIssue=missing-metadata&status=draft',
                        'message': c['message'],
                    })
            if c['code'] in ('cover_alt', 'image_alt') and c['level'] != 'PASS':
                if len(attention['missingCoverAlt']) < 8:
                    attention['missingCoverAlt'].append({
                        'blogId': d.get('id'),
                        'title': d.get('title'),
                        'slug': d.get('slug'),
                        'filter': 'seoIssue=missing-alt',
                        'message': c['message'],
                    })
            if c['code'] in ('internal_links', 'pillar_link') and c['level'] != 'PASS' and d.get('status') in ('scheduled', 'published'):
                if len(attention['noInternalLink']) < 8:
                    attention['noInternalLink'].append({
                        'blogId': d.get('id'),
                        'title': d.get('title'),
                        'slug': d.get('slug'),
                        'filter': 'seoIssue=no-internal-links',
                        'message': c['message'],
                    })
    seo_warnings = seo_warnings[:20]

    attention_items = []
    if attention['missingMeta']:
        attention_items.append({
            'count': len(attention['missingMeta']),
            'label': 'drafts missing meta description',
            'href': '/admin/blogs?seoIssue=missing-metadata&status=draft',
            'items': attention['missingMeta'],
        })
    if attention['missingCoverAlt']:
        attention_items.append({
            'count': len(attention['missingCoverAlt']),
            'label': 'posts missing cover alt text',
            'href': '/admin/blogs?seoIssue=missing-alt',
            'items': attention['missingCoverAlt'],
        })
    if attention['noInternalLink']:
        attention_items.append({
            'count': len(attention['noInternalLink']),
            'label': 'scheduled/published without internal service link',
            'href': '/admin/blogs?seoIssue=no-internal-links',
            'items': attention['noInternalLink'],
        })
    if attention['refreshDue']:
        attention_items.append({
            'count': refresh_due_count,
            'label': 'published posts not reviewed in >180 days',
            'href': '/admin/blogs?needsRefresh=true',
            'items': attention['refreshDue'],
        })

    pipeline_agg = [
        {'$group': {'_id': '$slug', 'count': {'$sum': 1}}},
        {'$match': {'count': {'$gt': 1}}},
    ]
    dupes = [x async for x in db.blogs.aggregate(pipeline_agg)]

    db_ok = False
    try:
        await db.command('ping')
        db_ok = True
    except Exception:
        db_ok = False

    smtp_state = _smtp_state()

    return {
        'summary': {
            'publishedBlogs': published + elapsed_scheduled,
            'draftBlogs': drafts,
            'reviewBlogs': review,
            'scheduledBlogs': scheduled,
            'refreshDue': refresh_due_count,
            'newEnquiries': new_enquiries,
            'newQuoteRequests': new_quotes,
        },
        'pipeline': {
            'drafts': recent_drafts,
            'review': recent_review,
            'scheduled': recent_scheduled,
            'published': recent_published,
        },
        'operations': {
            'enquiries': recent_enquiries,
            'quotes': recent_quotes,
        },
        'attentionNeeded': attention_items,
        'seoWarnings': seo_warnings,
        'duplicateSlugs': dupes,
        'system': {
            'api': 'ONLINE',
            'database': 'CONNECTED' if db_ok else 'ERROR',
            'emailNotifications': smtp_state.upper(),
        },
    }


def serialize_lite(d: dict) -> dict:
    author = d.get('author') or {}
    return {
        'id': d.get('id'),
        'title': d.get('title'),
        'slug': d.get('slug'),
        'status': d.get('status'),
        'author': author.get('name'),
        'updatedAt': d.get('updatedAt'),
        'publishedAt': d.get('publishedAt'),
        'scheduledAt': d.get('scheduledAt'),
        'category': d.get('category'),
    }


def _smtp_state() -> str:
    import os

    keys = ('OPS_NOTIFICATION_EMAIL', 'SMTP_HOST', 'SMTP_FROM')
    present = any(os.environ.get(k) for k in ('OPS_NOTIFICATION_EMAIL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_FROM', 'SMTP_USERNAME'))
    if not present:
        return 'disabled'
    if all(os.environ.get(k) for k in keys):
        return 'enabled'
    return 'error'


# ---- Enquiries ----

class StatusBody(BaseModel):
    internalStatus: str
    internalNote: Optional[str] = Field(default=None, max_length=2000)


ENQUIRY_STATUSES = {'new', 'read', 'in-progress', 'resolved', 'archived'}
QUOTE_STATUSES = {'new', 'reviewing', 'responded', 'closed', 'archived'}


@router.get('/enquiries')
async def list_enquiries(
    user: dict = OpsRead,
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=config.MAX_PAGE_SIZE),
    status: Optional[str] = None,
    search: Optional[str] = None,
):
    q: dict[str, Any] = {}
    if status:
        if status == 'new':
            q['$or'] = [{'internalStatus': 'new'}, {'internalStatus': {'$exists': False}}]
        else:
            q['internalStatus'] = status
    if search:
        from cms.request_utils import escape_regex

        term = escape_regex(search, max_len=100)
        q['$and'] = q.get('$and', []) + [{
            '$or': [
                {'name': {'$regex': term, '$options': 'i'}},
                {'email': {'$regex': term, '$options': 'i'}},
                {'company': {'$regex': term, '$options': 'i'}},
            ]
        }]
    total = await db.contact_submissions.count_documents(q)
    cursor = db.contact_submissions.find(q, {'_id': 0}).sort('createdAt', -1).skip((page - 1) * limit).limit(limit)
    items = []
    async for d in cursor:
        items.append({
            'id': d.get('id'),
            'createdAt': d.get('createdAt'),
            'name': d.get('name'),
            'company': d.get('company'),
            'email': d.get('email'),
            'type': d.get('kind') or d.get('intent') or 'contact',
            'notificationStatus': d.get('notificationStatus'),
            'internalStatus': d.get('internalStatus') or 'new',
            'subject': d.get('subject'),
        })
    return {'items': items, 'page': page, 'limit': limit, 'total': total}


@router.get('/enquiries/export.csv')
async def export_enquiries_csv(user: dict = OpsRead, db=Depends(get_db)):
    cursor = db.contact_submissions.find({}, {'_id': 0}).sort('createdAt', -1).limit(2000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(['id', 'createdAt', 'name', 'company', 'email', 'phone', 'type', 'status', 'notificationStatus', 'subject'])
    async for d in cursor:
        writer.writerow([
            d.get('id'), d.get('createdAt'), d.get('name'), d.get('company'), d.get('email'),
            d.get('phone'), d.get('kind') or d.get('intent'), d.get('internalStatus') or 'new',
            d.get('notificationStatus'), d.get('subject'),
        ])
    return Response(content=buf.getvalue(), media_type='text/csv', headers={
        'Content-Disposition': 'attachment; filename="enquiries.csv"',
    })


@router.get('/enquiries/{enquiry_id}')
async def get_enquiry(enquiry_id: str, user: dict = OpsRead, db=Depends(get_db)):
    d = await db.contact_submissions.find_one({'id': enquiry_id}, {'_id': 0})
    if not d:
        raise HTTPException(status_code=404, detail='Not found')
    d['internalStatus'] = d.get('internalStatus') or 'new'
    return d


@router.patch('/enquiries/{enquiry_id}')
async def patch_enquiry(enquiry_id: str, body: StatusBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    if body.internalStatus not in ENQUIRY_STATUSES:
        raise HTTPException(status_code=400, detail='Invalid status')
    update = {'internalStatus': body.internalStatus, 'updatedAt': iso_now(), 'updatedBy': user['id']}
    if body.internalNote is not None:
        update['internalNote'] = body.internalNote
    res = await db.contact_submissions.update_one({'id': enquiry_id}, {'$set': update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    await write_audit(
        db,
        action='ENQUIRY_STATUS_CHANGED',
        admin_user_id=user['id'],
        resource_type='enquiry',
        resource_id=enquiry_id,
        result='ok',
        meta={'status': body.internalStatus},
        ip=_client_ip(request),
    )
    return {'ok': True}


# ---- Quotes ----

@router.get('/quotes')
async def list_quotes(
    user: dict = OpsRead,
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=config.MAX_PAGE_SIZE),
    status: Optional[str] = None,
    search: Optional[str] = None,
):
    q: dict[str, Any] = {}
    if status:
        if status == 'new':
            q['$or'] = [{'internalStatus': 'new'}, {'internalStatus': {'$exists': False}}]
        else:
            q['internalStatus'] = status
    if search:
        from cms.request_utils import escape_regex

        term = escape_regex(search, max_len=100)
        q['$or'] = [
            {'name': {'$regex': term, '$options': 'i'}},
            {'company': {'$regex': term, '$options': 'i'}},
            {'reference': {'$regex': term, '$options': 'i'}},
            {'product': {'$regex': term, '$options': 'i'}},
        ]
    total = await db.quote_submissions.count_documents(q)
    cursor = db.quote_submissions.find(q, {'_id': 0}).sort('createdAt', -1).skip((page - 1) * limit).limit(limit)
    items = []
    async for d in cursor:
        items.append({
            'id': d.get('id'),
            'createdAt': d.get('createdAt'),
            'name': d.get('name'),
            'company': d.get('company'),
            'email': d.get('email'),
            'reference': d.get('reference'),
            'product': d.get('product'),
            'notificationStatus': d.get('notificationStatus'),
            'internalStatus': d.get('internalStatus') or 'new',
        })
    return {'items': items, 'page': page, 'limit': limit, 'total': total}


@router.get('/quotes/{quote_id}')
async def get_quote(quote_id: str, user: dict = OpsRead, db=Depends(get_db)):
    d = await db.quote_submissions.find_one({'id': quote_id}, {'_id': 0})
    if not d:
        raise HTTPException(status_code=404, detail='Not found')
    d['internalStatus'] = d.get('internalStatus') or 'new'
    return d


@router.patch('/quotes/{quote_id}')
async def patch_quote(quote_id: str, body: StatusBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    if body.internalStatus not in QUOTE_STATUSES:
        raise HTTPException(status_code=400, detail='Invalid status')
    update = {'internalStatus': body.internalStatus, 'updatedAt': iso_now(), 'updatedBy': user['id']}
    if body.internalNote is not None:
        update['internalNote'] = body.internalNote
    res = await db.quote_submissions.update_one({'id': quote_id}, {'$set': update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    await write_audit(
        db,
        action='QUOTE_STATUS_CHANGED',
        admin_user_id=user['id'],
        resource_type='quote',
        resource_id=quote_id,
        result='ok',
        meta={'status': body.internalStatus},
        ip=_client_ip(request),
    )
    return {'ok': True}


# ---- Careers applications ----

@router.get('/careers')
async def list_careers(
    user: dict = OpsRead,
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=config.MAX_PAGE_SIZE),
):
    total = await db.career_submissions.count_documents({})
    cursor = db.career_submissions.find({}, {'_id': 0}).sort('createdAt', -1).skip((page - 1) * limit).limit(limit)
    items = [d async for d in cursor]
    for d in items:
        d['internalStatus'] = d.get('internalStatus') or 'new'
    return {'items': items, 'page': page, 'limit': limit, 'total': total}


# ---- SEO ----

@router.get('/seo')
async def seo_overview(user: dict = EditorRead, db=Depends(get_db)):
    from cms.blog_models import is_refresh_due

    published = await db.blogs.count_documents({'status': 'published'})
    drafts = await db.blogs.count_documents({'status': 'draft'})
    review = await db.blogs.count_documents({'status': 'review'})
    scheduled = await db.blogs.count_documents({'status': 'scheduled'})
    indexed = await db.blogs.count_documents({'status': 'published', 'seo.index': {'$ne': False}})
    noindex = await db.blogs.count_documents({'status': 'published', 'seo.index': False})
    missing_meta = await db.blogs.count_documents({
        'status': {'$in': ['published', 'draft', 'review', 'scheduled']},
        '$or': [
            {'seo.metaDescription': {'$in': [None, '']}},
            {'excerpt': {'$in': [None, '']}},
        ],
    })
    missing_alt = await db.blogs.count_documents({
        '$or': [
            {'cover.image.url': {'$nin': [None, '']}, 'cover.image.alt': {'$in': [None, '']}},
            {'featuredImage.url': {'$nin': [None, '']}, 'featuredImage.alt': {'$in': [None, '']}},
        ],
    })
    canonical_overrides = await db.blogs.count_documents({'seo.canonicalUrl': {'$nin': [None, '']}})

    refresh_due = 0
    orphan_candidates = []
    issues = []
    publishing_month = 0
    from datetime import datetime, timezone
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    async for d in db.blogs.find({'status': {'$in': ['published', 'draft', 'scheduled', 'review']}}, {'_id': 0}).limit(200):
        if is_refresh_due(d):
            refresh_due += 1
        pub = d.get('publishedAt') or ''
        if d.get('status') == 'published' and pub >= month_start:
            publishing_month += 1
        # Orphan heuristic: published, not featured, no relatedSlugs, thin tags
        if (
            d.get('status') == 'published'
            and not d.get('featured')
            and not (d.get('relatedSlugs') or [])
        ):
            orphan_candidates.append({
                'blogId': d.get('id'),
                'slug': d.get('slug'),
                'title': d.get('title'),
                'message': 'May lack internal discovery paths beyond /blogs listing',
            })
        for c in seo_health_checks(d):
            if c['level'] != 'PASS':
                issues.append({'blogId': d.get('id'), 'slug': d.get('slug'), 'title': d.get('title'), **c})

    return {
        'contentHealth': {
            'published': published,
            'draft': drafts,
            'review': review,
            'scheduled': scheduled,
            'refreshDue': refresh_due,
        },
        'editorial': {
            'publishingThisMonth': publishing_month,
            'reviewQueue': review,
            'scheduledNext': scheduled,
        },
        'publishedBlogCount': published,
        'indexedIntendedCount': indexed,
        'noindexCount': noindex,
        'missingMetadata': missing_meta,
        'missingImageAlt': missing_alt,
        'canonicalOverrides': canonical_overrides,
        'refreshDue': refresh_due,
        'orphanCandidates': orphan_candidates[:20],
        'issues': issues[:50],
        'links': {
            'sitemap': f'{config.SITE_ORIGIN}/sitemap.xml',
            'robots': f'{config.SITE_ORIGIN}/robots.txt',
            'blogSitemap': f'{config.SITE_ORIGIN}/blog-sitemap.xml',
            'richResultsTest': 'https://search.google.com/test/rich-results',
            'searchConsole': 'https://search.google.com/search-console',
        },
        'postPublishChecklist': [
            'Day 0: verify live URL, canonical, BlogPosting schema, images, sitemap, internal links',
            'Day 14–30: review indexing / impressions in Search Console',
            'Day 30–90: review queries/clicks; improve title or intro only if data supports it',
            '6 months: content review (lastReviewedAt / nextReviewAt)',
        ],
    }


# ---- System ----

@router.get('/system')
async def system_status(request: Request, user: dict = AdminRead, db=Depends(get_db)):
    import os

    db_ok = False
    try:
        await db.command('ping')
        db_ok = True
    except Exception:
        db_ok = False

    last_login = None
    async for d in db.admin_audit_logs.find({'action': 'LOGIN_SUCCESS'}, {'_id': 0}).sort('timestamp', -1).limit(1):
        last_login = d.get('timestamp')

    secret_set = bool(os.environ.get('ADMIN_SESSION_SECRET', '').strip()) and len(
        os.environ.get('ADMIN_SESSION_SECRET', '').strip()
    ) >= 32
    cors_raw = os.environ.get('CORS_ORIGINS', '').strip()
    cors_ok = bool(cors_raw) and cors_raw != '*' and '*' not in [o.strip() for o in cors_raw.split(',')]

    mfa_status = 'DISABLED'
    if config.MFA_ENABLED:
        mfa_status = 'REQUIRED' if config.MFA_REQUIRED_FOR_ADMIN else 'OPTIONAL'

    return {
        'frontendVersion': os.environ.get('FRONTEND_VERSION', '0.1.0'),
        'apiVersion': config.APP_VERSION,
        'api': 'ONLINE',
        'database': 'CONNECTED' if db_ok else 'ERROR',
        'smtp': _smtp_state(),
        'lastSuccessfulAdminLogin': last_login,
        'environment': os.environ.get('APP_ENV', os.environ.get('ENVIRONMENT', 'development')),
        'healthPath': '/api/health',
        'mfa': mfa_status,
        'productionReadiness': {
            'mongoConfigured': db_ok,
            'smtpConfigured': _smtp_state() == 'enabled',
            'secureCookiesEnabled': config.COOKIE_SECURE,
            'sessionSecretConfigured': secret_set,
            'corsExplicit': cors_ok,
            'legalDraftMode': os.environ.get('REACT_APP_SHOW_LEGAL_DRAFT', 'true') != 'false',
            'blogSitemapPath': '/api/blog-sitemap.xml',
            'blogSitemapPublicHint': f'{config.SITE_ORIGIN}/blog-sitemap.xml',
            'analyticsNote': 'Configured in frontend build; admin SPA pageviews should be excluded',
            'adminMfa': mfa_status,
            'siteOrigin': config.SITE_ORIGIN,
        },
    }


# ---- Users (admin only) ----

class CreateUserBody(BaseModel):
    email: str = Field(max_length=200)
    displayName: str = Field(max_length=120)
    password: str = Field(min_length=config.MIN_PASSWORD_LENGTH, max_length=config.MAX_PASSWORD_LENGTH)
    role: str = 'editor'


@router.get('/users')
async def list_users(user: dict = AdminRead, db=Depends(get_db)):
    items = []
    async for d in db.admin_users.find({}, {'_id': 0, 'passwordHash': 0, 'mfaSecret': 0, 'mfaPendingSecret': 0, 'mfaRecoveryHashes': 0}):
        items.append(public_user(d))
    return {'items': items}


@router.post('/users')
async def create_user(body: CreateUserBody, request: Request, user: dict = AdminWrite, db=Depends(get_db)):
    if body.role not in (config.ROLE_ADMIN, config.ROLE_EDITOR):
        raise HTTPException(status_code=400, detail='Invalid role')
    email = body.email.strip().lower()
    if await db.admin_users.find_one({'email': email}):
        raise HTTPException(status_code=409, detail='Email already exists')
    now = iso_now()
    doc = {
        'id': str(uuid.uuid4()),
        'email': email,
        'displayName': body.displayName.strip(),
        'passwordHash': hash_password(body.password),
        'role': body.role,
        'active': True,
        'createdAt': now,
        'updatedAt': now,
        'lastLoginAt': None,
        'passwordPolicyVersion': config.PASSWORD_POLICY_VERSION,
        'mustChangePassword': False,
        'mfaEnabled': False,
    }
    await db.admin_users.insert_one(doc)
    await write_audit(
        db,
        action='ADMIN_CREATED',
        admin_user_id=user['id'],
        resource_type='admin_user',
        resource_id=doc['id'],
        result='ok',
        meta={'email': email, 'role': body.role},
        ip=_client_ip(request),
    )
    return {'user': public_user(doc)}


@router.post('/users/{user_id}/disable')
async def disable_user(user_id: str, request: Request, user: dict = AdminWrite, db=Depends(get_db)):
    if user_id == user.get('id'):
        raise HTTPException(status_code=400, detail='Cannot disable your own account')
    res = await db.admin_users.update_one({'id': user_id}, {'$set': {'active': False, 'updatedAt': iso_now()}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    await db.admin_sessions.delete_many({'userId': user_id})
    await write_audit(
        db,
        action='ADMIN_DISABLED',
        admin_user_id=user['id'],
        resource_type='admin_user',
        resource_id=user_id,
        result='ok',
        ip=_client_ip(request),
    )
    return {'ok': True}


# ---- Audit ----

@router.get('/audit')
async def list_audit(
    user: dict = AdminRead,
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(40, ge=1, le=config.MAX_PAGE_SIZE),
    action: Optional[str] = None,
    adminUserId: Optional[str] = None,
    resourceType: Optional[str] = None,
    resourceId: Optional[str] = None,
    result: Optional[str] = None,
    fromDate: Optional[str] = None,
    toDate: Optional[str] = None,
):
    q: dict[str, Any] = {}
    if action:
        q['action'] = action
    if adminUserId:
        q['adminUserId'] = adminUserId
    if resourceType:
        q['resourceType'] = resourceType
    if resourceId:
        q['resourceId'] = resourceId
    if result:
        q['result'] = result
    if fromDate or toDate:
        q['timestamp'] = {}
        if fromDate:
            q['timestamp']['$gte'] = fromDate
        if toDate:
            q['timestamp']['$lte'] = toDate
    total = await db.admin_audit_logs.count_documents(q)
    cursor = db.admin_audit_logs.find(q, {'_id': 0}).sort('timestamp', -1).skip((page - 1) * limit).limit(limit)
    items = [d async for d in cursor]
    return {'items': items, 'page': page, 'limit': limit, 'total': total}
