"""Ops console routes: ownership, notes, activity, reply, bulk, CSV, jobs CMS."""
from __future__ import annotations

import csv
import io
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel, Field

from cms import config
from cms.audit import write_audit
from cms.deps import get_db, require_role, require_role_read
from cms.mail import send_email, smtp_configured, smtp_startup_state
from cms.ops_workflow import (
    CAREER_APP_STATUSES,
    ENQUIRY_STATUSES,
    JOB_STATUSES,
    QUOTE_STATUSES,
    add_note,
    append_activity,
    apply_assignment,
    attention_thresholds,
    compute_attention,
    enrich_ops_record,
    filter_attention_items,
    job_accepting_applications,
    list_activity,
    list_filter_query,
    list_notes,
    normalize_status,
    serialize_job,
    validate_status,
)
from cms.security import iso_now, public_user

router = APIRouter(prefix='/admin', tags=['admin-ops-console'])

OpsRead = Depends(require_role_read(config.ROLE_ADMIN))
OpsWrite = Depends(require_role(config.ROLE_ADMIN))


def _client_ip(request: Request) -> str:
    from cms.request_utils import client_ip

    return client_ip(request)


def _actor_name(user: dict) -> str:
    return user.get('name') or user.get('email') or user.get('id')


# ---- Shared request bodies ----

class StatusBody(BaseModel):
    internalStatus: str
    # Legacy single-note field still accepted; prefer POST .../notes
    internalNote: Optional[str] = Field(default=None, max_length=2000)


class AssignBody(BaseModel):
    assignedTo: Optional[str] = Field(default=None, max_length=80)


class NoteBody(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class ReplyBody(BaseModel):
    to: Optional[str] = Field(default=None, max_length=200)
    subject: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=20000)


class BulkBody(BaseModel):
    ids: list[str] = Field(min_length=1, max_length=100)
    action: str = Field(min_length=1, max_length=40)
    status: Optional[str] = None
    assignedTo: Optional[str] = None
    confirm: bool = False


class CoverImageBody(BaseModel):
    url: Optional[str] = Field(default='', max_length=2000)
    alt: Optional[str] = Field(default='', max_length=300)


class JobBody(BaseModel):
    slug: Optional[str] = Field(default=None, max_length=120)
    title: str = Field(min_length=2, max_length=200)
    team: str = Field(default='', max_length=120)
    location: str = Field(default='', max_length=120)
    type: str = Field(default='Full-time', max_length=80)
    experienceLevel: Optional[str] = Field(default='', max_length=80)
    blurb: str = Field(default='', max_length=2000)
    descriptionMarkdown: Optional[str] = Field(default='', max_length=config.MAX_MARKDOWN_CHARS)
    responsibilities: list[str] = Field(default_factory=list, max_length=40)
    requirements: list[str] = Field(default_factory=list, max_length=40)
    salaryMin: Optional[float] = None
    salaryMax: Optional[float] = None
    salaryCurrency: Optional[str] = Field(default='', max_length=8)
    salaryPeriod: Optional[str] = Field(default='', max_length=40)
    applicationDeadline: Optional[str] = Field(default=None, max_length=40)
    coverImage: Optional[CoverImageBody] = None
    status: Optional[str] = Field(default=None, max_length=32)
    postedAt: Optional[str] = Field(default=None, max_length=40)


RECORD_CFG = {
    'enquiry': {
        'collection': 'contact_submissions',
        'statuses': ENQUIRY_STATUSES,
        'audit_prefix': 'ENQUIRY',
        'resource': 'enquiry',
        'csv_name': 'enquiries.csv',
    },
    'quote': {
        'collection': 'quote_submissions',
        'statuses': QUOTE_STATUSES,
        'audit_prefix': 'QUOTE',
        'resource': 'quote',
        'csv_name': 'quotes.csv',
    },
    'career_application': {
        'collection': 'career_submissions',
        'statuses': CAREER_APP_STATUSES,
        'audit_prefix': 'CAREER',
        'resource': 'career_application',
        'csv_name': 'career_applications.csv',
    },
}


async def _get_collection(db, record_type: str):
    return getattr(db, RECORD_CFG[record_type]['collection'])


async def _load_record(db, record_type: str, record_id: str) -> dict:
    coll = await _get_collection(db, record_type)
    d = await coll.find_one({'id': record_id}, {'_id': 0})
    if not d:
        raise HTTPException(status_code=404, detail='Not found')
    return enrich_ops_record(record_type, d)


def _slugify_job(title: str) -> str:
    import re

    base = re.sub(r'[^a-z0-9]+', '-', (title or '').lower()).strip('-')[:80] or 'role'
    return base


