from fastapi import APIRouter
from app.api.api_v1.endpoints import triage, chatbot, analytics, patients

api_router = APIRouter()

api_router.include_router(triage.router, prefix="/triage", tags=["Triage"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(patients.router, prefix="/patients", tags=["Patients"])
