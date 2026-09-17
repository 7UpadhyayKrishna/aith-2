"""Admin blog CRUD, publish, revisions, import/export."""
from __future__ import annotations

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from cms import config
from cms.audit import write_audit
from cms.blog_models import (
    find_title_overlap,
    has_blocking_errors,
    is_refresh_due,
    link_suggestions_for,
    seo_health_checks,
    seo_issue_codes,
    seo_status_label,
    serialize_blog,
    slugify,
    validate_blog_payload,
)
from cms.deps import get_db, require_role, require_role_read
from cms.security import iso_now, parse_iso

router = APIRouter(prefix='/admin/blogs', tags=['admin-blogs'])

Editor = Depends(require_role(config.ROLE_ADMIN, config.ROLE_EDITOR))
EditorRead = Depends(require_role_read(config.ROLE_ADMIN, config.ROLE_EDITOR))


def _client_ip(request: Request) -> str:
    from cms.request_utils import client_ip

    return client_ip(request)


async def _ensure_unique_slug(db, slug: str, exclude_id: Optional[str] = None) -> None:
    q: dict[str, Any] = {'slug': slug}
    if exclude_id:
        q['id'] = {'$ne': exclude_id}
    existing = await db.blogs.find_one(q, {'_id': 0, 'id': 1})
    if existing:
        raise HTTPException(status_code=409, detail=f'Slug already in use: {slug}')


async def _save_revision(db, blog: dict, user_id: str, reason: str) -> None:
    rev = {
        'id': str(uuid.uuid4()),
        'blogId': blog['id'],
        'editorUserId': user_id,
        'timestamp': iso_now(),
        'reason': reason,
        'snapshot': {k: v for k, v in blog.items() if k != '_id'},
    }
    await db.blog_revisions.insert_one(rev)
    # Cap revisions
    cursor = (
        db.blog_revisions.find({'blogId': blog['id']}, {'_id': 0, 'id': 1, 'timestamp': 1})
        .sort('timestamp', -1)
        .skip(config.BLOG_REVISION_CAP)
    )
    stale = [d['id'] async for d in cursor]
    if stale:
        await db.blog_revisions.delete_many({'id': {'$in': stale}})


class BulkBody(BaseModel):
    ids: list[str] = Field(default_factory=list, max_length=100)
    action: str
    category: Optional[str] = None
    tag: Optional[str] = None


class ImportBody(BaseModel):
    blogs: list[dict] = Field(default_factory=list)
    dryRun: bool = True
    confirm: bool = False


class ValidateBody(BaseModel):
    blog: dict
    forPublish: bool = False


