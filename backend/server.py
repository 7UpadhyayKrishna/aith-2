from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response as StarletteResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import time
import smtplib
import uuid as uuid_mod
from email.message import EmailMessage
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Tuple
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Fail fast on production misconfiguration before opening Mongo / admin
from cms import config as cms_config  # noqa: E402

_prod_errors = cms_config.validate_production_security()
if _prod_errors:
    for err in _prod_errors:
        logging.getLogger(__name__).error('PRODUCTION CONFIG ERROR: %s', err)
    raise SystemExit(
        'FATAL: Production security configuration invalid:\n- ' + '\n- '.join(_prod_errors)
    )

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="AITH API", docs_url=None, redoc_url=None)
api_router = APIRouter(prefix="/api")

# Simple in-memory rate limit: max N submissions per IP per window
# Limitation: per-process only - use reverse-proxy / Cloudflare limits in multi-instance deploys
_RATE: Dict[str, list] = {}
_RATE_WINDOW = 60  # seconds
_RATE_MAX = 8

logger = logging.getLogger(__name__)

SMTP_KEYS = (
    'OPS_NOTIFICATION_EMAIL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'SMTP_FROM',
    'SMTP_USE_TLS',
)


def _client_ip(request: Request) -> str:
    from cms.request_utils import client_ip

    return client_ip(request)


def _rate_limit(request: Request) -> None:
    ip = _client_ip(request)
    now = time.time()
    bucket = [t for t in _RATE.get(ip, []) if now - t < _RATE_WINDOW]
    if len(bucket) >= _RATE_MAX:
        raise HTTPException(status_code=429, detail='Too many submissions. Please try again shortly.')
    bucket.append(now)
    _RATE[ip] = bucket


def _smtp_present_keys() -> list:
    return [k for k in SMTP_KEYS if os.environ.get(k)]


def _smtp_configured() -> bool:
    """Minimum viable notification: ops inbox, host, and authenticated From."""
    return bool(
        os.environ.get('OPS_NOTIFICATION_EMAIL')
        and os.environ.get('SMTP_HOST')
        and os.environ.get('SMTP_FROM')
    )


def _smtp_startup_state() -> str:
    present = _smtp_present_keys()
    if not present:
        return 'disabled'
    if _smtp_configured():
        return 'enabled'
    return 'incomplete'


def _safe_text(value: Any, fallback: str = '-') -> str:
    if value is None:
        return fallback
    text = str(value).replace('\r\n', '\n').replace('\r', '\n')
    # Strip control chars except newline/tab - plain-text email body only
    return ''.join(ch for ch in text if ch == '\n' or ch == '\t' or (ord(ch) >= 32)) or fallback


def _header_safe(value: Any, max_len: int = 120) -> str:
    from cms.request_utils import header_safe

    return header_safe(None if value is None else str(value), max_len=max_len) or '-'


def _notify_ops(
    kind: str,
    subject: str,
    body: str,
    reply_to: Optional[str] = None,
    meta: Optional[Dict[str, Any]] = None,
) -> Tuple[str, Optional[str]]:
    """
    Optional ops email after Mongo persistence.
    Returns (notificationStatus, notificationError).
    Failures never reverse a successful store.
    """
    if not _smtp_configured():
        logger.info(
            'enquiry notify=disabled kind=%s id=%s stored=yes',
            kind,
            (meta or {}).get('id'),
        )
        return 'disabled', None

    to_addr = os.environ['OPS_NOTIFICATION_EMAIL']
    host = os.environ['SMTP_HOST']
    port = int(os.environ.get('SMTP_PORT', '587'))
    username = os.environ.get('SMTP_USERNAME', '')
    password = os.environ.get('SMTP_PASSWORD', '')
    from_addr = os.environ['SMTP_FROM']
    use_tls = os.environ.get('SMTP_USE_TLS', 'true').lower() not in ('0', 'false', 'no')

    from cms.request_utils import safe_reply_to

    msg = EmailMessage()
    msg['Subject'] = _header_safe(subject, max_len=180)
    msg['From'] = from_addr
    msg['To'] = to_addr
    clean_reply = safe_reply_to(reply_to)
    if clean_reply:
        msg['Reply-To'] = clean_reply
    msg.set_content(body)

    attempted_at = datetime.now(timezone.utc).isoformat()
    try:
        with smtplib.SMTP(host, port, timeout=20) as smtp:
            if use_tls:
                smtp.starttls()
            if username:
                smtp.login(username, password)
            smtp.send_message(msg)
        logger.info(
            'enquiry notify=sent kind=%s id=%s stored=yes attempted_at=%s',
            kind,
            (meta or {}).get('id'),
            attempted_at,
        )
        return 'sent', None
    except Exception as exc:
        # Do not log credentials or full env - message class name + brief str only
        err = f'{type(exc).__name__}: {exc}'[:240]
        logger.error(
            'enquiry notify=failed kind=%s id=%s stored=yes attempted_at=%s error=%s',
            kind,
            (meta or {}).get('id'),
            attempted_at,
            err,
        )
        return 'failed', err


