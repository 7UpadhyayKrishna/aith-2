"""Blog document validation and helpers."""
from __future__ import annotations

import re
from datetime import timedelta
from typing import Any, Optional, Union
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator

from cms import config

SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
H1_RE = re.compile(r'(?m)^#\s+')
INTERNAL_MD_LINK_RE = re.compile(r'\]\(/[a-z0-9\-/]+\)', re.I)


def slugify(title: str) -> str:
    s = title.lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s_]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-')
    return s[:120] or 'untitled'


def is_valid_url(value: Optional[str], *, allow_relative: bool = True) -> bool:
    if value is None or value == '':
        return True
    if allow_relative and value.startswith('/'):
        return True
    try:
        p = urlparse(value)
        return p.scheme in ('http', 'https') and bool(p.netloc)
    except Exception:
        return False


class AuthorIn(BaseModel):
    model_config = ConfigDict(extra='ignore')

    type: str = 'Organization'
    name: str = 'AITH Editorial Team'
    url: Optional[str] = None

    @field_validator('type')
    @classmethod
    def check_type(cls, v: str) -> str:
        if v not in ('Organization', 'Person'):
            raise ValueError('author.type must be Organization or Person')
        return v


class ImageAssetIn(BaseModel):
    model_config = ConfigDict(extra='ignore')

    url: Optional[str] = None
    alt: Optional[str] = None
    caption: Optional[str] = None
    credit: Optional[str] = None


class FeaturedImageIn(BaseModel):
    """Legacy cover image mirror - prefer cover.image."""

    model_config = ConfigDict(extra='ignore')

    url: Optional[str] = None
    alt: Optional[str] = None
    caption: Optional[str] = None


class CoverIn(BaseModel):
    """Editorial cover / hero block (not a recruitment cover letter)."""

    model_config = ConfigDict(extra='ignore')

    eyebrow: Optional[str] = 'TRADE JOURNAL'
    headline: Optional[str] = None
    deck: Optional[str] = None
    image: ImageAssetIn = Field(default_factory=ImageAssetIn)


class ContentImageIn(BaseModel):
    model_config = ConfigDict(extra='ignore')

    id: str = 'image-1'
    url: Optional[str] = None
    alt: Optional[str] = None
    caption: Optional[str] = None
    credit: Optional[str] = None
    placement: Optional[str] = None
    decorative: bool = False


class OgImageIn(BaseModel):
    model_config = ConfigDict(extra='ignore')

    url: Optional[str] = None
    alt: Optional[str] = None


class SeoIn(BaseModel):
    model_config = ConfigDict(extra='ignore')

    primaryIntent: Optional[str] = None
    primaryKeyword: Optional[str] = None
    supportingKeywords: list[str] = Field(default_factory=list, max_length=20)
    metaTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    canonicalUrl: Optional[str] = None
    index: bool = True
    follow: bool = True
    ogTitle: Optional[str] = None
    ogDescription: Optional[str] = None
    # Accept string (legacy) or object
    ogImage: Optional[Union[str, OgImageIn, dict]] = None


class InternalLinkIn(BaseModel):
    model_config = ConfigDict(extra='ignore')

    anchor: str = ''
    url: str = ''
    reason: str = ''


class SourceIn(BaseModel):
    model_config = ConfigDict(extra='ignore')

    label: str = ''
    url: str = ''


class EditorialIn(BaseModel):
    """Internal editorial metadata - never public."""

    model_config = ConfigDict(extra='ignore')

    contentType: str = 'evergreen'
    searchIntent: str = 'informational'
    audience: Optional[str] = None
    readerQuestion: Optional[str] = None
    recommendedServiceLink: Optional[str] = None
    recommendedIndustryLink: Optional[str] = None
    competitorNotes: Optional[str] = None
    authorNotes: Optional[str] = None
    lastReviewedAt: Optional[str] = None
    nextReviewAt: Optional[str] = None
    needsRefresh: bool = False