@router.get('')
async def list_admin_blogs(
    request: Request,
    user: dict = EditorRead,
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(config.DEFAULT_PAGE_SIZE, ge=1, le=config.MAX_PAGE_SIZE),
    status: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    author: Optional[str] = None,
    search: Optional[str] = None,
    seoIssue: Optional[str] = None,
    needsRefresh: Optional[bool] = None,
    sort: str = '-updatedAt',
):
    q: dict[str, Any] = {}
    if status:
        q['status'] = status
    if category:
        q['category'] = category
    if tag:
        q['tags'] = tag
    if author:
        from cms.request_utils import escape_regex

        q['author.name'] = {'$regex': escape_regex(author, max_len=80), '$options': 'i'}
    if search:
        from cms.request_utils import escape_regex

        term = escape_regex(search, max_len=100)
        if term:
            q['$or'] = [
                {'title': {'$regex': term, '$options': 'i'}},
                {'slug': {'$regex': term, '$options': 'i'}},
                {'excerpt': {'$regex': term, '$options': 'i'}},
            ]
    sort_field = sort.lstrip('-')
    sort_dir = -1 if sort.startswith('-') else 1
    if sort_field not in ('updatedAt', 'publishedAt', 'scheduledAt', 'title', 'createdAt'):
        sort_field = 'updatedAt'
        sort_dir = -1

    # SEO / refresh filters require post-processing
    post_filter = bool(seoIssue) or needsRefresh is True
    if post_filter:
        cursor = db.blogs.find(q, {'_id': 0}).sort(sort_field, sort_dir)
        filtered = []
        async for d in cursor:
            if needsRefresh is True and not is_refresh_due(d):
                continue
            if seoIssue:
                codes = seo_issue_codes(d)
                issue_map = {
                    'missing-metadata': {'meta_description', 'meta_title', 'excerpt'},
                    'missing-alt': {'cover_alt', 'image_alt', 'article_image_alt'},
                    'no-internal-links': {'internal_links', 'pillar_link'},
                    'needs-refresh': {'refresh'},
                    'canonical-override': {'canonical'},
                }
                wanted = issue_map.get(seoIssue, {seoIssue})
                if not (wanted & set(codes)):
                    continue
            filtered.append(d)
        total = len(filtered)
        page_docs = filtered[(page - 1) * limit : page * limit]
        items = []
        for d in page_docs:
            item = serialize_blog(d)
            item['seoStatus'] = seo_status_label(d)
            item['seoIssueCodes'] = seo_issue_codes(d)
            item['refreshDue'] = is_refresh_due(d)
            # Strip heavy markdown from list
            item.pop('contentMarkdown', None)
            items.append(item)
        return {'items': items, 'page': page, 'limit': limit, 'total': total}

    total = await db.blogs.count_documents(q)
    cursor = (
        db.blogs.find(q, {'_id': 0, 'contentMarkdown': 0})
        .sort(sort_field, sort_dir)
        .skip((page - 1) * limit)
        .limit(limit)
    )
    items = []
    async for d in cursor:
        item = serialize_blog(d)
        item['seoStatus'] = seo_status_label(d)
        item['seoIssueCodes'] = seo_issue_codes(d)
        item['refreshDue'] = is_refresh_due(d)
        items.append(item)
    return {'items': items, 'page': page, 'limit': limit, 'total': total}


@router.post('')
async def create_blog(body: dict, request: Request, user: dict = Editor, db=Depends(get_db)):
    normalized, errors = validate_blog_payload(body)
    if has_blocking_errors(errors):
        raise HTTPException(status_code=400, detail={'message': 'Validation failed', 'errors': errors})
    await _ensure_unique_slug(db, normalized['slug'])
    now = iso_now()
    doc = {
        **normalized,
        'id': str(uuid.uuid4()),
        'status': normalized.get('status') if normalized.get('status') == 'draft' else 'draft',
        'createdAt': now,
        'updatedAt': now,
        'publishedAt': None,
        'createdBy': user['id'],
        'updatedBy': user['id'],
    }
    # Force draft on create unless explicitly scheduled/published via dedicated endpoints
    if doc['status'] not in ('draft', 'scheduled'):
        doc['status'] = 'draft'
    await db.blogs.insert_one(doc)
    await _save_revision(db, doc, user['id'], 'created')
    await write_audit(
        db,
        action='BLOG_CREATED',
        admin_user_id=user['id'],
        resource_type='blog',
        resource_id=doc['id'],
        result='ok',
        meta={'slug': doc['slug']},
        ip=_client_ip(request),
    )
    return serialize_blog(doc)


@router.post('/validate')
async def validate_blog(body: ValidateBody, user: dict = EditorRead, db=Depends(get_db)):
    normalized, errors = validate_blog_payload(body.blog, for_publish=body.forPublish)
    slug = (normalized or body.blog).get('slug')
    blog_id = body.blog.get('id')
    if slug:
        existing = await db.blogs.find_one({'slug': slug}, {'_id': 0, 'id': 1})
        if existing and existing.get('id') != blog_id:
            errors.append({'path': 'slug', 'message': 'Slug already in use', 'level': 'error'})
    # Cannibalization hints (advisory)
    existing_docs = [d async for d in db.blogs.find({}, {'_id': 0, 'id': 1, 'title': 1, 'slug': 1, 'status': 1}).limit(200)]
    overlaps = find_title_overlap(normalized or body.blog, existing_docs)
    return {
        'ok': not has_blocking_errors(errors),
        'normalized': normalized or None,
        'errors': errors,
        'overlaps': overlaps,
        'seoChecks': seo_health_checks(normalized or body.blog),
        'linkSuggestions': link_suggestions_for(normalized or body.blog),
    }


