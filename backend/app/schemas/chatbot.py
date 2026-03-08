from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID


class ChatMessage(BaseModel):
    message: str
    language: str = "en"
    session_id: Optional[str] = None   # For conversation context
    patient_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
    session_id: Optional[str] = None
