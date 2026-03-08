"""
Chatbot API Endpoint
====================
RAG-based health chatbot that retrieves relevant medical guidelines
from pgvector and generates responses via OpenAI (production)
or returns context-based answers (fallback).
"""
import uuid
import logging

from openai import OpenAI
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.chatbot import ChatMessage, ChatResponse
from app.core.config import settings
from app.db.database import get_db
from app.db.models import Consultation

logger = logging.getLogger(__name__)

router = APIRouter()

# Simple in-memory session store (replace with Redis/DynamoDB in production)
_sessions: dict = {}


@router.post("/chat", response_model=ChatResponse)
def health_chatbot(payload: ChatMessage, db: Session = Depends(get_db)):
    """
    RAG-based health chatbot endpoint.

    Pipeline:
      1. Embed user query → pgvector similarity search → retrieve top-K medical chunks
      2. Build strict guardrail prompt with retrieved context
      3. Send to OpenAI LLM for answer generation
      4. Fallback: return context directly if OpenAI is unavailable
    """
    session_id = payload.session_id or str(uuid.uuid4())
    history = _sessions.get(session_id, [])

    # Direct OpenAI System Prompt
    system_prompt = """You are Swasthya-Setu, a highly intelligent medical assistant for rural healthcare workers in India.
Your mission is to provide accurate, compassionate, and actionable clinical guidance.

RULES:
1. Provide helpful medical information based on global and Indian clinical standards (WHO, MOHFW).
2. If the query is an emergency (chest pain, breathing issues, severe bleeding), ALWAYS prioritize urgent hospital referral.
3. Use simple, clear language suitable for rural healthcare settings.
4. Do NOT provide a final clinical diagnosis.
5. Keep answers concise (3-5 sentences)."""

    messages = [{"role": "system", "content": system_prompt}]
    
    # Add history
    for h in history[-5:]:
        messages.append({"role": "user", "content": h["user"]})
        messages.append({"role": "assistant", "content": h["bot"]})
    
    messages.append({"role": "user", "content": payload.message})

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        completion = client.chat.completions.create(
            model=settings.CHATBOT_MODEL_ID,
            messages=messages,
            max_tokens=400,
            temperature=0.3,
        )
        response_text = completion.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        response_text = "I am having trouble connecting to my brain right now. Please try again or consult a senior medical officer if this is an emergency."

    # Save to session history
    history.append({"user": payload.message, "bot": response_text})
    _sessions[session_id] = history

    # Log to Database
    db_consultation = Consultation(
        patient_id=payload.patient_id,
        session_id=session_id,
        type="CHAT",
        query=payload.message,
        response=response_text,
        language=payload.language
    )
    db.add(db_consultation)
    db.commit()

    return ChatResponse(
        response=response_text,
        sources=["Native AI Knowledge (OpenAI)"],
        session_id=session_id,
    )
