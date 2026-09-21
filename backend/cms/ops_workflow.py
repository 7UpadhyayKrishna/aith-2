"""Shared ops workflow helpers: status, ownership, activity, notes, attention."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import HTTPException

from cms import config
from cms.security import iso_now, utcnow

# Canonical statuses (underscore). Hyphen aliases accepted on write for legacy data.
ENQUIRY_STATUSES = frozenset({'new', 'read', 'in_progress', 'resolved', 'archived'})
QUOTE_STATUSES = frozenset({'new', 'reviewing', 'responded', 'closed', 'archived'})
CAREER_APP_STATUSES = frozenset({
    'new', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired', 'archived',
})
JOB_STATUSES = frozenset({'draft', 'published', 'archived'})

_STATUS_ALIASES = {
    'in-progress': 'in_progress',
    'in progress': 'in_progress',
}

RECORD_TYPES = frozenset({'enquiry', 'quote', 'career_application'})

COLLECTION_BY_TYPE = {
    'enquiry': 'contact_submissions',
    'quote': 'quote_submissions',
    'career_application': 'career_submissions',
}

STATUSES_BY_TYPE = {
    'enquiry': ENQUIRY_STATUSES,
    'quote': QUOTE_STATUSES,
    'career_application': CAREER_APP_STATUSES,
}

AUDIT_RESOURCE = {
    'enquiry': 'enquiry',
    'quote': 'quote',
    'career_application': 'career_application',
}


def normalize_status(value: Optional[str]) -> str:
    raw = (value or 'new').strip().lower() or 'new'
    return _STATUS_ALIASES.get(raw, raw)


def validate_status(record_type: str, value: str) -> str:
    status = normalize_status(value)
    allowed = STATUSES_BY_TYPE[record_type]
    if status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f'Invalid status. Allowed: {", ".join(sorted(allowed))}',
        )
    return status


def attention_thresholds() -> dict[str, float]:
    """Internal attention thresholds (hours). Not a contractual SLA."""
    return {
        'enquiryNewHours': float(config.OPS_ENQUIRY_NEW_HOURS),
        'quoteUnassignedHours': float(config.OPS_QUOTE_UNASSIGNED_HOURS),
        'careerUntouchedDays': float(config.OPS_CAREER_UNTOUCHED_DAYS),
    }


def _parse_iso(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        text = str(value).replace('Z', '+00:00')
        dt = datetime.fromisoformat(text)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except (TypeError, ValueError):
        return None


def compute_attention(record_type: str, doc: dict) -> dict[str, Any]:
    """Return non-contractual internal attention flags for a record."""
    thr = attention_thresholds()
    now = utcnow()
    created = _parse_iso(doc.get('createdAt')) or now
    status = normalize_status(doc.get('internalStatus'))
    assigned = bool(doc.get('assignedTo'))
    updated = _parse_iso(doc.get('updatedAt')) or created
    age_hours = max(0.0, (now - created).total_seconds() / 3600.0)
    untouched_hours = max(0.0, (now - updated).total_seconds() / 3600.0)

    needs_attention = False
    overdue_review = False
    reasons: list[str] = []

    if record_type == 'enquiry':
        if status == 'new' and age_hours >= thr['enquiryNewHours']:
            needs_attention = True
            overdue_review = True
            reasons.append('new_enquiry_stale')
        if not assigned and status not in ('resolved', 'archived') and age_hours >= thr['enquiryNewHours']:
            needs_attention = True
            reasons.append('unassigned')
    elif record_type == 'quote':
        if not assigned and status not in ('closed', 'archived') and age_hours >= thr['quoteUnassignedHours']:
            needs_attention = True
            overdue_review = True
            reasons.append('quote_unassigned')
        if status == 'new' and age_hours >= thr['quoteUnassignedHours']:
            needs_attention = True
            reasons.append('new_quote_stale')
    else:  # career
        days = thr['careerUntouchedDays']
        if status == 'new' and untouched_hours >= days * 24:
            needs_attention = True
            overdue_review = True
            reasons.append('application_untouched')
        if not assigned and status not in ('rejected', 'hired', 'archived') and untouched_hours >= days * 24:
            needs_attention = True
            reasons.append('unassigned')

    return {
        'unassigned': not assigned,
        'needsAttention': needs_attention,
        'overdueInternalReview': overdue_review,
        'attentionReasons': reasons,
        'ageHours': round(age_hours, 1),
    }


def enrich_ops_record(record_type: str, doc: dict) -> dict:
    out = dict(doc)
    out['internalStatus'] = normalize_status(out.get('internalStatus'))
    out['assignedTo'] = out.get('assignedTo') or None
    out['assignedToName'] = out.get('assignedToName') or None
    out['assignedAt'] = out.get('assignedAt') or None
    out['assignedBy'] = out.get('assignedBy') or None
    out['attention'] = compute_attention(record_type, out)
    return out


async def append_activity(
    db,
    *,
    record_type: str,
    record_id: str,
    event_type: str,
    actor_id: Optional[str] = None,
    actor_name: Optional[str] = None,
    summary: str = '',
    meta: Optional[dict] = None,
) -> dict:
    event = {
        'id': str(uuid.uuid4()),
        'recordType': record_type,
        'recordId': record_id,
        'eventType': event_type,
        'actorId': actor_id,
        'actorName': actor_name,
        'summary': (summary or '')[:500],
        'meta': meta or {},
        'createdAt': iso_now(),
    }
    await db.ops_activity.insert_one(event)
    return event


async def list_activity(db, record_type: str, record_id: str, *, limit: int = 100) -> list[dict]:
    items = []
    cursor = (
        db.ops_activity.find({'recordType': record_type, 'recordId': record_id}, {'_id': 0})
        .sort('createdAt', -1)
        .limit(limit)
    )
    async for d in cursor:
        items.append(d)
    items.reverse()  # chronological for UI
    return items


async def add_note(
    db,
    *,
    record_type: str,
    record_id: str,
    author_id: str,
    author_name: str,
    body: str,
) -> dict:
    text = (body or '').strip()
    if not text:
        raise HTTPException(status_code=400, detail='Note body is required')
    if len(text) > 4000:
        raise HTTPException(status_code=400, detail='Note too long')
    note = {
        'id': str(uuid.uuid4()),
        'recordType': record_type,
        'recordId': record_id,
        'authorId': author_id,
        'authorName': author_name,
        'body': text,
        'createdAt': iso_now(),
        'editedAt': None,
    }
    await db.ops_notes.insert_one(note)
    return note


async def list_notes(db, record_type: str, record_id: str) -> list[dict]:
    items = []
    async for d in db.ops_notes.find(
        {'recordType': record_type, 'recordId': record_id}, {'_id': 0}
    ).sort('createdAt', 1).limit(200):
        items.append(d)
    return items


async def resolve_assignee(db, assignee_id: Optional[str]) -> Optional[dict]:
    if not assignee_id:
        return None
    user = await db.admin_users.find_one({'id': assignee_id}, {'_id': 0})
    if not user or not user.get('isActive', user.get('active', True)):
        raise HTTPException(status_code=400, detail='Assignee not found or inactive')
    if user.get('role') != config.ROLE_ADMIN:
        raise HTTPException(
            status_code=403,
            detail='PII records may only be assigned to admin users',
        )
    return user


async def apply_assignment(
    db,
    *,
    collection_name: str,
    record_type: str,
    record_id: str,
    assignee_id: Optional[str],
    actor: dict,
) -> dict:
    """Assign, reassign, or unassign. Does not mutate original submission fields."""
    coll = getattr(db, collection_name)
    existing = await coll.find_one({'id': record_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail='Not found')

    now = iso_now()
    if assignee_id:
        assignee = await resolve_assignee(db, assignee_id)
        update = {
            'assignedTo': assignee['id'],
            'assignedToName': assignee.get('displayName') or assignee.get('name') or assignee.get('email'),
            'assignedAt': now,
            'assignedBy': actor['id'],
            'updatedAt': now,
            'updatedBy': actor['id'],
        }
        event_type = 'assigned'
        summary = f"Assigned to {update['assignedToName']}"
    else:
        update = {
            'assignedTo': None,
            'assignedToName': None,
            'assignedAt': None,
            'assignedBy': None,
            'updatedAt': now,
            'updatedBy': actor['id'],
        }
        event_type = 'unassigned'
        summary = 'Unassigned'

    await coll.update_one({'id': record_id}, {'$set': update})
    await append_activity(
        db,
        record_type=record_type,
        record_id=record_id,
        event_type=event_type,
        actor_id=actor['id'],
        actor_name=actor.get('name') or actor.get('email'),
        summary=summary,
        meta={'assignedTo': update.get('assignedTo')},
    )
    fresh = await coll.find_one({'id': record_id}, {'_id': 0})
    return enrich_ops_record(record_type, fresh or {**existing, **update})


def job_accepting_applications(job: dict, *, now: Optional[datetime] = None) -> bool:
    if (job.get('status') or '') != 'published':
        return False
    deadline = (job.get('applicationDeadline') or '').strip()
    if not deadline:
        return True
    now = now or utcnow()
    # Date-only deadlines expire at end of that UTC day
    try:
        if len(deadline) == 10:
            end = datetime.fromisoformat(deadline + 'T23:59:59+00:00')
        else:
            end = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            if end.tzinfo is None:
                end = end.replace(tzinfo=timezone.utc)
        return now <= end
    except ValueError:
        return True


def serialize_job(d: dict, *, include_private: bool = True) -> dict:
    cover = d.get('coverImage') if isinstance(d.get('coverImage'), dict) else {}
    out = {
        'id': d.get('id'),
        'slug': d.get('slug'),
        'title': d.get('title'),
        'team': d.get('team'),
        'location': d.get('location'),
        'type': d.get('type'),
        'experienceLevel': d.get('experienceLevel') or '',
        'blurb': d.get('blurb'),
        'descriptionMarkdown': d.get('descriptionMarkdown') or '',
        'responsibilities': d.get('responsibilities') or [],
        'requirements': d.get('requirements') or [],
        'salaryMin': d.get('salaryMin'),
        'salaryMax': d.get('salaryMax'),
        'salaryCurrency': d.get('salaryCurrency') or '',
        'salaryPeriod': d.get('salaryPeriod') or '',
        'applicationDeadline': d.get('applicationDeadline') or None,
        'coverImage': {
            'url': (cover.get('url') or '') if cover else '',
            'alt': (cover.get('alt') or '') if cover else '',
        },
        'postedAt': d.get('postedAt'),
        'status': d.get('status') or 'draft',
        'acceptingApplications': job_accepting_applications(d),
        'createdAt': d.get('createdAt'),
        'updatedAt': d.get('updatedAt'),
    }
    if include_private:
        out['createdBy'] = d.get('createdBy')
        out['updatedBy'] = d.get('updatedBy')
    return out


def list_filter_query(
    *,
    status: Optional[str] = None,
    assignee: Optional[str] = None,
    unassigned: bool = False,
    needs_attention: bool = False,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> dict[str, Any]:
    """Build a Mongo-shaped query. Attention is applied in Python after fetch when needed."""
    q: dict[str, Any] = {}
    and_clauses: list[dict] = []

    if status:
        norm = normalize_status(status)
        if norm == 'new':
            and_clauses.append({
                '$or': [
                    {'internalStatus': 'new'},
                    {'internalStatus': {'$exists': False}},
                ]
            })
        elif norm == 'in_progress':
            and_clauses.append({
                '$or': [
                    {'internalStatus': 'in_progress'},
                    {'internalStatus': 'in-progress'},
                ]
            })
        else:
            q['internalStatus'] = norm

    if unassigned:
        and_clauses.append({
            '$or': [
                {'assignedTo': None},
                {'assignedTo': {'$exists': False}},
                {'assignedTo': ''},
            ]
        })
    elif assignee:
        q['assignedTo'] = assignee

    if date_from:
        and_clauses.append({'createdAt': {'$gte': date_from}})
    if date_to:
        # inclusive upper bound if date-only
        upper = date_to if 'T' in date_to else f'{date_to}T23:59:59.999Z'
        and_clauses.append({'createdAt': {'$lte': upper}})

    if and_clauses:
        existing = q.pop('$and', [])
        q['$and'] = existing + and_clauses
    return q


def filter_attention_items(record_type: str, items: list[dict], *, needs_attention: bool) -> list[dict]:
    if not needs_attention:
        return items
    out = []
    for d in items:
        enriched = enrich_ops_record(record_type, d)
        if enriched['attention']['needsAttention']:
            out.append(enriched)
    return out
