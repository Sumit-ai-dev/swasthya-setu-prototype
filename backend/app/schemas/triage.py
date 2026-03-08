from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class TriageRequest(BaseModel):
    symptoms: List[str]
    language: str = "en"  # "en" or "hi"
    age: Optional[int] = None
    gender: Optional[str] = None
    patient_id: Optional[UUID] = None


class TriageResponse(BaseModel):
    triage_level: str          # GREEN, YELLOW, RED
    confidence: float          # 0.0 - 1.0
    advice: str
    language: str
    consultation_id: Optional[str] = None