class BriefIn(BaseModel):
    """Content brief - internal planning only."""

    model_config = ConfigDict(extra='ignore')

    primarySearchIntent: Optional[str] = None
    primaryKeyword: Optional[str] = None
    supportingTopics: list[str] = Field(default_factory=list, max_length=20)
    audience: Optional[str] = None
    readerQuestion: Optional[str] = None
    recommendedServiceLink: Optional[str] = None
    recommendedIndustryLink: Optional[str] = None
    competitorNotes: Optional[str] = None
    authorNotes: Optional[str] = None


class SearchPerformanceIn(BaseModel):
    """Manual Search Console opportunity notes - no API integration required."""

    model_config = ConfigDict(extra='ignore')

    targetQueries: list[str] = Field(default_factory=list, max_length=40)
    opportunityNotes: Optional[str] = None
    lastReviewedAt: Optional[str] = None


class BlogWritable(BaseModel):
    """Client-writable blog fields (no system ownership)."""

    model_config = ConfigDict(extra='ignore')

    title: str = Field(default='', max_length=200)
    slug: Optional[str] = Field(default=None, max_length=160)
    subtitle: Optional[str] = Field(default='', max_length=400)
    excerpt: str = Field(default='', max_length=600)
    contentMarkdown: str = Field(default='', max_length=config.MAX_MARKDOWN_CHARS)
    category: str = Field(default='Global Sourcing', max_length=80)
    tags: list[str] = Field(default_factory=list, max_length=20)
    author: AuthorIn = Field(default_factory=AuthorIn)
    cover: CoverIn = Field(default_factory=CoverIn)
    featuredImage: FeaturedImageIn = Field(default_factory=FeaturedImageIn)
    contentImages: list[ContentImageIn] = Field(default_factory=list, max_length=30)
    status: str = 'draft'
    featured: bool = False
    publishedAt: Optional[str] = None
    scheduledAt: Optional[str] = None
    seo: SeoIn = Field(default_factory=SeoIn)
    internalLinks: list[InternalLinkIn] = Field(default_factory=list, max_length=30)
    relatedSlugs: list[str] = Field(default_factory=list, max_length=20)
    sources: list[SourceIn] = Field(default_factory=list, max_length=30)
    editorial: EditorialIn = Field(default_factory=EditorialIn)
    brief: BriefIn = Field(default_factory=BriefIn)
    searchPerformance: SearchPerformanceIn = Field(default_factory=SearchPerformanceIn)

    @field_validator('status')
    @classmethod
    def check_status(cls, v: str) -> str:
        if v not in config.BLOG_STATUSES:
            raise ValueError(f'status must be one of {config.BLOG_STATUSES}')
        return v

    @field_validator('tags')
    @classmethod
    def check_tags(cls, v: list[str]) -> list[str]:
        cleaned = []
        for t in v[:20]:
            s = str(t).strip()[:60]
            if s:
                cleaned.append(s)
        return cleaned


def _normalize_og_image(seo: dict) -> dict:
    og = seo.get('ogImage')
    if og is None or og == '':
        seo['ogImage'] = {'url': None, 'alt': None}
    elif isinstance(og, str):
        seo['ogImage'] = {'url': og, 'alt': None}
    elif isinstance(og, dict):
        seo['ogImage'] = {
            'url': og.get('url'),
            'alt': og.get('alt'),
        }
    return seo


def _sync_cover_featured(out: dict) -> dict:
    """cover.image is source of truth; featuredImage stays mirrored for legacy clients."""
    cover = out.get('cover') or {}
    image = cover.get('image') or {}
    fi = out.get('featuredImage') or {}

    # Backfill cover from legacy featuredImage
    if not (image.get('url') or '').strip() and (fi.get('url') or '').strip():
        image = {
            'url': fi.get('url'),
            'alt': fi.get('alt'),
            'caption': fi.get('caption'),
            'credit': image.get('credit'),
        }
        cover['image'] = image
        if not cover.get('headline'):
            cover['headline'] = out.get('title') or ''
        if not cover.get('deck'):
            cover['deck'] = out.get('subtitle') or out.get('excerpt') or ''
        out['cover'] = cover

    out['featuredImage'] = {
        'url': image.get('url') or fi.get('url'),
        'alt': image.get('alt') or fi.get('alt'),
        'caption': image.get('caption') or fi.get('caption'),
    }
    return out


