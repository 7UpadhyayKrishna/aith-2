"""Public blog API + dynamic sitemap / RSS."""
from __future__ import annotations

from typing import Optional
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse, Response

from cms import config
from cms.blog_models import is_effectively_published, serialize_blog
from cms.deps import get_db
from cms.security import parse_iso, utcnow

router = APIRouter(tags=['blogs-public'])


def _published_filter():
    """Published or due-scheduled posts that are allowed to be indexed publicly."""
    now = utcnow().isoformat()
    return {
        '$and': [
            {
                '$or': [
                    {'status': 'published'},
                    {'status': 'scheduled', 'scheduledAt': {'$lte': now}},
                ]
            },
            # Exclude explicit noindex from sitemap / public listing filters used by sitemap
            {'seo.index': {'$ne': False}},
        ]
    }


def _published_list_filter():
    """Public archive includes published/due-scheduled regardless of noindex (page itself may noindex)."""
    now = utcnow().isoformat()
    return {
        '$or': [
            {'status': 'published'},
            {'status': 'scheduled', 'scheduledAt': {'$lte': now}},
        ]
    }


@router.get('/blogs')
async def list_blogs(
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=config.MAX_PAGE_SIZE),
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
):
    q = _published_list_filter()
    and_parts = [q]
    if category:
        and_parts.append({'category': category})
    if tag:
        and_parts.append({'tags': tag})
    if featured is True:
        and_parts.append({'featured': True})
    if search:
        from cms.request_utils import escape_regex

        term = escape_regex(search, max_len=100)
        if term:
            and_parts.append({
                '$or': [
                    {'title': {'$regex': term, '$options': 'i'}},
                    {'excerpt': {'$regex': term, '$options': 'i'}},
                    {'tags': {'$regex': term, '$options': 'i'}},
                ]
            })
    query = {'$and': and_parts} if len(and_parts) > 1 else and_parts[0]

    total = await db.blogs.count_documents(query)
    skip = (page - 1) * limit
    cursor = (
        db.blogs.find(query, {'_id': 0, 'contentMarkdown': 0})
        .sort([('publishedAt', -1), ('scheduledAt', -1), ('updatedAt', -1)])
        .skip(skip)
        .limit(limit)
    )
    items = [serialize_blog(doc, public=True) async for doc in cursor]
    return {
        'items': items,
        'page': page,
        'limit': limit,
        'total': total,
        'pages': max(1, (total + limit - 1) // limit),
    }


@router.get('/blog-sitemap.xml')
async def blog_sitemap(db=Depends(get_db)):
    query = _published_filter()
    cursor = db.blogs.find(query, {'_id': 0, 'slug': 1, 'updatedAt': 1, 'publishedAt': 1})
    urls = []
    async for doc in cursor:
        loc = f"{config.SITE_ORIGIN}/blogs/{doc['slug']}"
        lastmod = doc.get('updatedAt') or doc.get('publishedAt') or ''
        if lastmod and parse_iso(lastmod):
            urls.append(f'  <url>\n    <loc>{escape(loc)}</loc>\n    <lastmod>{escape(lastmod[:10])}</lastmod>\n  </url>')
        else:
            urls.append(f'  <url>\n    <loc>{escape(loc)}</loc>\n  </url>')
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + '\n'.join(urls)
        + '\n</urlset>\n'
    )
    return Response(content=body, media_type='application/xml')


@router.get('/blogs/rss.xml')
async def blog_rss(db=Depends(get_db)):
    query = _published_list_filter()
    cursor = (
        db.blogs.find(query, {'_id': 0})
        .sort([('publishedAt', -1)])
        .limit(30)
    )
    items = []
    async for doc in cursor:
        link = f"{config.SITE_ORIGIN}/blogs/{doc['slug']}"
        title = escape(doc.get('title') or '')
        desc = escape(doc.get('excerpt') or '')
        pub = doc.get('publishedAt') or doc.get('updatedAt') or ''
        items.append(
            f'<item><title>{title}</title><link>{escape(link)}</link>'
            f'<guid>{escape(link)}</guid><description>{desc}</description>'
            f'<pubDate>{escape(pub)}</pubDate></item>'
        )
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0"><channel>'
        f'<title>AITH Trade Journal</title>'
        f'<link>{escape(config.SITE_ORIGIN)}/blogs</link>'
        f'<description>Sourcing, procurement, documentation and trade operations.</description>'
        + ''.join(items)
        + '</channel></rss>'
    )
    return Response(content=body, media_type='application/rss+xml')


