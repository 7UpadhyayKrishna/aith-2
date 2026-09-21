#!/usr/bin/env python3
"""
Seed evergreen trade blog articles into Postgres (Supabase).

Usage (from backend/):
  py -3 scripts/seed_blogs.py
  py -3 scripts/seed_blogs.py --update   # refresh content for existing slugs

Idempotent: matches by slug. Default skips existing; --update overwrites content fields.
Requires DATABASE_URL in environment or backend/.env.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / '.env')

from cms.script_db import open_db

SEED_DIR = Path(__file__).resolve().parent / 'seed_data'


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_articles() -> list[dict]:
    if not SEED_DIR.is_dir():
        raise FileNotFoundError(f'Seed directory not found: {SEED_DIR}')

    files = sorted(SEED_DIR.glob('*.json'))
    if not files:
        raise FileNotFoundError(f'No JSON articles in {SEED_DIR}')

    articles: list[dict] = []
    for path in files:
        with path.open(encoding='utf-8') as fh:
            data = json.load(fh)
        if isinstance(data, list):
            articles.extend(data)
        else:
            articles.append(data)
    return articles


def build_doc(article: dict, now: str, existing: dict | None = None) -> dict:
    """Merge seed fields onto create or update payload."""
    slug = article['slug'].strip().lower()
    author = article.get('author') or {
        'type': 'Organization',
        'name': 'AITH Editorial Team',
    }
    featured_image = article.get('featuredImage') or {
        'url': '/brand/blog/source-from-india.jpg',
        'alt': article.get('title', 'AITH Insights'),
    }
    cover = article.get('cover') or {
        'eyebrow': 'TRADE JOURNAL',
        'headline': article.get('title') or '',
        'deck': article.get('excerpt') or '',
        'image': {
            'url': featured_image.get('url'),
            'alt': featured_image.get('alt'),
            'caption': featured_image.get('caption') or '',
            'credit': '',
        },
    }
    seo = article.get('seo') or {}
    published_at = article.get('publishedAt') or now

    base = {
        'title': article['title'],
        'slug': slug,
        'excerpt': article.get('excerpt', ''),
        'contentMarkdown': article.get('contentMarkdown', ''),
        'category': article.get('category', 'Global Sourcing'),
        'tags': article.get('tags') or [],
        'author': author,
        'featuredImage': featured_image,
        'cover': cover,
        'status': article.get('status', 'published'),
        'featured': bool(article.get('featured', False)),
        'publishedAt': published_at,
        'scheduledAt': article.get('scheduledAt'),
        'seo': seo,
        'relatedSlugs': article.get('relatedSlugs') or [],
        'sources': article.get('sources') or [],
        'updatedAt': now,
    }

    if existing:
        return {
            **existing,
            **base,
            'id': existing.get('id') or str(uuid.uuid4()),
            'createdAt': existing.get('createdAt') or now,
        }

    return {
        **base,
        'id': str(uuid.uuid4()),
        'createdAt': now,
    }


async def _run(update: bool) -> int:
    try:
        articles = load_articles()
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    now = iso_now()
    inserted = 0
    updated = 0
    skipped = 0
    errors = 0

    print(f'Loaded {len(articles)} article(s) from {SEED_DIR}')
    print(f'Mode: {"update existing" if update else "skip existing"}')
    print('-' * 60)

    async with open_db(apply_schema=True) as db:
        for article in articles:
            slug = (article.get('slug') or '').strip().lower()
            title = article.get('title') or '(untitled)'
            if not slug:
                print(f'ERROR  missing slug for: {title}')
                errors += 1
                continue
            if not article.get('contentMarkdown', '').strip():
                print(f'ERROR  empty contentMarkdown for: {slug}')
                errors += 1
                continue

            existing = await db.blogs.find_one({'slug': slug})
            if existing and not update:
                print(f'SKIP   {slug}')
                skipped += 1
                continue

            doc = build_doc(article, now, existing if update else None)
            if existing and update:
                await db.blogs.replace_one({'slug': slug}, doc)
                print(f'UPDATE {slug}')
                updated += 1
            else:
                await db.blogs.insert_one(doc)
                print(f'INSERT {slug}')
                inserted += 1

    print('-' * 60)
    print(
        f'Summary: inserted={inserted} updated={updated} '
        f'skipped={skipped} errors={errors} total={len(articles)}'
    )
    return 1 if errors else 0


def main() -> int:
    parser = argparse.ArgumentParser(description='Seed AITH blog articles')
    parser.add_argument(
        '--update',
        action='store_true',
        help='Update existing articles matched by slug (default: skip)',
    )
    args = parser.parse_args()
    return asyncio.run(_run(args.update))


if __name__ == '__main__':
    raise SystemExit(main())
