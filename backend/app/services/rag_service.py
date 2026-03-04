"""
RAG Service for Swasthya-Setu
=============================
Handles embedding generation, vector similarity search, and prompt construction.

Embedding Strategy (following open-source patterns like danny-avila/rag_api):
  - LOCAL mode (default): Uses HuggingFace sentence-transformers — works offline, no API keys needed.
  - BEDROCK mode: Uses AWS Bedrock Titan embeddings — for production on AWS.

Set EMBEDDING_PROVIDER=bedrock in .env to switch to AWS Bedrock.
"""

import os
import logging
from typing import List, Tuple

from langchain_postgres import PGVector
from app.db.database import SQLALCHEMY_DATABASE_URL
from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Embedding Provider Selection
# ---------------------------------------------------------------------------
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "local").lower()
EMBEDDING_MODEL_LOCAL = os.getenv("EMBEDDING_MODEL_LOCAL", "all-MiniLM-L6-v2")
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 outputs 384-dim vectors

def _init_embeddings():
    """Initialize embedding model based on configured provider."""
    global EMBEDDING_DIM

    if EMBEDDING_PROVIDER == "bedrock":
        try:
            from langchain_aws import BedrockEmbeddings
            EMBEDDING_DIM = 1024  # Titan v2 dimension
            emb = BedrockEmbeddings(
                model_id="amazon.titan-embed-text-v2:0",
                region_name=settings.AWS_REGION,
                model_kwargs={"max_retries": 3} # Explicit retry logic
            )
            logger.info("Using AWS Bedrock Titan embeddings (dim=1024) with backoff retries.")
            return emb
        except Exception as e:
            logger.warning(f"Bedrock embeddings failed ({e}). Falling back to local embeddings.")

    # Default: local HuggingFace sentence-transformers
    from langchain_huggingface import HuggingFaceEmbeddings
    EMBEDDING_DIM = 384
    emb = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_LOCAL)
    logger.info(f"Using local HuggingFace embeddings: {EMBEDDING_MODEL_LOCAL} (dim={EMBEDDING_DIM}).")
    return emb


embeddings = _init_embeddings()

# ---------------------------------------------------------------------------
# PGVector Store
# ---------------------------------------------------------------------------
vector_store = PGVector(
    embeddings=embeddings,
    collection_name="swasthya_setu_knowledge_base",
    connection=SQLALCHEMY_DATABASE_URL,
    use_jsonb=True,
)


# ---------------------------------------------------------------------------
# Core RAG Functions
# ---------------------------------------------------------------------------
def search_patient_query(
    query: str,
    top_k: int = 4,
    threshold: float = 0.3,
    document_type: str = "guideline"
) -> Tuple[str, List[str]]:
    """
    Searches pgvector for the most relevant medical document chunks using hybrid filtering.

    Args:
        query: The user's health question.
        top_k: Number of nearest chunks to retrieve.
        threshold: Minimum similarity score (0-1).
        document_type: Metadata filter to ensure we only pull from approved guidelines.
    """
    if not embeddings:
        logger.warning("Embeddings not initialized. Returning empty context.")
        return "", []

    try:
        # Hybrid retrieval: Vector similarity + Keyword metadata filtering
        filter_dict = {"document_type": document_type} if document_type else None
        
        results = vector_store.similarity_search_with_score(
            query=query, 
            k=top_k,
            filter=filter_dict
        )

        relevant_chunks = []
        sources = set()

        for doc, distance in results:
            similarity = 1 - distance
            if similarity >= threshold:
                relevant_chunks.append(doc.page_content)
                source = doc.metadata.get("source", "Unknown")
                sources.add(source)

        if not relevant_chunks:
            return "", []

        combined_context = "\n\n---\n\n".join(relevant_chunks)
        return combined_context, sorted(sources)

    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        return "", []


def build_medical_assistant_prompt(
    message: str,
    language: str,
    context: str,
    history: list,
) -> str:
    """
    Constructs a strict system prompt that forces the LLM to use only
    the retrieved context (RAG guardrail).
    """
    lang_instruction = (
        "Respond in Hindi using simple language." if language == "hi"
        else "Respond in simple English."
    )

    history_text = ""
    if history:
        history_text = "\n".join(
            [f"User: {h['user']}\nAssistant: {h['bot']}" for h in history[-3:]]
        )
        history_text = f"\nPrevious conversation:\n{history_text}\n"

    if not context:
        context = "No relevant medical guidelines were found in the database."

    return f"""You are Swasthya-Setu, a medical assistant supporting rural healthcare workers in India.

RULES:
1. Use ONLY the information provided in the context.
2. If the answer is not present in the context, say EXACTLY:
   "I cannot find this information in the available medical guidelines. Please consult a doctor."
3. Do NOT provide medical diagnosis.
4. Do NOT invent information.
5. Always cite the source provided in the context.

Context:
{context}
{history_text}
Question: {message}

{lang_instruction}
Keep your answer clear, concise (2-4 sentences), and accurate."""