def validate_blog_payload(data: dict[str, Any], *, for_publish: bool = False) -> tuple[dict, list[dict]]:
    """
    Validate and normalize a blog dict.
    Returns (normalized_dict, errors[{path, message, level}]).
    """
    errors: list[dict] = []

    # Allow empty title only when not publishing (new template)
    payload = dict(data or {})
    if not (payload.get('title') or '').strip() and not for_publish:
        payload['title'] = payload.get('title') or 'Untitled draft'

    try:
        model = BlogWritable.model_validate(payload)
    except Exception as exc:
        from pydantic import ValidationError

        if isinstance(exc, ValidationError):
            for e in exc.errors():
                path = '.'.join(str(x) for x in e.get('loc', []))
                errors.append({'path': path or 'root', 'message': e.get('msg', 'invalid'), 'level': 'error'})
            return {}, errors
        errors.append({'path': 'root', 'message': str(exc), 'level': 'error'})
        return {}, errors

    out = model.model_dump()
    out = _sync_cover_featured(out)
    out['seo'] = _normalize_og_image(out.get('seo') or {})

    slug_source = out.get('slug') or out.get('title') or 'untitled'
    slug = slugify(slug_source) if not (out.get('slug') or '').strip() else (out.get('slug') or '').strip().lower()
    if not SLUG_RE.match(slug):
        errors.append({'path': 'slug', 'message': 'Slug must be lowercase hyphen-separated alphanumeric', 'level': 'error'})
    if slug in config.RESERVED_BLOG_SLUGS:
        errors.append({'path': 'slug', 'message': 'Slug is reserved (conflicts with Insights or system routes)', 'level': 'error'})
    out['slug'] = slug

    if out.get('category') and out['category'] not in config.BLOG_CATEGORIES:
        errors.append({
            'path': 'category',
            'message': f"Unknown category; use one of: {', '.join(config.BLOG_CATEGORIES)}",
            'level': 'warning',
        })

    cover_img = (out.get('cover') or {}).get('image') or {}
    if cover_img.get('url') and not is_valid_url(cover_img['url']):
        errors.append({'path': 'cover.image.url', 'message': 'Invalid image URL', 'level': 'error'})
    if cover_img.get('url') and not (cover_img.get('alt') or '').strip():
        errors.append({
            'path': 'cover.image.alt',
            'message': 'Required when cover.image.url exists',
            'level': 'error' if for_publish else 'warning',
        })

    fi = out.get('featuredImage') or {}
    if fi.get('url') and not is_valid_url(fi['url']):
        errors.append({'path': 'featuredImage.url', 'message': 'Invalid image URL', 'level': 'error'})

    for i, img in enumerate(out.get('contentImages') or []):
        if img.get('url') and not is_valid_url(img['url']):
            errors.append({'path': f'contentImages[{i}].url', 'message': 'Invalid URL', 'level': 'error'})
        if img.get('url') and not img.get('decorative') and not (img.get('alt') or '').strip():
            errors.append({
                'path': f'contentImages[{i}].alt',
                'message': 'Alt text required unless marked decorative',
                'level': 'warning',
            })

    seo = out.get('seo') or {}
    if seo.get('canonicalUrl') and not is_valid_url(seo['canonicalUrl']):
        errors.append({'path': 'seo.canonicalUrl', 'message': 'Invalid URL', 'level': 'error'})
    og = seo.get('ogImage') or {}
    og_url = og.get('url') if isinstance(og, dict) else og
    if og_url and not is_valid_url(og_url if isinstance(og_url, str) else None):
        errors.append({'path': 'seo.ogImage.url', 'message': 'Invalid URL', 'level': 'error'})

    author = out.get('author') or {}
    if not (author.get('name') or '').strip():
        errors.append({'path': 'author.name', 'message': 'Author name required', 'level': 'error'})
    if author.get('url') and not is_valid_url(author['url']):
        errors.append({'path': 'author.url', 'message': 'Invalid author URL', 'level': 'error'})

    for i, link in enumerate(out.get('internalLinks') or []):
        if link.get('url') and not is_valid_url(link['url']):
            errors.append({'path': f'internalLinks[{i}].url', 'message': 'Invalid URL', 'level': 'error'})
        anchor = (link.get('anchor') or '').strip().lower()
        if anchor in ('click here', 'learn more', 'read more', 'here'):
            errors.append({
                'path': f'internalLinks[{i}].anchor',
                'message': 'Prefer descriptive anchor text over generic phrases',
                'level': 'warning',
            })

    for i, src in enumerate(out.get('sources') or []):
        if src.get('url') and not is_valid_url(src['url'], allow_relative=False):
            errors.append({'path': f'sources[{i}].url', 'message': 'Invalid source URL', 'level': 'error'})

    md = out.get('contentMarkdown') or ''
    if H1_RE.search(md):
        errors.append({
            'path': 'contentMarkdown',
            'message': 'Article body contains an H1 (# ); page template already supplies H1 - prefer H2 (##)',
            'level': 'warning',
        })

    # Quality advisories (never sole publish blockers)
    word_count = len(re.findall(r'\b\w+\b', md))
    if word_count and word_count < 250:
        errors.append({
            'path': 'contentMarkdown',
            'message': 'Article is very short - consider adding practical depth',
            'level': 'warning',
        })
    if re.search(r'(?i)(##\s+.+\n(?:.*\n){0,3})\1', md):
        errors.append({
            'path': 'contentMarkdown',
            'message': 'Possible duplicated heading/paragraph blocks detected',
            'level': 'warning',
        })
    if not re.search(r'(?i)(next step|conclusion|practical|takeaway|summary)', md) and word_count > 400:
        errors.append({
            'path': 'contentMarkdown',
            'message': 'No clear conclusion / practical next-step section detected',
            'level': 'warning',
        })

    if for_publish:
        if not (out.get('title') or '').strip() or out.get('title') == 'Untitled draft':
            errors.append({'path': 'title', 'message': 'Title required to publish', 'level': 'error'})
        if not (out.get('excerpt') or out.get('subtitle') or '').strip():
            errors.append({'path': 'excerpt', 'message': 'Excerpt (or subtitle) required to publish', 'level': 'error'})
        if not md.strip():
            errors.append({'path': 'contentMarkdown', 'message': 'Content required to publish', 'level': 'error'})
        if not (seo.get('metaTitle') or out.get('title') or '').strip():
            errors.append({'path': 'seo.metaTitle', 'message': 'Meta title required to publish', 'level': 'error'})
        if not (seo.get('metaDescription') or out.get('excerpt') or '').strip():
            errors.append({'path': 'seo.metaDescription', 'message': 'Meta description required to publish', 'level': 'error'})
        if cover_img.get('url') and not (cover_img.get('alt') or '').strip():
            # already added as error above when for_publish
            pass

    # Soft length guidance (never hard-block solely on length folklore)
    mt = seo.get('metaTitle') or ''
    if mt and len(mt) > 70:
        errors.append({'path': 'seo.metaTitle', 'message': 'Meta title may be truncated in some SERP previews', 'level': 'warning'})
    md_desc = seo.get('metaDescription') or ''
    if md_desc and len(md_desc) > 160:
        errors.append({'path': 'seo.metaDescription', 'message': 'Meta description may be truncated in some SERP previews', 'level': 'warning'})

    return out, errors