def _job_fields_from_body(body: JobBody, *, existing: Optional[dict] = None) -> dict:
    cover = body.coverImage
    cover_url = (cover.url if cover else None)
    cover_alt = (cover.alt if cover else None)
    if cover is None and existing:
        prev = existing.get('coverImage') if isinstance(existing.get('coverImage'), dict) else {}
        cover_url = prev.get('url', '')
        cover_alt = prev.get('alt', '')
    salary_min = body.salaryMin
    salary_max = body.salaryMax
    if salary_min is not None and salary_max is not None and salary_min > salary_max:
        raise HTTPException(status_code=400, detail='salaryMin cannot exceed salaryMax')
    deadline = (body.applicationDeadline or '').strip() or None
    return {
        'experienceLevel': (body.experienceLevel or '').strip(),
        'descriptionMarkdown': (body.descriptionMarkdown or '').strip(),
        'salaryMin': salary_min,
        'salaryMax': salary_max,
        'salaryCurrency': (body.salaryCurrency or '').strip().upper()[:8],
        'salaryPeriod': (body.salaryPeriod or '').strip(),
        'applicationDeadline': deadline,
        'coverImage': {
            'url': (cover_url or '').strip()[:2000],
            'alt': (cover_alt or '').strip()[:300],
        },
    }


# ---- List / detail / patch helpers ----

async def _list_records(
    db,
    record_type: str,
    *,
    page: int,
    limit: int,
    status: Optional[str],
    search: Optional[str],
    assignee: Optional[str],
    unassigned: bool,
    needs_attention: bool,
    date_from: Optional[str],
    date_to: Optional[str],
    extra_q: Optional[dict] = None,
    search_fields: Optional[list[str]] = None,
):
    q = list_filter_query(
        status=status,
        assignee=assignee,
        unassigned=unassigned,
        needs_attention=needs_attention,
        date_from=date_from,
        date_to=date_to,
    )
    if extra_q:
        q.update(extra_q)
    if search:
        from cms.request_utils import escape_regex

        term = escape_regex(search, max_len=100)
        fields = search_fields or ['name', 'email', 'company']
        search_clause = {'$or': [{f: {'$regex': term, '$options': 'i'}} for f in fields]}
        if '$and' in q:
            q['$and'].append(search_clause)
        else:
            q['$and'] = [search_clause]

    coll = await _get_collection(db, record_type)

    # Attention filter requires scan when DB cannot express it
    if needs_attention:
        raw = [d async for d in coll.find(q, {'_id': 0}).sort('createdAt', -1).limit(500)]
        filtered = filter_attention_items(record_type, raw, needs_attention=True)
        total = len(filtered)
        start = (page - 1) * limit
        page_items = filtered[start:start + limit]
        items = [enrich_ops_record(record_type, d) for d in page_items]
        return {'items': items, 'page': page, 'limit': limit, 'total': total}

    total = await coll.count_documents(q)
    cursor = coll.find(q, {'_id': 0}).sort('createdAt', -1).skip((page - 1) * limit).limit(limit)
    items = [enrich_ops_record(record_type, d) async for d in cursor]
    return {'items': items, 'page': page, 'limit': limit, 'total': total}


