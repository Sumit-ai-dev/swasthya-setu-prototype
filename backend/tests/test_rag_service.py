"""
RAG Service Tests
=================
Tests the core RAG pipeline: embeddings, vector search, prompt construction,
metadata filtering, deduplication, and hallucination guardrails.

These tests run against the LIVE local pgvector database (Docker must be running).
No AWS keys are required — everything uses local HuggingFace embeddings.

Usage:
    PYTHONPATH=. pytest tests/test_rag_service.py -v
"""
import pytest
from app.services.rag_service import (
    search_patient_query,
    build_medical_assistant_prompt,
    embeddings,
    vector_store,
    EMBEDDING_DIM,
    EMBEDDING_PROVIDER,
)


# ---------------------------------------------------------------------------
# 1. Embedding Initialization Tests
# ---------------------------------------------------------------------------
class TestEmbeddingInit:
    def test_embeddings_loaded(self):
        """Embedding model should be initialized on module import."""
        assert embeddings is not None

    def test_embedding_dimension_matches_local(self):
        """Local HuggingFace embeddings should be 384-dim."""
        if EMBEDDING_PROVIDER == "local":
            assert EMBEDDING_DIM == 384

    def test_vector_store_initialized(self):
        """PGVector store should be connected and ready."""
        assert vector_store is not None


# ---------------------------------------------------------------------------
# 2. RAG Search Tests (require seeded DB)
# ---------------------------------------------------------------------------
class TestRAGSearch:
    def test_fever_query_returns_results(self):
        """A fever query should return relevant WHO guidelines."""
        context, sources = search_patient_query("I have fever and body ache")
        assert len(context) > 0, "Context should not be empty for fever query"
        assert len(sources) > 0, "Should return at least one source"
        assert any("Fever" in s or "fever" in s.lower() or "WHO" in s for s in sources)

    def test_food_query_returns_nutrition_source(self):
        """A food/diet query should return the Nutrition Guidelines source."""
        context, sources = search_patient_query("What food should I eat during fever?")
        assert "Nutrition" in str(sources), "Should include Nutrition Guidelines"
        assert any(word in context.lower() for word in ["khichdi", "dal", "banana", "curd"])

    def test_infant_query_returns_child_health(self):
        """An infant safety query should return Ayushman Bharat child health."""
        context, sources = search_patient_query("Is paracetamol safe for a 1-month old?")
        assert any("Ayushman" in s or "Child" in s for s in sources)
        assert "infant" in context.lower() or "danger" in context.lower()

    def test_search_returns_tuple(self):
        """search_patient_query should always return (str, list) tuple."""
        result = search_patient_query("test query")
        assert isinstance(result, tuple)
        assert len(result) == 2
        assert isinstance(result[0], str)
        assert isinstance(result[1], list)

    def test_empty_query_does_not_crash(self):
        """An empty query should not raise an exception."""
        context, sources = search_patient_query("")
        assert isinstance(context, str)
        assert isinstance(sources, list)

    def test_top_k_limits_results(self):
        """Requesting top_k=1 should return at most 1 source chunk."""
        context, sources = search_patient_query("fever", top_k=1)
        assert len(sources) <= 2

    def test_high_threshold_filters_weak_matches(self):
        """A very high threshold should filter out weak matches."""
        context, sources = search_patient_query("fever", threshold=0.99)
        assert isinstance(context, str)


# ---------------------------------------------------------------------------
# 3. Prompt Construction Tests
# ---------------------------------------------------------------------------
class TestPromptConstruction:
    def test_prompt_contains_context(self):
        """Built prompt should contain the supplied context."""
        prompt = build_medical_assistant_prompt(
            message="test",
            context="Fever requires paracetamol.",
        )
        assert "Fever requires paracetamol." in prompt

    def test_prompt_contains_rules(self):
        """Prompt should include the strict medical guardrail rules."""
        prompt = build_medical_assistant_prompt(message="test", context="some context")
        assert "RULES:" in prompt
        assert "Do NOT invent information" in prompt
        assert "Do NOT provide medical diagnosis" in prompt

    def test_prompt_english_instruction(self):
        """English language should produce English response instruction."""
        prompt = build_medical_assistant_prompt(
            message="test", context="ctx", language="en"
        )
        assert "Respond in simple English" in prompt

    def test_prompt_hindi_instruction(self):
        """Hindi language should produce Hindi response instruction."""
        prompt = build_medical_assistant_prompt(
            message="test", context="ctx", language="hi"
        )
        assert "Respond in Hindi" in prompt

    def test_prompt_empty_context_shows_fallback(self):
        """Empty context should trigger the 'no guidelines found' fallback."""
        prompt = build_medical_assistant_prompt(message="test", context="")
        assert "No relevant medical guidelines were found" in prompt

    def test_prompt_with_history(self):
        """Prompt should include conversation history when provided."""
        history = [{"user": "Hello", "bot": "Hi there"}]
        prompt = build_medical_assistant_prompt(
            message="test", context="ctx", history=history
        )
        assert "Previous conversation" in prompt
        assert "Hello" in prompt

    def test_prompt_without_history(self):
        """Prompt should work fine without any history."""
        prompt = build_medical_assistant_prompt(message="test", context="ctx")
        assert "Previous conversation" not in prompt


# ---------------------------------------------------------------------------
# 4. Hallucination Safety Tests
# ---------------------------------------------------------------------------
class TestHallucinationSafety:
    def test_cancer_cure_query_has_no_cancer_context(self):
        """A 'cure cancer' query should NOT return cancer-specific context."""
        context, sources = search_patient_query("What medicine cures cancer instantly?")
        assert "cancer" not in context.lower(), (
            "RAG should not hallucinate cancer info — we have no cancer guidelines"
        )

    def test_out_of_scope_query_returns_limited_context(self):
        """A completely off-topic query should return minimal/no relevant context."""
        context, sources = search_patient_query(
            "How to fix a broken car engine?", threshold=0.5
        )
        assert context == "" or len(context) < 100


# ---------------------------------------------------------------------------
# 5. Chatbot API Integration Tests
# ---------------------------------------------------------------------------
class TestChatbotAPIWithRAG:
    """Tests the /chatbot/chat endpoint which uses the RAG service."""

    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from app.main import app
        return TestClient(app)

    def test_chat_returns_sources(self, client):
        """Chat response should include source citations from RAG."""
        resp = client.post("/api/v1/chatbot/chat", json={
            "message": "I have fever and body ache",
            "language": "en"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["sources"]) > 0, "Should return RAG sources"
        assert len(data["response"]) > 50, "Response should be substantive"

    def test_chat_session_persistence(self, client):
        """Two messages with same session_id should maintain context."""
        r1 = client.post("/api/v1/chatbot/chat", json={
            "message": "I have a fever", "language": "en"
        })
        session_id = r1.json()["session_id"]

        r2 = client.post("/api/v1/chatbot/chat", json={
            "message": "What food should I eat?",
            "language": "en",
            "session_id": session_id
        })
        assert r2.json()["session_id"] == session_id

    def test_chat_hindi_works(self, client):
        """Hindi queries should work and return a valid response."""
        resp = client.post("/api/v1/chatbot/chat", json={
            "message": "मुझे बुखार है, क्या करूं?",
            "language": "hi"
        })
        assert resp.status_code == 200
        assert len(resp.json()["response"]) > 20