async def _patch_notification(collection, doc_id: str, status: str, error: Optional[str]) -> None:
    update: Dict[str, Any] = {
        'notificationStatus': status,
        'notificationAttemptedAt': datetime.now(timezone.utc).isoformat(),
    }
    if error:
        update['notificationError'] = error
    try:
        await collection.update_one({'id': doc_id}, {'$set': update})
    except Exception:
        logger.exception('Failed to persist notificationStatus id=%s', doc_id)


def _format_contact_body(doc: dict) -> str:
    lines = [
        'New AITH enquiry',
        '',
        f"Submission ID: {_safe_text(doc.get('id'))}",
        f"Timestamp: {_safe_text(doc.get('createdAt'))}",
        f"Type: {_safe_text(doc.get('kind') or doc.get('intent') or 'contact')}",
        '',
        f"Name: {_safe_text(doc.get('name'))}",
        f"Company: {_safe_text(doc.get('company'))}",
        f"Email: {_safe_text(doc.get('email'))}",
        f"Phone: {_safe_text(doc.get('phone'))}",
        f"Country: {_safe_text(doc.get('country'))}",
        f"Enquiry type: {_safe_text(doc.get('intent') or doc.get('kind'))}",
        f"Subject: {_safe_text(doc.get('subject'))}",
        '',
        'Message:',
        _safe_text(doc.get('message'), ''),
    ]
    if doc.get('roleInterest'):
        lines.extend(['', f"Role interest: {_safe_text(doc.get('roleInterest'))}"])
    if doc.get('linkedinOrCv'):
        lines.append(f"LinkedIn/CV: {_safe_text(doc.get('linkedinOrCv'))}")
    return '\n'.join(lines)


def _format_quote_body(doc: dict) -> str:
    lines = [
        'New AITH quote request',
        '',
        f"Submission ID: {_safe_text(doc.get('id'))}",
        f"Reference: {_safe_text(doc.get('reference'))}",
        f"Timestamp: {_safe_text(doc.get('createdAt'))}",
        '',
        '- Contact -',
        f"Name: {_safe_text(doc.get('name'))}",
        f"Company: {_safe_text(doc.get('company'))}",
        f"Email: {_safe_text(doc.get('email'))}",
        f"Phone: {_safe_text(doc.get('phone'))}",
        f"Country: {_safe_text(doc.get('country'))}",
        f"Role: {_safe_text(doc.get('role'))}",
        '',
        '- Requirement -',
        f"Type: {_safe_text(doc.get('requirementType'))}",
        f"Product: {_safe_text(doc.get('product'))}",
        f"Category: {_safe_text(doc.get('category'))}",
        f"Quantity: {_safe_text(doc.get('quantity'))} {_safe_text(doc.get('unit'), '')}".strip(),
        f"Destination: {_safe_text(doc.get('destination'))}",
        f"Origin preference: {_safe_text(doc.get('origin'))}",
        f"Supplier known: {_safe_text(doc.get('supplierKnown'))}",
        f"Timeline: {_safe_text(doc.get('timeline'))}",
        '',
        '- Product / shipment -',
        f"Mode: {_safe_text(doc.get('mode'))}",
        f"Incoterm: {_safe_text(doc.get('incoterm'))}",
        f"Budget: {_safe_text(doc.get('budget'))}",
        f"Packaging: {_safe_text(doc.get('packaging'))}",
        f"OEM / private label: {_safe_text(doc.get('oem'))}",
        '',
        '- Commercial / quality -',
        f"Quality: {_safe_text(doc.get('qualityRequirements'))}",
        f"Certifications: {_safe_text(doc.get('certifications'))}",
        f"Inspection: {_safe_text(doc.get('inspection'))}",
        f"Documentation: {_safe_text(doc.get('documentation'))}",
        '',
        '- Specification -',
        _safe_text(doc.get('specification'), ''),
        '',
        '- Notes -',
        _safe_text(doc.get('notes'), ''),
    ]
    return '\n'.join(lines)


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(max_length=120)
    email: str = Field(max_length=200)
    company: Optional[str] = Field(default="", max_length=160)
    phone: Optional[str] = Field(default="", max_length=40)
    country: Optional[str] = Field(default="", max_length=80)
    subject: Optional[str] = Field(default="", max_length=160)
    message: str = Field(max_length=4000)
    intent: Optional[str] = "general"
    roleInterest: Optional[str] = Field(default="", max_length=160)
    locationPreference: Optional[str] = Field(default="", max_length=120)
    linkedinOrCv: Optional[str] = Field(default="", max_length=400)
    website: Optional[str] = ""  # honeypot
    kind: Optional[str] = "contact"
    submittedAt: Optional[str] = None


class QuoteSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")

    refCode: Optional[str] = None
    requirementType: Optional[str] = Field(default="", max_length=80)
    product: str = Field(max_length=300)
    category: Optional[str] = Field(default="", max_length=120)
    specification: Optional[str] = Field(default="", max_length=2000)
    quantity: str = Field(max_length=80)
    unit: Optional[str] = Field(default="", max_length=40)
    destination: str = Field(max_length=200)
    origin: Optional[str] = Field(default="", max_length=200)
    supplierKnown: Optional[str] = Field(default="", max_length=80)
    timeline: Optional[str] = Field(default="", max_length=120)
    mode: Optional[str] = Field(default="", max_length=80)
    incoterm: Optional[str] = Field(default="", max_length=40)
    budget: Optional[str] = Field(default="", max_length=200)
    packaging: Optional[str] = Field(default="", max_length=500)
    oem: Optional[str] = Field(default="", max_length=80)
    qualityRequirements: Optional[str] = Field(default="", max_length=2000)
    certifications: Optional[str] = Field(default="", max_length=2000)
    inspection: Optional[str] = Field(default="", max_length=1000)
    documentation: Optional[str] = Field(default="", max_length=1000)
    company: str = Field(max_length=160)
    country: Optional[str] = Field(default="", max_length=80)
    role: Optional[str] = Field(default="", max_length=80)
    name: str = Field(max_length=120)
    email: str = Field(max_length=200)
    phone: Optional[str] = Field(default="", max_length=40)
    notes: Optional[str] = Field(default="", max_length=2000)
    website: Optional[str] = ""  # honeypot
    kind: Optional[str] = "quote"
    submittedAt: Optional[str] = None


@api_router.get("/")
async def root():
    return {"message": "AITH API"}


@api_router.get("/health")
async def health(request: Request):
    """Liveness/readiness for deploy monitors. No secrets or connection strings."""
    db_ok = False
    try:
        await db.command('ping')
        db_ok = True
    except Exception:
        logger.warning(
            'health: database ping failed request_id=%s',
            getattr(request.state, 'request_id', None),
        )
    status = 'ok' if db_ok else 'degraded'
    return {
        'status': status,
        'database': db_ok,
        'notificationsConfigured': _smtp_startup_state() == 'enabled',
        'notifications': _smtp_startup_state(),
        'version': cms_config.APP_VERSION,
    }


# /api/status demo endpoints removed - use GET /api/health