async def _patch_status(
    db,
    request: Request,
    user: dict,
    record_type: str,
    record_id: str,
    body: StatusBody,
):
    status = validate_status(record_type, body.internalStatus)
    coll = await _get_collection(db, record_type)
    existing = await coll.find_one({'id': record_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail='Not found')
    prev = normalize_status(existing.get('internalStatus'))
    update = {
        'internalStatus': status,
        'updatedAt': iso_now(),
        'updatedBy': user['id'],
    }
    if body.internalNote is not None:
        update['internalNote'] = body.internalNote
    await coll.update_one({'id': record_id}, {'$set': update})
    cfg = RECORD_CFG[record_type]
    if prev != status:
        await append_activity(
            db,
            record_type=record_type,
            record_id=record_id,
            event_type='status_changed',
            actor_id=user['id'],
            actor_name=_actor_name(user),
            summary=f'Status {prev} → {status}',
            meta={'from': prev, 'to': status},
        )
        await write_audit(
            db,
            action=f'{cfg["audit_prefix"]}_STATUS_CHANGED',
            admin_user_id=user['id'],
            resource_type=cfg['resource'],
            resource_id=record_id,
            result='ok',
            meta={'status': status, 'from': prev},
            ip=_client_ip(request),
        )
    if body.internalNote is not None and body.internalNote.strip():
        # Keep legacy field but also append timeline note event (not duplicate note row)
        await append_activity(
            db,
            record_type=record_type,
            record_id=record_id,
            event_type='note_updated',
            actor_id=user['id'],
            actor_name=_actor_name(user),
            summary='Internal note updated',
        )
    return {'ok': True}


async def _assign(db, request, user, record_type, record_id, body: AssignBody):
    cfg = RECORD_CFG[record_type]
    result = await apply_assignment(
        db,
        collection_name=cfg['collection'],
        record_type=record_type,
        record_id=record_id,
        assignee_id=body.assignedTo,
        actor=user,
    )
    await write_audit(
        db,
        action=f'{cfg["audit_prefix"]}_ASSIGNED',
        admin_user_id=user['id'],
        resource_type=cfg['resource'],
        resource_id=record_id,
        result='ok',
        meta={'assignedTo': body.assignedTo},
        ip=_client_ip(request),
    )
    return result


async def _post_note(db, request, user, record_type, record_id, body: NoteBody):
    await _load_record(db, record_type, record_id)
    note = await add_note(
        db,
        record_type=record_type,
        record_id=record_id,
        author_id=user['id'],
        author_name=_actor_name(user),
        body=body.body,
    )
    await append_activity(
        db,
        record_type=record_type,
        record_id=record_id,
        event_type='note_added',
        actor_id=user['id'],
        actor_name=_actor_name(user),
        summary='Internal note added',
        meta={'noteId': note['id']},
    )
    cfg = RECORD_CFG[record_type]
    await write_audit(
        db,
        action=f'{cfg["audit_prefix"]}_NOTE_ADDED',
        admin_user_id=user['id'],
        resource_type=cfg['resource'],
        resource_id=record_id,
        result='ok',
        meta={'noteId': note['id']},
        ip=_client_ip(request),
    )
    return note


async def _reply(db, request, user, record_type, record_id, body: ReplyBody):
    doc = await _load_record(db, record_type, record_id)
    to_addr = (body.to or doc.get('email') or '').strip()
    if not to_addr or '@' not in to_addr:
        raise HTTPException(status_code=400, detail='Valid recipient email required')

    if not smtp_configured():
        return {
            'ok': False,
            'configured': False,
            'message': 'Email delivery is not configured.',
            'copy': {
                'to': to_addr,
                'subject': body.subject,
                'body': body.body,
            },
        }

    status, err = send_email(
        to=to_addr,
        subject=body.subject,
        body=body.body,
        reply_to=os_environ_ops_from(),
        meta={'id': record_id, 'kind': record_type, 'direction': 'outbound'},
    )
    msg = {
        'id': str(uuid.uuid4()),
        'messageId': str(uuid.uuid4()),
        'recordType': record_type,
        'recordId': record_id,
        'direction': 'outbound',
        'to': to_addr,
        'subject': body.subject,
        'bodyPreview': body.body[:280],
        'body': body.body,
        'sentAt': iso_now(),
        'sentBy': user['id'],
        'sentByName': _actor_name(user),
        'deliveryStatus': status,
        'deliveryError': err,
    }
    await db.ops_messages.insert_one(msg)
    await append_activity(
        db,
        record_type=record_type,
        record_id=record_id,
        event_type='reply_sent' if status == 'sent' else 'reply_failed',
        actor_id=user['id'],
        actor_name=_actor_name(user),
        summary=f'Reply {status}: {body.subject[:80]}',
        meta={'messageId': msg['id'], 'deliveryStatus': status},
    )
    cfg = RECORD_CFG[record_type]
    await write_audit(
        db,
        action=f'{cfg["audit_prefix"]}_REPLY',
        admin_user_id=user['id'],
        resource_type=cfg['resource'],
        resource_id=record_id,
        result='ok' if status == 'sent' else 'error',
        meta={'deliveryStatus': status},
        ip=_client_ip(request),
    )
    if status != 'sent':
        raise HTTPException(status_code=502, detail=err or 'Email send failed')
    return {'ok': True, 'configured': True, 'message': msg}


def os_environ_ops_from() -> Optional[str]:
    import os
    return os.environ.get('SMTP_FROM') or os.environ.get('OPS_NOTIFICATION_EMAIL')


async def _bulk(db, request, user, record_type, body: BulkBody):
    action = (body.action or '').strip().lower()
    if action in ('archive',) and not body.confirm:
        raise HTTPException(status_code=400, detail='Bulk archive requires confirm=true')
    cfg = RECORD_CFG[record_type]
    coll = await _get_collection(db, record_type)
    updated = 0
    for rid in body.ids[:100]:
        existing = await coll.find_one({'id': rid}, {'_id': 0})
        if not existing:
            continue
        if action == 'assign':
            await apply_assignment(
                db,
                collection_name=cfg['collection'],
                record_type=record_type,
                record_id=rid,
                assignee_id=body.assignedTo,
                actor=user,
            )
            updated += 1
        elif action == 'status':
            if not body.status:
                raise HTTPException(status_code=400, detail='status required')
            status = validate_status(record_type, body.status)
            prev = normalize_status(existing.get('internalStatus'))
            await coll.update_one(
                {'id': rid},
                {'$set': {'internalStatus': status, 'updatedAt': iso_now(), 'updatedBy': user['id']}},
            )
            if prev != status:
                await append_activity(
                    db,
                    record_type=record_type,
                    record_id=rid,
                    event_type='status_changed',
                    actor_id=user['id'],
                    actor_name=_actor_name(user),
                    summary=f'Status {prev} → {status} (bulk)',
                    meta={'from': prev, 'to': status, 'bulk': True},
                )
            updated += 1
        elif action == 'archive':
            prev = normalize_status(existing.get('internalStatus'))
            await coll.update_one(
                {'id': rid},
                {'$set': {'internalStatus': 'archived', 'updatedAt': iso_now(), 'updatedBy': user['id']}},
            )
            await append_activity(
                db,
                record_type=record_type,
                record_id=rid,
                event_type='status_changed',
                actor_id=user['id'],
                actor_name=_actor_name(user),
                summary=f'Status {prev} → archived (bulk)',
                meta={'bulk': True},
            )
            updated += 1
        else:
            raise HTTPException(status_code=400, detail='Invalid bulk action')
    await write_audit(
        db,
        action=f'{cfg["audit_prefix"]}_BULK',
        admin_user_id=user['id'],
        resource_type=cfg['resource'],
        result='ok',
        meta={'action': action, 'count': updated, 'ids': body.ids[:100]},
        ip=_client_ip(request),
    )
    return {'ok': True, 'updated': updated}


def _csv_response(filename: str, rows: list[list[Any]], header: list[str]) -> Response:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(header)
    for row in rows:
        writer.writerow(row)
    return Response(
        content=buf.getvalue(),
        media_type='text/csv',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'},
    )


# ---- Assignee directory (admins only) ----

@router.get('/assignees')
async def list_assignees(user: dict = OpsRead, db=Depends(get_db)):
    """Admins who may own PII ops records."""
    items = []
    async for d in db.admin_users.find({'role': config.ROLE_ADMIN}, {'_id': 0}):
        if not d.get('active', True):
            continue
        items.append({'id': d.get('id'), 'name': d.get('displayName') or d.get('name') or d.get('email'), 'email': d.get('email')})
    return {'items': items}


@router.get('/ops/config')
async def ops_config(user: dict = OpsRead):
    return {
        'attentionThresholds': attention_thresholds(),
        'emailDelivery': smtp_startup_state(),
        'emailConfigured': smtp_configured(),
        'statuses': {
            'enquiry': sorted(ENQUIRY_STATUSES),
            'quote': sorted(QUOTE_STATUSES),
            'career_application': sorted(CAREER_APP_STATUSES),
            'job': sorted(JOB_STATUSES),
        },
    }


# ---- Enquiries ----

@router.get('/enquiries')
async def list_enquiries(
    user: dict = OpsRead,
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=config.MAX_PAGE_SIZE),
    status: Optional[str] = None,
    search: Optional[str] = None,
    assignee: Optional[str] = None,
    unassigned: bool = False,
    needsAttention: bool = False,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
):
    data = await _list_records(
        db, 'enquiry', page=page, limit=limit, status=status, search=search,
        assignee=assignee, unassigned=unassigned, needs_attention=needsAttention,
        date_from=dateFrom, date_to=dateTo,
        search_fields=['name', 'email', 'company', 'subject'],
    )
    # Slim list payload
    data['items'] = [{
        'id': d.get('id'),
        'createdAt': d.get('createdAt'),
        'name': d.get('name'),
        'company': d.get('company'),
        'email': d.get('email'),
        'type': d.get('kind') or d.get('intent') or 'contact',
        'notificationStatus': d.get('notificationStatus'),
        'internalStatus': d.get('internalStatus'),
        'subject': d.get('subject'),
        'assignedTo': d.get('assignedTo'),
        'assignedToName': d.get('assignedToName'),
        'attention': d.get('attention'),
    } for d in data['items']]
    return data