def has_blocking_errors(errors: list[dict]) -> bool:
    return any(e.get('level') == 'error' for e in errors)


PUBLIC_BLOG_FIELDS = {
    'id', 'title', 'slug', 'subtitle', 'excerpt', 'contentMarkdown', 'category', 'tags',
    'author', 'cover', 'featuredImage', 'contentImages', 'status', 'featured',
    'publishedAt', 'scheduledAt', 'createdAt', 'updatedAt', 'seo', 'relatedSlugs',
    'sources', 'internalLinks',
}

# Strip internal-only seo planning fields from public seo object
PUBLIC_SEO_FIELDS = {
    'metaTitle', 'metaDescription', 'canonicalUrl', 'index', 'follow',
    'ogTitle', 'ogDescription', 'ogImage',
}


def serialize_blog(doc: dict, *, public: bool = False) -> dict:
    """Strip Mongo _id and optionally internal fields."""
    out = {k: v for k, v in doc.items() if k != '_id'}
    if 'id' not in out and doc.get('_id'):
        out['id'] = str(doc['_id'])
    out = _sync_cover_featured(out)
    if public:
        out = {k: v for k, v in out.items() if k in PUBLIC_BLOG_FIELDS}
        seo = out.get('seo') or {}
        public_seo = {k: seo.get(k) for k in PUBLIC_SEO_FIELDS if k in seo or k in ('index', 'follow')}
        # Ensure index/follow defaults
        if 'index' not in public_seo:
            public_seo['index'] = seo.get('index', True)
        if 'follow' not in public_seo:
            public_seo['follow'] = seo.get('follow', True)
        # Normalize ogImage to URL string for Seo component compatibility when needed
        og = public_seo.get('ogImage')
        if isinstance(og, dict):
            public_seo['ogImage'] = og.get('url') or None
        out['seo'] = public_seo
        # Drop empty internalLinks entries
        links = [l for l in (out.get('internalLinks') or []) if (l.get('url') or '').strip()]
        out['internalLinks'] = links
    return out


