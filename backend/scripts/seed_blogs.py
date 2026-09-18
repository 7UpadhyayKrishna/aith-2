#!/usr/bin/env python3
"""
Seed evergreen trade blog articles into MongoDB.

Usage (from backend/):
  python scripts/seed_blogs.py
  python scripts/seed_blogs.py --update   # refresh content for existing slugs

Idempotent: matches by slug. Default skips existing; --update overwrites content fields.
Requires MONGO_URL and DB_NAME in environment or backend/.env.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv

load_dotenv(ROOT / '.env')

from pymongo import ASCENDING, DESCENDING, MongoClient

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


def ensure_indexes(db) -> None:
    db.blogs.create_index('slug', unique=True)
    db.blogs.create_index('id', unique=True)
    db.blogs.create_index([('status', ASCENDING), ('publishedAt', DESCENDING)])
    db.blogs.create_index('updatedAt')
    print('Indexes ensured on blogs (slug, id, status+publishedAt, updatedAt).')


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


def main() -> int:
    parser = argparse.ArgumentParser(description='Seed AITH blog articles')
    parser.add_argument(
        '--update',
        action='store_true',
        help='Update existing articles matched by slug (default: skip)',
    )
    args = parser.parse_args()

    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    if not mongo_url or not db_name:
        print('MONGO_URL and DB_NAME are required.', file=sys.stderr)
        return 1

    try:
        articles = load_articles()
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    client = MongoClient(mongo_url)
    db = client[db_name]
    ensure_indexes(db)

    now = iso_now()
    inserted = 0
    updated = 0
    skipped = 0
    errors = 0

    print(f'Loaded {len(articles)} article(s) from {SEED_DIR}')
    print(f'Mode: {"update existing" if args.update else "skip existing"}')
    print('-' * 60)

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

        existing = db.blogs.find_one({'slug': slug}, {'_id': 0})
        if existing and not args.update:
            print(f'SKIP   {slug}')
            skipped += 1
            continue

        doc = build_doc(article, now, existing if args.update else None)
        if existing and args.update:
            db.blogs.replace_one({'slug': slug}, doc)
            print(f'UPDATE {slug}')
            updated += 1
        else:
            db.blogs.insert_one(doc)
            print(f'INSERT {slug}')
            inserted += 1

    print('-' * 60)
    print(
        f'Summary: inserted={inserted} updated={updated} '
        f'skipped={skipped} errors={errors} total={len(articles)}'
    )
    client.close()
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