@router.get('/enquiries/export.csv')
async def export_enquiries_csv(
    user: dict = OpsRead,
    db=Depends(get_db),
    status: Optional[str] = None,
    assignee: Optional[str] = None,
    unassigned: bool = False,
):
    q = list_filter_query(status=status, assignee=assignee, unassigned=unassigned)
    rows = []
    async for d in db.contact_submissions.find(q, {'_id': 0}).sort('createdAt', -1).limit(2000):
        e = enrich_ops_record('enquiry', d)
        rows.append([
            e.get('id'), e.get('createdAt'), e.get('name'), e.get('company'), e.get('email'),
            e.get('phone'), e.get('kind') or e.get('intent'), e.get('internalStatus'),
            e.get('assignedToName') or '', e.get('notificationStatus'), e.get('subject'),
        ])
    return _csv_response(
        'enquiries.csv',
        rows,
        ['id', 'createdAt', 'name', 'company', 'email', 'phone', 'type', 'status', 'assignee', 'notificationStatus', 'subject'],
    )


@router.post('/enquiries/bulk')
async def bulk_enquiries(body: BulkBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _bulk(db, request, user, 'enquiry', body)


@router.get('/enquiries/{enquiry_id}')
async def get_enquiry(enquiry_id: str, user: dict = OpsRead, db=Depends(get_db)):
    d = await _load_record(db, 'enquiry', enquiry_id)
    d['activity'] = await list_activity(db, 'enquiry', enquiry_id)
    d['notes'] = await list_notes(db, 'enquiry', enquiry_id)
    d['messages'] = [
        x async for x in db.ops_messages.find(
            {'recordType': 'enquiry', 'recordId': enquiry_id}, {'_id': 0, 'body': 0}
        ).sort('sentAt', -1).limit(50)
    ]
    return d


@router.patch('/enquiries/{enquiry_id}')
async def patch_enquiry(enquiry_id: str, body: StatusBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _patch_status(db, request, user, 'enquiry', enquiry_id, body)


@router.post('/enquiries/{enquiry_id}/assign')
async def assign_enquiry(enquiry_id: str, body: AssignBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _assign(db, request, user, 'enquiry', enquiry_id, body)


@router.post('/enquiries/{enquiry_id}/notes')
async def note_enquiry(enquiry_id: str, body: NoteBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _post_note(db, request, user, 'enquiry', enquiry_id, body)


@router.post('/enquiries/{enquiry_id}/reply')
async def reply_enquiry(enquiry_id: str, body: ReplyBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _reply(db, request, user, 'enquiry', enquiry_id, body)


# ---- Quotes ----

@router.get('/quotes')
async def list_quotes(
    user: dict = OpsRead,
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=config.MAX_PAGE_SIZE),
    status: Optional[str] = None,
    search: Optional[str] = None,
    assignee: Optional[str] = None,
    unassigned: bool = False,
    needsAttention: bool = False,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    requirementType: Optional[str] = None,
    destination: Optional[str] = None,
    product: Optional[str] = None,
):
    extra: dict[str, Any] = {}
    if requirementType:
        extra['requirementType'] = requirementType
    if destination:
        from cms.request_utils import escape_regex
        extra['destination'] = {'$regex': escape_regex(destination, max_len=80), '$options': 'i'}
    if product:
        from cms.request_utils import escape_regex
        extra['product'] = {'$regex': escape_regex(product, max_len=80), '$options': 'i'}
    data = await _list_records(
        db, 'quote', page=page, limit=limit, status=status, search=search,
        assignee=assignee, unassigned=unassigned, needs_attention=needsAttention,
        date_from=dateFrom, date_to=dateTo, extra_q=extra or None,
        search_fields=['name', 'company', 'email', 'reference', 'product', 'destination'],
    )
    data['items'] = [{
        'id': d.get('id'),
        'createdAt': d.get('createdAt'),
        'name': d.get('name'),
        'company': d.get('company'),
        'email': d.get('email'),
        'reference': d.get('reference'),
        'product': d.get('product'),
        'requirementType': d.get('requirementType'),
        'destination': d.get('destination'),
        'category': d.get('category'),
        'notificationStatus': d.get('notificationStatus'),
        'internalStatus': d.get('internalStatus'),
        'assignedTo': d.get('assignedTo'),
        'assignedToName': d.get('assignedToName'),
        'attention': d.get('attention'),
    } for d in data['items']]
    return data


@router.get('/quotes/export.csv')
async def export_quotes_csv(
    user: dict = OpsRead,
    db=Depends(get_db),
    status: Optional[str] = None,
    assignee: Optional[str] = None,
    unassigned: bool = False,
):
    q = list_filter_query(status=status, assignee=assignee, unassigned=unassigned)
    rows = []
    async for d in db.quote_submissions.find(q, {'_id': 0}).sort('createdAt', -1).limit(2000):
        e = enrich_ops_record('quote', d)
        rows.append([
            e.get('id'), e.get('createdAt'), e.get('reference'), e.get('name'), e.get('company'),
            e.get('email'), e.get('product'), e.get('requirementType'), e.get('destination'),
            e.get('category'), e.get('internalStatus'), e.get('assignedToName') or '',
            e.get('notificationStatus'),
        ])
    return _csv_response(
        'quotes.csv',
        rows,
        ['id', 'createdAt', 'reference', 'name', 'company', 'email', 'product', 'requirementType',
         'destination', 'category', 'status', 'assignee', 'notificationStatus'],
    )


@router.post('/quotes/bulk')
async def bulk_quotes(body: BulkBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _bulk(db, request, user, 'quote', body)


@router.get('/quotes/{quote_id}')
async def get_quote(quote_id: str, user: dict = OpsRead, db=Depends(get_db)):
    d = await _load_record(db, 'quote', quote_id)
    d['activity'] = await list_activity(db, 'quote', quote_id)
    d['notes'] = await list_notes(db, 'quote', quote_id)
    d['messages'] = [
        x async for x in db.ops_messages.find(
            {'recordType': 'quote', 'recordId': quote_id}, {'_id': 0, 'body': 0}
        ).sort('sentAt', -1).limit(50)
    ]
    return d


@router.patch('/quotes/{quote_id}')
async def patch_quote(quote_id: str, body: StatusBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _patch_status(db, request, user, 'quote', quote_id, body)


@router.post('/quotes/{quote_id}/assign')
async def assign_quote(quote_id: str, body: AssignBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _assign(db, request, user, 'quote', quote_id, body)


@router.post('/quotes/{quote_id}/notes')
async def note_quote(quote_id: str, body: NoteBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _post_note(db, request, user, 'quote', quote_id, body)


@router.post('/quotes/{quote_id}/reply')
async def reply_quote(quote_id: str, body: ReplyBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _reply(db, request, user, 'quote', quote_id, body)


# ---- Career applications ----

@router.get('/careers')
async def list_careers(
    user: dict = OpsRead,
    db=Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=config.MAX_PAGE_SIZE),
    status: Optional[str] = None,
    search: Optional[str] = None,
    assignee: Optional[str] = None,
    unassigned: bool = False,
    needsAttention: bool = False,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    jobId: Optional[str] = None,
    team: Optional[str] = None,
    stage: Optional[str] = None,
):
    extra: dict[str, Any] = {}
    if jobId:
        extra['jobId'] = jobId
    if team:
        from cms.request_utils import escape_regex
        extra['jobTeam'] = {'$regex': escape_regex(team, max_len=80), '$options': 'i'}
    # stage aliases status for careers UX
    status_q = stage or status
    data = await _list_records(
        db, 'career_application', page=page, limit=limit, status=status_q, search=search,
        assignee=assignee, unassigned=unassigned, needs_attention=needsAttention,
        date_from=dateFrom, date_to=dateTo, extra_q=extra or None,
        search_fields=['name', 'email', 'roleInterest', 'subject', 'jobTitle'],
    )
    return data


@router.get('/careers/export.csv')
async def export_careers_csv(
    user: dict = OpsRead,
    db=Depends(get_db),
    status: Optional[str] = None,
    assignee: Optional[str] = None,
    unassigned: bool = False,
):
    q = list_filter_query(status=status, assignee=assignee, unassigned=unassigned)
    rows = []
    async for d in db.career_submissions.find(q, {'_id': 0}).sort('createdAt', -1).limit(2000):
        e = enrich_ops_record('career_application', d)
        rows.append([
            e.get('id'), e.get('createdAt'), e.get('name'), e.get('email'), e.get('phone'),
            e.get('jobId') or '', e.get('jobTitle') or e.get('roleInterest'), e.get('jobSlug') or '',
            e.get('locationPreference'), e.get('linkedinOrCv'), e.get('internalStatus'),
            e.get('assignedToName') or '', e.get('notificationStatus'),
        ])
    return _csv_response(
        'career_applications.csv',
        rows,
        ['id', 'createdAt', 'name', 'email', 'phone', 'jobId', 'jobTitle', 'jobSlug',
         'locationPreference', 'linkedinOrCv', 'status', 'assignee', 'notificationStatus'],
    )


@router.post('/careers/bulk')
async def bulk_careers(body: BulkBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _bulk(db, request, user, 'career_application', body)


@router.get('/careers/{career_id}')
async def get_career(career_id: str, user: dict = OpsRead, db=Depends(get_db)):
    d = await _load_record(db, 'career_application', career_id)
    d['activity'] = await list_activity(db, 'career_application', career_id)
    d['notes'] = await list_notes(db, 'career_application', career_id)
    d['messages'] = [
        x async for x in db.ops_messages.find(
            {'recordType': 'career_application', 'recordId': career_id}, {'_id': 0, 'body': 0}
        ).sort('sentAt', -1).limit(50)
    ]
    return d


@router.patch('/careers/{career_id}')
async def patch_career(career_id: str, body: StatusBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _patch_status(db, request, user, 'career_application', career_id, body)


@router.post('/careers/{career_id}/assign')
async def assign_career(career_id: str, body: AssignBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _assign(db, request, user, 'career_application', career_id, body)


@router.post('/careers/{career_id}/notes')
async def note_career(career_id: str, body: NoteBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _post_note(db, request, user, 'career_application', career_id, body)


@router.post('/careers/{career_id}/reply')
async def reply_career(career_id: str, body: ReplyBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    return await _reply(db, request, user, 'career_application', career_id, body)


# ---- Jobs ----

@router.get('/jobs')
async def list_jobs(
    user: dict = OpsRead,
    db=Depends(get_db),
    status: Optional[str] = None,
):
    q: dict[str, Any] = {}
    if status:
        q['status'] = status
    items = []
    async for d in db.job_postings.find(q, {'_id': 0}).sort('updatedAt', -1).limit(200):
        items.append(serialize_job(d))
    return {'items': items, 'total': len(items)}


@router.post('/jobs')
async def create_job(body: JobBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    now = iso_now()
    slug = (body.slug or '').strip().lower() or _slugify_job(body.title)
    if await db.job_postings.find_one({'slug': slug}):
        raise HTTPException(status_code=409, detail='A job with this slug already exists')
    status = body.status if body.status in JOB_STATUSES else 'draft'
    extra = _job_fields_from_body(body)
    doc = {
        'id': str(uuid.uuid4()),
        'slug': slug,
        'title': body.title.strip(),
        'team': (body.team or '').strip(),
        'location': (body.location or '').strip(),
        'type': (body.type or 'Full-time').strip(),
        'blurb': (body.blurb or '').strip(),
        'responsibilities': [str(x).strip() for x in (body.responsibilities or []) if str(x).strip()][:40],
        'requirements': [str(x).strip() for x in (body.requirements or []) if str(x).strip()][:40],
        'status': status,
        'postedAt': body.postedAt or (now[:10] if status == 'published' else None),
        'createdAt': now,
        'updatedAt': now,
        'createdBy': user['id'],
        'updatedBy': user['id'],
        **extra,
    }
    await db.job_postings.insert_one(doc)
    await write_audit(
        db,
        action='JOB_CREATED',
        admin_user_id=user['id'],
        resource_type='job_posting',
        resource_id=doc['id'],
        result='ok',
        meta={'slug': slug, 'status': status},
        ip=_client_ip(request),
    )
    return serialize_job(doc)


@router.post('/jobs/seed-defaults')
async def seed_default_jobs(request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    """One-time import helper — not ongoing sync. DB remains source of truth after CMS adoption."""
    defaults = [
        {
            'slug': 'trade-coordinator-delhi',
            'title': 'Trade Coordinator',
            'team': 'Operations',
            'location': 'New Delhi',
            'type': 'Full-time',
            'blurb': (
                'Coordinate documentation, supplier communication and shipment milestones '
                'for active Asia-origin trade lanes.'
            ),
            'responsibilities': [
                'Track order milestones from confirmation through document handoff.',
                'Liaise with suppliers, freight partners and the commercial team on timing.',
                'Prepare and check commercial document packs against the agreed brief.',
                'Flag delays early with clear next steps - not noise.',
            ],
            'requirements': [
                '1-3 years in trade ops, logistics coordination or export documentation.',
                'Comfortable with email-led supplier follow-up and spreadsheet tracking.',
                'Clear written English; Hindi helpful for Delhi operations.',
            ],
            'status': 'published',
            'postedAt': '2026-09-01',
        },
        {
            'slug': 'sourcing-associate',
            'title': 'Sourcing Associate',
            'team': 'Sourcing',
            'location': 'New Delhi / Hybrid',
            'type': 'Full-time',
            'blurb': (
                'Support requirement intake, origin mapping and supplier evaluation for '
                'healthcare, agri, minerals and related categories.'
            ),
            'responsibilities': [
                'Capture buyer specs into clear sourcing briefs.',
                'Map requirements to origin options and shortlist suppliers.',
                'Coordinate samples, assays and technical data where available.',
                'Keep commercial notes tidy for quote and follow-up.',
            ],
            'requirements': [
                'Interest in international trade, commodities or industrial sourcing.',
                'Strong organisation and follow-through; detail over theatre.',
                'Willingness to learn Incoterms, category basics and documentation flow.',
            ],
            'status': 'published',
            'postedAt': '2026-09-01',
        },
    ]
    created = 0
    skipped = 0
    now = iso_now()
    for item in defaults:
        if await db.job_postings.find_one({'slug': item['slug']}):
            skipped += 1
            continue
        doc = {
            'id': str(uuid.uuid4()),
            **item,
            'experienceLevel': '',
            'descriptionMarkdown': '',
            'salaryMin': None,
            'salaryMax': None,
            'salaryCurrency': '',
            'salaryPeriod': '',
            'applicationDeadline': None,
            'coverImage': {'url': '', 'alt': ''},
            'createdAt': now,
            'updatedAt': now,
            'createdBy': user['id'],
            'updatedBy': user['id'],
        }
        await db.job_postings.insert_one(doc)
        created += 1
    await write_audit(
        db,
        action='JOBS_SEEDED',
        admin_user_id=user['id'],
        resource_type='job_posting',
        result='ok',
        meta={'created': created, 'skipped': skipped},
        ip=_client_ip(request),
    )
    return {'ok': True, 'created': created, 'skipped': skipped, 'note': 'One-time import helper; not ongoing sync.'}


@router.get('/jobs/{job_id}')
async def get_job(job_id: str, user: dict = OpsRead, db=Depends(get_db)):
    d = await db.job_postings.find_one({'id': job_id}, {'_id': 0})
    if not d:
        raise HTTPException(status_code=404, detail='Not found')
    return serialize_job(d)


@router.patch('/jobs/{job_id}')
async def patch_job(job_id: str, body: JobBody, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    existing = await db.job_postings.find_one({'id': job_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail='Not found')
    slug = (body.slug or existing.get('slug') or '').strip().lower() or _slugify_job(body.title)
    clash = await db.job_postings.find_one({'slug': slug})
    if clash and clash.get('id') != job_id:
        raise HTTPException(status_code=409, detail='A job with this slug already exists')
    status = body.status if body.status in JOB_STATUSES else existing.get('status') or 'draft'
    extra = _job_fields_from_body(body, existing=existing)
    update = {
        'slug': slug,
        'title': body.title.strip(),
        'team': (body.team or '').strip(),
        'location': (body.location or '').strip(),
        'type': (body.type or 'Full-time').strip(),
        'blurb': (body.blurb or '').strip(),
        'responsibilities': [str(x).strip() for x in (body.responsibilities or []) if str(x).strip()][:40],
        'requirements': [str(x).strip() for x in (body.requirements or []) if str(x).strip()][:40],
        'status': status,
        'updatedAt': iso_now(),
        'updatedBy': user['id'],
        **extra,
    }
    if body.postedAt is not None:
        update['postedAt'] = body.postedAt or None
    elif status == 'published' and not existing.get('postedAt'):
        update['postedAt'] = iso_now()[:10]
    await db.job_postings.update_one({'id': job_id}, {'$set': update})
    await write_audit(
        db,
        action='JOB_UPDATED',
        admin_user_id=user['id'],
        resource_type='job_posting',
        resource_id=job_id,
        result='ok',
        meta={'slug': slug, 'status': status},
        ip=_client_ip(request),
    )
    fresh = await db.job_postings.find_one({'id': job_id}, {'_id': 0})
    return serialize_job(fresh or {**existing, **update})


@router.post('/jobs/{job_id}/publish')
async def publish_job(job_id: str, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    existing = await db.job_postings.find_one({'id': job_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail='Not found')
    update = {
        'status': 'published',
        'postedAt': existing.get('postedAt') or iso_now()[:10],
        'updatedAt': iso_now(),
        'updatedBy': user['id'],
    }
    await db.job_postings.update_one({'id': job_id}, {'$set': update})
    await write_audit(
        db, action='JOB_PUBLISHED', admin_user_id=user['id'],
        resource_type='job_posting', resource_id=job_id, result='ok', ip=_client_ip(request),
    )
    return {'ok': True}


@router.post('/jobs/{job_id}/unpublish')
async def unpublish_job(job_id: str, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    res = await db.job_postings.update_one(
        {'id': job_id},
        {'$set': {'status': 'draft', 'updatedAt': iso_now(), 'updatedBy': user['id']}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    await write_audit(
        db, action='JOB_UNPUBLISHED', admin_user_id=user['id'],
        resource_type='job_posting', resource_id=job_id, result='ok', ip=_client_ip(request),
    )
    return {'ok': True}


@router.delete('/jobs/{job_id}')
async def delete_job(job_id: str, request: Request, user: dict = OpsWrite, db=Depends(get_db)):
    existing = await db.job_postings.find_one({'id': job_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail='Not found')
    if existing.get('status') == 'published':
        raise HTTPException(status_code=400, detail='Unpublish or archive before deleting a published job')
    res = await db.job_postings.delete_one({'id': job_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    await write_audit(
        db, action='JOB_DELETED', admin_user_id=user['id'],
        resource_type='job_posting', resource_id=job_id, result='ok', ip=_client_ip(request),
    )
    return {'ok': True}