def is_effectively_published(doc: dict, now_iso: Optional[str] = None) -> bool:
    """Published, or scheduled with scheduledAt <= now."""
    from cms.security import parse_iso, utcnow

    status = doc.get('status')
    if status == 'published':
        return True
    if status == 'scheduled':
        sched = parse_iso(doc.get('scheduledAt'))
        if sched and sched <= utcnow():
            return True
    return False


def is_refresh_due(doc: dict, *, days: int = 180) -> bool:
    from cms.security import parse_iso, utcnow

    editorial = doc.get('editorial') or {}
    if editorial.get('needsRefresh'):
        return True
    next_review = parse_iso(editorial.get('nextReviewAt'))
    if next_review and next_review <= utcnow():
        return True
    last = parse_iso(editorial.get('lastReviewedAt')) or parse_iso(doc.get('updatedAt')) or parse_iso(doc.get('publishedAt'))
    if doc.get('status') == 'published' and last:
        return last <= utcnow() - timedelta(days=days)
    if doc.get('status') == 'published' and not editorial.get('lastReviewedAt'):
        # Never reviewed after publish - due if older than threshold via publishedAt
        pub = parse_iso(doc.get('publishedAt'))
        if pub and pub <= utcnow() - timedelta(days=days):
            return True
    return False


INTERNAL_LINK_SUGGESTIONS = {
    'Global Sourcing': ['/global-sourcing-services', '/supplier-sourcing', '/request-quote'],
    'Supplier Sourcing': ['/supplier-sourcing', '/quality-compliance', '/request-quote'],
    'Import & Export': ['/import-export-services', '/trade-documentation'],
    'Procurement': ['/international-procurement', '/request-quote'],
    'Trade Documentation': ['/trade-documentation', '/import-export-services'],
    'Logistics': ['/freight-coordination'],
    'Quality & Compliance': ['/quality-compliance', '/supplier-sourcing'],
    'Industry Guides': ['/industries', '/products'],
}

INTENT_LINK_SUGGESTIONS = {
    'supplier verification': ['/supplier-sourcing', '/quality-compliance', '/request-quote'],
    'documentation': ['/trade-documentation', '/import-export-services'],
    'incoterms': ['/trade-documentation', '/import-export-services'],
    'freight': ['/freight-coordination', '/import-export-services'],
    'procurement': ['/international-procurement', '/request-quote'],
    'sourcing': ['/global-sourcing-services', '/supplier-sourcing', '/request-quote'],
    'quality': ['/quality-compliance', '/supplier-sourcing'],
}


def link_suggestions_for(doc: dict) -> list[str]:
    found: list[str] = []
    seen = set()

    def add(urls):
        for u in urls:
            if u not in seen:
                seen.add(u)
                found.append(u)

    add(INTERNAL_LINK_SUGGESTIONS.get(doc.get('category') or '', []))
    intent = (
        ((doc.get('seo') or {}).get('primaryIntent') or '')
        + ' '
        + ((doc.get('brief') or {}).get('primarySearchIntent') or '')
    ).lower()
    for key, urls in INTENT_LINK_SUGGESTIONS.items():
        if key in intent:
            add(urls)
    return found