@api_router.post("/contact")
async def submit_contact(payload: ContactSubmission, request: Request):
    """Store contact / careers enquiries. Optionally notify ops via SMTP after persist."""
    _rate_limit(request)
    request_id = getattr(request.state, 'request_id', None)
    if payload.website:
        return {"ok": True, "id": "filtered"}
    if not payload.name.strip() or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Name and message are required")
    if '@' not in payload.email:
        raise HTTPException(status_code=400, detail="Valid email is required")
    doc_id = str(uuid.uuid4())
    kind = 'careers' if payload.kind == 'careers' or payload.intent == 'careers' else 'contact'
    doc = payload.model_dump()
    doc['id'] = doc_id
    doc['createdAt'] = datetime.now(timezone.utc).isoformat()
    doc['notificationStatus'] = 'pending'
    doc['requestId'] = request_id
    doc['internalStatus'] = 'new'
    collection = db.career_submissions if kind == 'careers' else db.contact_submissions
    await collection.insert_one(doc)
    logger.info('enquiry stored=yes type=%s id=%s request_id=%s', kind, doc_id, request_id)

    status, error = _notify_ops(
        kind=kind,
        subject=f"New AITH enquiry - {kind} - {_header_safe(payload.name, 80)}",
        body=_format_contact_body(doc),
        reply_to=payload.email,
        meta={'id': doc_id, 'kind': kind, 'requestId': request_id},
    )
    await _patch_notification(collection, doc_id, status, error)

    # Mongo success is durable - always return success to the user
    return {'ok': True, 'id': doc_id, 'notificationStatus': status}


@api_router.post("/quote")
async def submit_quote(payload: QuoteSubmission, request: Request):
    """Store quote requests. Optionally notify ops via SMTP after persist."""
    _rate_limit(request)
    request_id = getattr(request.state, 'request_id', None)
    if payload.website:
        return {'ok': True, 'id': 'filtered', 'reference': payload.refCode}
    if not payload.product.strip() or not payload.quantity.strip() or not payload.destination.strip():
        raise HTTPException(status_code=400, detail='Product, quantity and destination are required')
    if not payload.company.strip() or not payload.name.strip():
        raise HTTPException(status_code=400, detail='Company and contact name are required')
    if '@' not in payload.email:
        raise HTTPException(status_code=400, detail='Valid email is required')
    doc_id = str(uuid.uuid4())
    reference = payload.refCode or f'AITH-{doc_id[:6].upper()}'
    doc = payload.model_dump()
    doc['id'] = doc_id
    doc['reference'] = reference
    doc['createdAt'] = datetime.now(timezone.utc).isoformat()
    doc['notificationStatus'] = 'pending'
    doc['requestId'] = request_id
    doc['internalStatus'] = 'new'
    await db.quote_submissions.insert_one(doc)
    logger.info(
        'enquiry stored=yes type=quote id=%s reference=%s request_id=%s',
        doc_id,
        reference,
        request_id,
    )

    status, error = _notify_ops(
        kind='quote',
        subject=f"New AITH quote request - {reference} - {_header_safe(payload.product, 60)}",
        body=_format_quote_body(doc),
        reply_to=payload.email,
        meta={'id': doc_id, 'reference': reference, 'requestId': request_id},
    )
    await _patch_notification(db.quote_submissions, doc_id, status, error)

    return {'ok': True, 'id': doc_id, 'reference': reference, 'notificationStatus': status}


app.include_router(api_router)

# Admin CMS + public blog routers (session cookie auth; never expose drafts publicly)
from cms.auth_router import router as admin_auth_router  # noqa: E402
from cms.blogs_admin_router import router as admin_blogs_router  # noqa: E402
from cms.blogs_public_router import router as blogs_public_router  # noqa: E402
from cms.ops_router import router as admin_ops_router  # noqa: E402

api_router_cms = APIRouter(prefix='/api')
api_router_cms.include_router(admin_auth_router)
api_router_cms.include_router(admin_blogs_router)
api_router_cms.include_router(admin_ops_router)
api_router_cms.include_router(blogs_public_router)
app.include_router(api_router_cms)

# Expose db on app.state for CMS deps
app.state.db = db

_cors_raw = os.environ.get('CORS_ORIGINS', '*').strip()
_cors_origins = [o.strip() for o in _cors_raw.split(',') if o.strip()]
if '*' in _cors_origins and len(_cors_origins) > 1:
    _cors_origins = [o for o in _cors_origins if o != '*']
# Credentials + wildcard is invalid in browsers; drop credentials when origins are open
_allow_credentials = '*' not in _cors_origins