@router.get('/blogs/{slug}')
async def get_blog(slug: str, db=Depends(get_db)):
    doc = await db.blogs.find_one({'slug': slug}, {'_id': 0})
    if not doc or not is_effectively_published(doc):
        red = await db.blog_redirects.find_one({'fromSlug': slug}, {'_id': 0})
        if red and red.get('toSlug'):
            # CSR cannot issue true HTTP 301 HTML redirects; clients follow toSlug.
            return {
                'redirect': True,
                'fromSlug': slug,
                'toSlug': red['toSlug'],
                'path': f"/blogs/{red['toSlug']}",
            }
        raise HTTPException(status_code=404, detail='Not found')
    if doc.get('status') == 'scheduled':
        from cms.security import iso_now

        await db.blogs.update_one(
            {'id': doc['id']},
            {'$set': {'status': 'published', 'publishedAt': doc.get('publishedAt') or iso_now()}},
        )
        doc['status'] = 'published'
        doc['publishedAt'] = doc.get('publishedAt') or iso_now()
    return serialize_blog(doc, public=True)


@router.get('/blog-redirects/{slug}')
async def resolve_redirect(slug: str, db=Depends(get_db)):
    """HTTP 301 to the canonical public blog URL when an old slug was remapped."""
    red = await db.blog_redirects.find_one({'fromSlug': slug}, {'_id': 0})
    if not red or not red.get('toSlug'):
        raise HTTPException(status_code=404, detail='Not found')
    target = f"{config.SITE_ORIGIN}/blogs/{red['toSlug']}"
    return RedirectResponse(url=target, status_code=301)


def _serialize_public_job(d: dict) -> dict:
    from cms.ops_workflow import serialize_job

    out = serialize_job(d, include_private=False)
    # Public payload only
    return {
        'id': out['id'],
        'slug': out['slug'],
        'title': out['title'],
        'team': out['team'],
        'location': out['location'],
        'type': out['type'],
        'experienceLevel': out.get('experienceLevel') or '',
        'blurb': out['blurb'],
        'descriptionMarkdown': out.get('descriptionMarkdown') or '',
        'responsibilities': out['responsibilities'],
        'requirements': out['requirements'],
        'salaryMin': out.get('salaryMin'),
        'salaryMax': out.get('salaryMax'),
        'salaryCurrency': out.get('salaryCurrency') or '',
        'salaryPeriod': out.get('salaryPeriod') or '',
        'applicationDeadline': out.get('applicationDeadline'),
        'coverImage': out.get('coverImage') or {'url': '', 'alt': ''},
        'postedAt': out.get('postedAt'),
        'status': out.get('status'),
        'acceptingApplications': out.get('acceptingApplications', False),
    }


@router.get('/careers/jobs')
async def list_public_jobs(db=Depends(get_db)):
    """
    Open roles for /careers.
    Only published roles still accepting applications.
    Empty list when none — do not fall back to static careers.js.
    """
    from cms.ops_workflow import job_accepting_applications

    items = []
    async for d in db.job_postings.find({'status': 'published'}, {'_id': 0}).sort('postedAt', -1).limit(100):
        if job_accepting_applications(d):
            items.append(_serialize_public_job(d))
    return {'items': items, 'total': len(items)}


@router.get('/careers/jobs/{slug}')
async def get_public_job(slug: str, db=Depends(get_db)):
    """
    Public job detail.

    Behavior for closed/expired roles: return an archived-style page (HTTP 200)
    with acceptingApplications=false rather than 404, so SEO/history can remain.
    Draft jobs are 404.
    """
    d = await db.job_postings.find_one({'slug': slug.strip().lower()}, {'_id': 0})
    if not d or (d.get('status') or 'draft') == 'draft':
        raise HTTPException(status_code=404, detail='Not found')
    return _serialize_public_job(d)