def seo_health_checks(doc: dict) -> list[dict]:
    """PASS / WARNING / ERROR checks - no fake numerical score."""
    checks = []
    seo = doc.get('seo') or {}
    cover = doc.get('cover') or {}
    cover_img = cover.get('image') or {}
    fi = doc.get('featuredImage') or {}
    md = doc.get('contentMarkdown') or ''
    editorial = doc.get('editorial') or {}
    brief = doc.get('brief') or {}

    def add(code, level, message):
        checks.append({'code': code, 'level': level, 'message': message})

    # CONTENT
    if not (doc.get('title') or '').strip() or doc.get('title') == 'Untitled draft':
        add('title', 'ERROR', 'Missing title')
    else:
        add('title', 'PASS', 'Title present')

    word_count = len(re.findall(r'\b\w+\b', md))
    if word_count >= 400:
        add('body_depth', 'PASS', 'Article has meaningful body depth')
    elif word_count >= 150:
        add('body_depth', 'WARNING', 'Body is relatively short')
    else:
        add('body_depth', 'WARNING', 'Article body needs more depth')

    if H1_RE.search(md):
        add('body_h1', 'WARNING', 'Body contains an additional H1')
    else:
        add('body_h1', 'PASS', 'Single page H1 comes from template')

    # SEARCH
    intent = (seo.get('primaryIntent') or brief.get('primarySearchIntent') or '').strip()
    if intent:
        add('primary_intent', 'PASS', 'Primary intent specified')
    else:
        add('primary_intent', 'WARNING', 'Primary search intent not specified')

    if (seo.get('metaTitle') or doc.get('title') or '').strip():
        add('meta_title', 'PASS', 'Meta title present')
    else:
        add('meta_title', 'WARNING', 'Missing meta title')

    if not (seo.get('metaDescription') or doc.get('excerpt') or '').strip():
        add('meta_description', 'WARNING', 'Missing meta description')
    else:
        add('meta_description', 'PASS', 'Meta description present')

    slug = doc.get('slug') or ''
    if slug and SLUG_RE.match(slug):
        add('slug', 'PASS', 'URL slug valid')
    else:
        add('slug', 'ERROR', 'URL slug invalid')

    # IMAGES
    img_url = cover_img.get('url') or fi.get('url')
    img_alt = cover_img.get('alt') or fi.get('alt')
    if img_url:
        add('cover_image', 'PASS', 'Cover image set')
        if (img_alt or '').strip():
            add('cover_alt', 'PASS', 'Cover alt present')
        else:
            add('cover_alt', 'WARNING', 'Cover image missing alt text')
    else:
        add('cover_image', 'WARNING', 'No cover image')

    missing_alt = [
        img for img in (doc.get('contentImages') or [])
        if img.get('url') and not img.get('decorative') and not (img.get('alt') or '').strip()
    ]
    if missing_alt:
        add('article_image_alt', 'WARNING', f'{len(missing_alt)} article image(s) missing alt')
    elif any(img.get('url') for img in (doc.get('contentImages') or [])):
        add('article_image_alt', 'PASS', 'Article image alt text present')

    # LINKING
    has_md_internal = bool(INTERNAL_MD_LINK_RE.search(md))
    stored_links = [l for l in (doc.get('internalLinks') or []) if (l.get('url') or '').strip()]
    pillar_hints = link_suggestions_for(doc)
    has_pillar = any(
        any(p in (l.get('url') or '') for p in pillar_hints)
        for l in stored_links
    ) or any(p in md for p in pillar_hints)

    if has_pillar:
        add('pillar_link', 'PASS', 'Links to pillar service')
    elif has_md_internal or stored_links:
        add('pillar_link', 'WARNING', 'Has internal links but no clear pillar service link')
    else:
        add('internal_links', 'WARNING', 'No internal links found')

    if doc.get('relatedSlugs'):
        add('related', 'PASS', 'Related article link(s) set')
    elif doc.get('status') in ('published', 'scheduled', 'review'):
        add('related', 'WARNING', 'No related article slugs')

    industry_paths = ('/industries',)
    has_industry = any('/industries' in (l.get('url') or '') for l in stored_links) or '/industries' in md
    if has_industry:
        add('industry_link', 'PASS', 'Industry link present')
    elif doc.get('category') == 'Industry Guides':
        add('industry_link', 'WARNING', 'No industry link')

    # TRUST
    author = doc.get('author') or {}
    if (author.get('name') or '').strip():
        add('author', 'PASS', 'Author set')
    else:
        add('author', 'ERROR' if doc.get('status') == 'published' else 'WARNING', 'Author missing')

    if doc.get('publishedAt') or doc.get('status') in ('draft', 'review'):
        add('publication_date', 'PASS', 'Publication date configured or not yet published')
    else:
        add('publication_date', 'WARNING', 'No publication date')

    topic = (doc.get('title') or '') + ' ' + md
    needs_sources = bool(re.search(
        r'(?i)\b(incoterm|tariff|customs|regulation|compliance|certificate of origin|law|statute|government)\b',
        topic,
    ))
    sources = [s for s in (doc.get('sources') or []) if (s.get('url') or s.get('label') or '').strip()]
    if needs_sources and not sources:
        add('sources', 'WARNING', 'Topic may require primary/professional sources')
    elif sources:
        add('sources', 'PASS', 'Sources provided')

    # TECHNICAL
    if (seo.get('metaTitle') or doc.get('title')) and (seo.get('metaDescription') or doc.get('excerpt')):
        add('schema_ready', 'PASS', 'BlogPosting fields complete enough')
    else:
        add('schema_ready', 'WARNING', 'Schema incomplete (title/description)')

    if seo.get('canonicalUrl'):
        add('canonical', 'WARNING', 'Custom canonical override set')
    else:
        add('canonical', 'PASS', 'Default canonical (site origin + slug)')

    if seo.get('index', True):
        add('index', 'PASS', 'Index enabled')
    else:
        add('index', 'WARNING', 'Index disabled')

    if doc.get('status') == 'published' and seo.get('index', True):
        add('sitemap', 'PASS', 'Sitemap eligible')
    elif doc.get('status') == 'published':
        add('sitemap', 'WARNING', 'Published but noindex - excluded from useful discovery')
    else:
        add('sitemap', 'PASS', 'Not yet published (correctly excluded from sitemap)')

    if is_refresh_due(doc):
        add('refresh', 'WARNING', 'Content refresh due')

    # Silence unused
    _ = industry_paths
    return checks


