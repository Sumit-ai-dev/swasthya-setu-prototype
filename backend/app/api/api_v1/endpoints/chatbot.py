"""
Chatbot API Endpoint
====================
RAG-based health chatbot that retrieves relevant medical guidelines
from pgvector and generates responses via AWS Bedrock (production)
or returns context-based answers (local development).
"""
import uuid
import json
import logging

import boto3
from fastapi import APIRouter

from app.schemas.chatbot import ChatMessage, ChatResponse
from app.core.config import settings
from app.services.rag_service import search_patient_query, build_medical_assistant_prompt

logger = logging.getLogger(__name__)

router = APIRouter()

# Simple in-memory session store (replace with Redis/DynamoDB in production)
_sessions: dict = {}


@router.post("/chat", response_model=ChatResponse)
def health_chatbot(payload: ChatMessage):
    """
    RAG-based health chatbot endpoint.

    Pipeline:
      1. Embed user query → pgvector similarity search → retrieve top-K medical chunks
      2. Build strict guardrail prompt with retrieved context
      3. Send to Bedrock LLM (Claude/Llama) for answer generation
      4. Fallback: return context directly if Bedrock is unavailable (local dev)
    """
    session_id = payload.session_id or str(uuid.uuid4())
    history = _sessions.get(session_id, [])

    # Step 1 & 2: RAG retrieval + prompt construction
    context, sources = search_patient_query(payload.message)
    prompt = build_medical_assistant_prompt(
        message=payload.message,
        context=context,
        language=payload.language,
        history=history,
    )

    response_text = None

    # Step 3: Try Bedrock LLM
    try:
        # Use AWS_PROFILE session if configured (local dev), else default chain (Lambda)
        if settings.AWS_PROFILE:
            session = boto3.Session(profile_name=settings.AWS_PROFILE)
            client = session.client("bedrock-runtime", region_name=settings.AWS_REGION)
        else:
            client = boto3.client("bedrock-runtime", region_name=settings.AWS_REGION)
        body = json.dumps({
            "prompt": (
                f"<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n"
                f"{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
            ),
            "max_gen_len": 300,
            "temperature": 0.2,
        })
        resp = client.invoke_model(
            modelId=settings.CHATBOT_MODEL_ID,
            body=body,
            contentType="application/json",
            accept="application/json",
        )
        result = json.loads(resp["body"].read())
        response_text = result.get("generation", "").strip()

    except Exception as bedrock_err:
        logger.info(f"Bedrock unavailable ({type(bedrock_err).__name__}), using context fallback.")
        # Step 4: Local dev fallback — return retrieved context directly
        if context:
            response_text = (
                f"Based on available medical guidelines: {context} "
                "For trusted advice, always consult an ASHA worker or visit your nearest primary health centre."
            )
        else:
            response_text = (
                "I cannot find specific guidance in the available medical documents. "
                "Please consult a doctor or your nearest ASHA worker for personalized advice."
            )

    # Save to session history
    history.append({"user": payload.message, "bot": response_text})
    _sessions[session_id] = history

    return ChatResponse(
        response=response_text,
        sources=sources,
        session_id=session_id,
    )
