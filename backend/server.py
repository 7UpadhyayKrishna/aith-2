from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    email: str
    company: Optional[str] = ""
    message: str
    intent: Optional[str] = "general"
    website: Optional[str] = ""  # honeypot
    kind: Optional[str] = "contact"
    submittedAt: Optional[str] = None


class QuoteSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")

    refCode: Optional[str] = None
    product: str
    category: Optional[str] = ""
    quantity: str
    unit: Optional[str] = ""
    destination: str
    origin: Optional[str] = ""
    timeline: Optional[str] = ""
    mode: Optional[str] = ""
    incoterm: Optional[str] = ""
    company: str
    country: Optional[str] = ""
    role: Optional[str] = ""
    name: str
    email: str
    phone: Optional[str] = ""
    notes: Optional[str] = ""
    website: Optional[str] = ""  # honeypot
    kind: Optional[str] = "quote"
    submittedAt: Optional[str] = None


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/contact")
async def submit_contact(payload: ContactSubmission):
    """Store contact enquiries. Reject honeypot fills. Rate limiting recommended at reverse proxy."""
    if payload.website:
        return {"ok": True, "id": "filtered"}
    if not payload.name.strip() or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Name and message are required")
    doc_id = str(uuid.uuid4())
    doc = payload.model_dump()
    doc["id"] = doc_id
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    await db.contact_submissions.insert_one(doc)
    return {"ok": True, "id": doc_id}


@api_router.post("/quote")
async def submit_quote(payload: QuoteSubmission):
    """Store quote requests. Reject honeypot fills. Add email/CRM forwarding in ops layer."""
    if payload.website:
        return {"ok": True, "id": "filtered", "reference": payload.refCode}
    if not payload.product.strip() or not payload.quantity.strip() or not payload.destination.strip():
        raise HTTPException(status_code=400, detail="Product, quantity and destination are required")
    if not payload.company.strip() or not payload.name.strip():
        raise HTTPException(status_code=400, detail="Company and contact name are required")
    doc_id = str(uuid.uuid4())
    reference = payload.refCode or f"AITH-{doc_id[:6].upper()}"
    doc = payload.model_dump()
    doc["id"] = doc_id
    doc["reference"] = reference
    doc["createdAt"] = datetime.now(timezone.utc).isoformat()
    await db.quote_submissions.insert_one(doc)
    return {"ok": True, "id": doc_id, "reference": reference}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
