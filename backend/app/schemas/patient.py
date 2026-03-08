from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

class ConsultationHistory(BaseModel):
    id: UUID
    type: str
    triage_level: Optional[str]
    query: str
    response: str
    created_at: datetime

    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    is_pregnant: bool = False

class PatientCreate(PatientBase):
    name: str
    age: int = Field(..., ge=18, description="Patient must be 18 years or older")
    gender: str = Field(..., pattern="^(Female|Male)$", description="Gender must be Male or Female")
    is_pregnant: bool = False

class Patient(PatientBase):
    id: UUID
    created_at: datetime
    is_pregnant: bool

    class Config:
        from_attributes = True

class PatientDetail(Patient):
    history: List[ConsultationHistory] = []

    class Config:
        from_attributes = True