class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        incoming = (request.headers.get('x-request-id') or '').strip()
        request_id = incoming[:64] if incoming else str(uuid_mod.uuid4())
        request.state.request_id = request_id
        started = time.time()
        response = await call_next(request)
        response.headers['X-Request-ID'] = request_id
        duration_ms = int((time.time() - started) * 1000)
        if request.url.path.startswith('/api/'):
            logger.info(
                'request_id=%s method=%s path=%s status=%s duration_ms=%s',
                request_id,
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
            )
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Baseline API headers. Frontend CSP should be set at the CDN/host when validated."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault('X-Content-Type-Options', 'nosniff')
        response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.setdefault('X-Frame-Options', 'DENY')
        response.headers.setdefault(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=()',
        )
        # Conservative CSP for API JSON responses only - do not break marketing site assets
        if request.url.path.startswith('/api/'):
            response.headers.setdefault('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=_allow_credentials,
    allow_origins=_cors_origins,
    allow_methods=['*'],
    allow_headers=['*'],
    expose_headers=['X-Request-ID'],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)


async def _ensure_cms_indexes() -> None:
    """Create required indexes (idempotent)."""
    try:
        await db.admin_users.create_index('email', unique=True)
        await db.admin_users.create_index('id', unique=True)
        await db.admin_sessions.create_index('sessionHash', unique=True)
        await db.admin_sessions.create_index('userId')
        # TTL: Mongo removes session docs after expiresAt (ISO date stored as datetime preferred)
        # Sessions store ISO strings - convert-friendly expireAfterSeconds on a datetime field.
        # We also store expiresAtDate as BSON date for TTL when creating sessions.
        await db.admin_sessions.create_index('expiresAtDate', expireAfterSeconds=0)
        await db.blogs.create_index('slug', unique=True)
        await db.blogs.create_index('id', unique=True)
        await db.blogs.create_index([('status', 1), ('publishedAt', -1)])
        await db.blogs.create_index('updatedAt')
        await db.blog_revisions.create_index([('blogId', 1), ('timestamp', -1)])
        await db.blog_redirects.create_index('fromSlug', unique=True)
        await db.admin_audit_logs.create_index([('timestamp', -1)])
        await db.admin_audit_logs.create_index('adminUserId')
        await db.admin_audit_logs.create_index('action')
        await db.contact_submissions.create_index('createdAt')
        await db.contact_submissions.create_index('internalStatus')
        await db.quote_submissions.create_index('createdAt')
        await db.quote_submissions.create_index('internalStatus')
        await db.career_submissions.create_index('createdAt')
        logger.info('CMS indexes ensured')
    except Exception:
        logger.exception('Failed to ensure CMS indexes')


@app.on_event('startup')
async def startup_checks():
    app.state.db = db
    await _ensure_cms_indexes()
    if cms_config.is_production():
        logger.info('APP_ENV=production - strict security validation applied at import')
    elif not os.environ.get('ADMIN_SESSION_SECRET'):
        logger.warning(
            'ADMIN_SESSION_SECRET is not set - using ephemeral secret (sessions reset on restart). '
            'Set a 32+ char secret before production.'
        )
    if not cms_config.COOKIE_SECURE and not cms_config.is_production():
        logger.info('ADMIN_COOKIE_SECURE=false (dev). Must be true behind HTTPS in production.')
    state = _smtp_startup_state()
    if state == 'disabled':
        logger.info('SMTP notifications: disabled (no SMTP env set) - Mongo-only mode')
    elif state == 'incomplete':
        present = _smtp_present_keys()
        logger.warning(
            'SMTP notifications: INCOMPLETE config (present=%s). '
            'Need OPS_NOTIFICATION_EMAIL, SMTP_HOST, SMTP_FROM at minimum. Running notify-disabled.',
            ','.join(present),
        )
    else:
        logger.info('SMTP notifications: enabled → %s', os.environ.get('OPS_NOTIFICATION_EMAIL'))
    if '*' in _cors_origins:
        logger.warning(
            'CORS_ORIGINS is wildcard (*). Set explicit production origins (e.g. https://aithinternational.com).'
        )
    if cms_config.MFA_ENABLED:
        logger.info('Admin MFA (TOTP) feature flag ENABLED')
    else:
        logger.info('Admin MFA (TOTP) feature flag disabled - set ADMIN_MFA_ENABLED=true to activate')


@app.on_event('shutdown')
async def shutdown_db_client():
    client.close()