@router.post('/import')
async def import_blogs(body: ImportBody, request: Request, user: dict = Editor, db=Depends(get_db)):
    if len(body.blogs) > 50:
        raise HTTPException(status_code=400, detail='Maximum 50 blogs per import')
    results = []
    all_ok = True
    for i, raw in enumerate(body.blogs):
        normalized, errors = validate_blog_payload(raw)
        slug = (normalized or {}).get('slug') or raw.get('slug')
        if slug:
            exists = await db.blogs.find_one({'slug': slug}, {'_id': 0, 'id': 1})
            if exists:
                errors.append({'path': 'slug', 'message': 'Duplicate slug in database', 'level': 'error'})
        # Check duplicates within batch
        for j, other in enumerate(body.blogs):
            if j != i and (other.get('slug') or slugify(other.get('title', ''))) == slug:
                errors.append({'path': 'slug', 'message': 'Duplicate slug in import batch', 'level': 'error'})
        ok = not has_blocking_errors(errors)
        if not ok:
            all_ok = False
        results.append({'index': i, 'slug': slug, 'ok': ok, 'errors': errors, 'title': (normalized or raw).get('title')})

    summary = {
        'valid': sum(1 for r in results if r['ok']),
        'invalid': sum(1 for r in results if not r['ok']),
        'total': len(results),
    }

    if body.dryRun or not body.confirm:
        return {'dryRun': True, 'summary': summary, 'results': results}

    if not all_ok:
        raise HTTPException(status_code=400, detail={'message': 'Import blocked — fix validation errors', 'summary': summary, 'results': results})

    created = []
    now = iso_now()
    for raw in body.blogs:
        normalized, _ = validate_blog_payload(raw)
        doc = {
            **normalized,
            'id': str(uuid.uuid4()),
            'status': 'draft' if normalized.get('status') != 'draft' else 'draft',
            'createdAt': now,
            'updatedAt': now,
            'publishedAt': None,
            'createdBy': user['id'],
            'updatedBy': user['id'],
        }
        # Allow import of published only if payload says published AND passes publish checks
        if raw.get('status') == 'published':
            _, perr = validate_blog_payload(normalized, for_publish=True)
            if not has_blocking_errors(perr):
                doc['status'] = 'published'
                doc['publishedAt'] = raw.get('publishedAt') or now
        await db.blogs.insert_one(doc)
        await _save_revision(db, doc, user['id'], 'imported')
        created.append(serialize_blog(doc))

    await write_audit(
        db,
        action='JSON_IMPORT',
        admin_user_id=user['id'],
        resource_type='blog',
        result='ok',
        meta={'count': len(created)},
        ip=_client_ip(request),
    )
    return {'dryRun': False, 'summary': summary, 'created': created}


@router.get('/export')
async def export_blogs(
    user: dict = EditorRead,
    db=Depends(get_db),
    ids: Optional[str] = None,
    all: bool = False,
):
    q: dict[str, Any] = {}
    if ids:
        id_list = [x.strip() for x in ids.split(',') if x.strip()][:100]
        q['id'] = {'$in': id_list}
    elif not all:
        raise HTTPException(status_code=400, detail='Provide ids= or all=true')
    cursor = db.blogs.find(q, {'_id': 0})
    items = []
    export_keys = (
        'title', 'slug', 'subtitle', 'excerpt', 'contentMarkdown', 'category', 'tags',
        'author', 'cover', 'featuredImage', 'contentImages', 'status', 'featured',
        'publishedAt', 'scheduledAt', 'seo', 'internalLinks', 'relatedSlugs', 'sources',
        'editorial', 'brief', 'searchPerformance',
    )
    async for doc in cursor:
        items.append({k: doc.get(k) for k in export_keys})
    await write_audit(
        db,
        action='JSON_EXPORT',
        admin_user_id=user['id'],
        resource_type='blog',
        result='ok',
        meta={'count': len(items)},
    )
    return {'blogs': items}