def seo_issue_codes(doc: dict) -> list[str]:
    """Codes used for admin list filtering."""
    codes = []
    for c in seo_health_checks(doc):
        if c['level'] in ('WARNING', 'ERROR'):
            codes.append(c['code'])
    return codes


def seo_status_label(doc: dict) -> str:
    levels = {c['level'] for c in seo_health_checks(doc)}
    if 'ERROR' in levels:
        return 'Issues'
    if 'WARNING' in levels:
        return 'Warnings'
    return 'Healthy'


def find_title_overlap(candidate: dict, existing: list[dict], *, limit: int = 5) -> list[dict]:
    """Simple cannibalization hint by shared significant tokens in title/slug."""
    title = (candidate.get('title') or '').lower()
    slug = (candidate.get('slug') or '').lower()
    tokens = {t for t in re.split(r'[^a-z0-9]+', title + ' ' + slug) if len(t) > 3}
    stop = {'from', 'with', 'that', 'this', 'what', 'when', 'your', 'into', 'india', 'guide', 'practical'}
    tokens -= stop
    if not tokens:
        return []
    overlaps = []
    cand_id = candidate.get('id')
    for doc in existing:
        if cand_id and doc.get('id') == cand_id:
            continue
        other = ((doc.get('title') or '') + ' ' + (doc.get('slug') or '')).lower()
        other_tokens = {t for t in re.split(r'[^a-z0-9]+', other) if len(t) > 3} - stop
        shared = tokens & other_tokens
        if len(shared) >= 3:
            overlaps.append({
                'id': doc.get('id'),
                'title': doc.get('title'),
                'slug': doc.get('slug'),
                'status': doc.get('status'),
                'sharedTokens': sorted(shared)[:8],
            })
        if len(overlaps) >= limit:
            break
    return overlaps