@router.post('/bulk')
async def bulk_action(body: BulkBody, request: Request, user: dict = Editor, db=Depends(get_db)):
    if not body.ids:
        raise HTTPException(status_code=400, detail='No ids provided')
    now = iso_now()
    if body.action == 'archive':
        await db.blogs.update_many({'id': {'$in': body.ids}}, {'$set': {'status': 'archived', 'updatedAt': now}})
        action = 'BLOG_ARCHIVED'
    elif body.action == 'category' and body.category:
        await db.blogs.update_many({'id': {'$in': body.ids}}, {'$set': {'category': body.category, 'updatedAt': now}})
        action = 'BLOG_UPDATED'
    elif body.action == 'add_tag' and body.tag:
        await db.blogs.update_many({'id': {'$in': body.ids}}, {'$addToSet': {'tags': body.tag}, '$set': {'updatedAt': now}})
        action = 'BLOG_UPDATED'
    else:
        raise HTTPException(status_code=400, detail='Unsupported bulk action')
    await write_audit(
        db,
        action=action,
        admin_user_id=user['id'],
        resource_type='blog',
        result='ok',
        meta={'ids': body.ids, 'bulkAction': body.action},
        ip=_client_ip(request),
    )
    return {'ok': True, 'count': len(body.ids)}


@router.get('/{blog_id}')
async def get_blog(blog_id: str, user: dict = EditorRead, db=Depends(get_db)):
    doc = await db.blogs.find_one({'id': blog_id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    checks = seo_health_checks(doc)
    suggestions = link_suggestions_for(doc)
    overlaps = find_title_overlap(doc, [d async for d in db.blogs.find({}, {'_id': 0, 'id': 1, 'title': 1, 'slug': 1, 'status': 1}).limit(200)])
    return {
        'blog': serialize_blog(doc),
        'seoChecks': checks,
        'linkSuggestions': suggestions,
        'overlaps': overlaps,
        'refreshDue': is_refresh_due(doc),
    }


@router.patch('/{blog_id}')
async def update_blog(blog_id: str, body: dict, request: Request, user: dict = Editor, db=Depends(get_db)):
    existing = await db.blogs.find_one({'id': blog_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail='Not found')

    merged = {**existing, **body}
    # Strip system fields from client
    for k in ('id', 'createdAt', 'createdBy', '_id'):
        merged.pop(k, None)
    normalized, errors = validate_blog_payload(merged)
    if has_blocking_errors(errors):
        raise HTTPException(status_code=400, detail={'message': 'Validation failed', 'errors': errors})

    if normalized['slug'] != existing.get('slug'):
        await _ensure_unique_slug(db, normalized['slug'], exclude_id=blog_id)
        if existing.get('status') == 'published':
            await db.blog_redirects.update_one(
                {'fromSlug': existing['slug']},
                {'$set': {
                    'fromSlug': existing['slug'],
                    'toSlug': normalized['slug'],
                    'blogId': blog_id,
                    'createdAt': iso_now(),
                }},
                upsert=True,
            )
            await write_audit(
                db,
                action='BLOG_SLUG_CHANGED',
                admin_user_id=user['id'],
                resource_type='blog',
                resource_id=blog_id,
                result='ok',
                meta={'from': existing['slug'], 'to': normalized['slug']},
                ip=_client_ip(request),
            )

    now = iso_now()
    # Allow editorial status transitions via PATCH (not published — use publish endpoint)
    requested_status = body.get('status')
    if requested_status in ('draft', 'review', 'scheduled', 'archived'):
        new_status = requested_status
    else:
        new_status = existing.get('status')
    # Never silently publish via PATCH
    if new_status == 'published' and existing.get('status') != 'published':
        new_status = existing.get('status') or 'draft'

    update = {
        **normalized,
        'updatedAt': now,
        'updatedBy': user['id'],
        'status': new_status,
        'publishedAt': existing.get('publishedAt'),
        'id': blog_id,
        'createdAt': existing.get('createdAt'),
        'createdBy': existing.get('createdBy'),
    }
    if 'featured' in body:
        update['featured'] = bool(body['featured'])
    if 'scheduledAt' in body:
        update['scheduledAt'] = body.get('scheduledAt')
        if update.get('scheduledAt') and new_status in ('draft', 'review'):
            update['status'] = 'scheduled'

    await db.blogs.replace_one({'id': blog_id}, update)
    await _save_revision(db, update, user['id'], 'updated')
    await write_audit(
        db,
        action='BLOG_UPDATED',
        admin_user_id=user['id'],
        resource_type='blog',
        resource_id=blog_id,
        result='ok',
        meta={'slug': update['slug']},
        ip=_client_ip(request),
    )
    return {
        'blog': serialize_blog(update),
        'seoChecks': seo_health_checks(update),
        'errors': errors,
        'linkSuggestions': link_suggestions_for(update),
        'overlaps': find_title_overlap(
            update,
            [d async for d in db.blogs.find({}, {'_id': 0, 'id': 1, 'title': 1, 'slug': 1, 'status': 1}).limit(200)],
        ),
    }


@router.post('/{blog_id}/duplicate')
async def duplicate_blog(blog_id: str, request: Request, user: dict = Editor, db=Depends(get_db)):
    """Duplicate as draft with unique slug."""
    doc = await db.blogs.find_one({'id': blog_id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    base_slug = f"{doc.get('slug') or 'untitled'}-copy"
    slug = base_slug
    n = 2
    while await db.blogs.find_one({'slug': slug}, {'_id': 0, 'id': 1}):
        slug = f'{base_slug}-{n}'
        n += 1
        if n > 50:
            raise HTTPException(status_code=409, detail='Could not allocate unique slug')
    now = iso_now()
    new_doc = {
        **{k: v for k, v in doc.items() if k not in ('_id', 'id')},
        'id': str(uuid.uuid4()),
        'title': f"{doc.get('title') or 'Untitled'} (Copy)",
        'slug': slug,
        'status': 'draft',
        'publishedAt': None,
        'scheduledAt': None,
        'featured': False,
        'createdAt': now,
        'updatedAt': now,
        'createdBy': user['id'],
        'updatedBy': user['id'],
    }
    await db.blogs.insert_one(new_doc)
    await _save_revision(db, new_doc, user['id'], 'duplicated')
    await write_audit(
        db,
        action='BLOG_CREATED',
        admin_user_id=user['id'],
        resource_type='blog',
        resource_id=new_doc['id'],
        result='ok',
        meta={'slug': new_doc['slug'], 'duplicatedFrom': blog_id},
        ip=_client_ip(request),
    )
    return serialize_blog(new_doc)


@router.post('/{blog_id}/publish')
async def publish_blog(blog_id: str, request: Request, user: dict = Editor, db=Depends(get_db), body: dict = None):
    body = body or {}
    doc = await db.blogs.find_one({'id': blog_id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    _, errors = validate_blog_payload(doc, for_publish=True)
    override = bool(body.get('overrideWarnings'))
    if has_blocking_errors(errors):
        raise HTTPException(status_code=400, detail={'message': 'Publish blocked', 'errors': errors})
    warnings = [e for e in errors if e.get('level') == 'warning']
    if warnings and not override:
        return JSONResponse(
            status_code=409,
            content={'message': 'Publish has warnings — confirm to override', 'errors': errors, 'requiresOverride': True},
        )
    now = iso_now()
    scheduled_at = body.get('scheduledAt') or doc.get('scheduledAt')
    if scheduled_at and parse_iso(scheduled_at) and parse_iso(scheduled_at) > parse_iso(now):
        status = 'scheduled'
        published_at = None
    else:
        status = 'published'
        published_at = doc.get('publishedAt') or now
        scheduled_at = None

    await db.blogs.update_one(
        {'id': blog_id},
        {'$set': {
            'status': status,
            'publishedAt': published_at,
            'scheduledAt': scheduled_at,
            'updatedAt': now,
            'updatedBy': user['id'],
        }},
    )
    doc.update({'status': status, 'publishedAt': published_at, 'scheduledAt': scheduled_at, 'updatedAt': now})
    await _save_revision(db, doc, user['id'], 'published' if status == 'published' else 'scheduled')
    await write_audit(
        db,
        action='BLOG_PUBLISHED',
        admin_user_id=user['id'],
        resource_type='blog',
        resource_id=blog_id,
        result='ok',
        meta={'status': status},
        ip=_client_ip(request),
    )
    return {'blog': serialize_blog(doc), 'errors': errors}


@router.post('/{blog_id}/unpublish')
async def unpublish_blog(blog_id: str, request: Request, user: dict = Editor, db=Depends(get_db)):
    doc = await db.blogs.find_one({'id': blog_id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    now = iso_now()
    await db.blogs.update_one(
        {'id': blog_id},
        {'$set': {'status': 'draft', 'scheduledAt': None, 'updatedAt': now, 'updatedBy': user['id']}},
    )
    doc['status'] = 'draft'
    await write_audit(
        db,
        action='BLOG_UNPUBLISHED',
        admin_user_id=user['id'],
        resource_type='blog',
        resource_id=blog_id,
        result='ok',
        ip=_client_ip(request),
    )
    return {'blog': serialize_blog(doc)}


@router.post('/{blog_id}/archive')
async def archive_blog(blog_id: str, request: Request, user: dict = Editor, db=Depends(get_db)):
    doc = await db.blogs.find_one({'id': blog_id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    now = iso_now()
    await db.blogs.update_one(
        {'id': blog_id},
        {'$set': {'status': 'archived', 'updatedAt': now, 'updatedBy': user['id']}},
    )
    doc['status'] = 'archived'
    await write_audit(
        db,
        action='BLOG_ARCHIVED',
        admin_user_id=user['id'],
        resource_type='blog',
        resource_id=blog_id,
        result='ok',
        ip=_client_ip(request),
    )
    return {'blog': serialize_blog(doc)}


@router.get('/{blog_id}/revisions')
async def list_revisions(blog_id: str, user: dict = EditorRead, db=Depends(get_db)):
    cursor = (
        db.blog_revisions.find({'blogId': blog_id}, {'_id': 0, 'snapshot.contentMarkdown': 0})
        .sort('timestamp', -1)
        .limit(config.BLOG_REVISION_CAP)
    )
    items = []
    async for d in cursor:
        snap = d.get('snapshot') or {}
        items.append({
            'id': d['id'],
            'timestamp': d.get('timestamp'),
            'reason': d.get('reason'),
            'editorUserId': d.get('editorUserId'),
            'title': snap.get('title'),
            'status': snap.get('status'),
        })
    return {'items': items}


@router.get('/{blog_id}/revisions/{revision_id}')
async def get_revision(blog_id: str, revision_id: str, user: dict = EditorRead, db=Depends(get_db)):
    rev = await db.blog_revisions.find_one({'id': revision_id, 'blogId': blog_id}, {'_id': 0})
    if not rev:
        raise HTTPException(status_code=404, detail='Not found')
    return rev


@router.post('/{blog_id}/restore/{revision_id}')
async def restore_revision(blog_id: str, revision_id: str, request: Request, user: dict = Editor, db=Depends(get_db)):
    rev = await db.blog_revisions.find_one({'id': revision_id, 'blogId': blog_id}, {'_id': 0})
    if not rev:
        raise HTTPException(status_code=404, detail='Not found')
    snap = rev.get('snapshot') or {}
    existing = await db.blogs.find_one({'id': blog_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail='Blog not found')
    restored = {
        **snap,
        'id': blog_id,
        'createdAt': existing.get('createdAt'),
        'createdBy': existing.get('createdBy'),
        'updatedAt': iso_now(),
        'updatedBy': user['id'],
        # Restore content but keep current status unless snapshot was draft
        'status': existing.get('status'),
        'publishedAt': existing.get('publishedAt'),
    }
    await db.blogs.replace_one({'id': blog_id}, restored)
    await _save_revision(db, restored, user['id'], f'restored:{revision_id}')
    await write_audit(
        db,
        action='BLOG_RESTORED',
        admin_user_id=user['id'],
        resource_type='blog',
        resource_id=blog_id,
        result='ok',
        meta={'revisionId': revision_id},
        ip=_client_ip(request),
    )
    return {'blog': serialize_blog(restored)}


@router.get('/{blog_id}/preview')
async def preview_blog(blog_id: str, user: dict = EditorRead, db=Depends(get_db)):
    """Authenticated preview of any status — never public."""
    doc = await db.blogs.find_one({'id': blog_id}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    return {'blog': serialize_blog(doc), 'preview': True}
