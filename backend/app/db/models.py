"""
Database models for Swasthya-Setu.

Note: The MedicalDocumentChunk model below is a reference/documentation model.
Langchain's PGVector manages its own tables (langchain_pg_collection, langchain_pg_embedding)
for the actual vector store operations. This model is kept for:
  - Direct SQL queries if needed
  - Future migrations
  - Schema documentation
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from app.db.database import Base


class MedicalDocumentChunk(Base):
    """Reference model — actual embeddings are managed by Langchain PGVector."""
    __tablename__ = "medical_document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    content = Column(Text, nullable=False)
    # Dimension depends on the embedding provider:
    #   - local (all-MiniLM-L6-v2): 384
    #   - bedrock (titan-embed-text-v2): 1024
    # This column is for reference only; Langchain PGVector handles its own embedding column.
    embedding = Column(Vector(384)) # Needs to match all-MiniLM-L6-v2 dimension

    # Metadata fields mapping to LangChain's JSONB structure underneath
    source = Column(String)
    document_type = Column(String)
    section = Column(String)
    chunk_index = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Note on Indexes:
    # In production pgvector, an HNSW or IVFFlat index is critical for performance.
    # Example for HNSW: CREATE INDEX idx_medical_embedding ON langchain_pg_embedding USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
    # Langchain Postgres vectorstore auto-manages this table and index via `create_hnsw_index`.

    def __repr__(self):
        return f"<MedicalDocumentChunk id={self.id} source={self.source}>"


class Consultation(Base):
    """Stores every triage and chatbot interaction for analytics."""
    __tablename__ = "consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(String, index=True)
    type = Column(String) # "TRIAGE" or "CHAT"
    triage_level = Column(String, nullable=True) # GREEN, YELLOW, RED (only for triage)
    query = Column(Text)
    response = Column(Text)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Consultation id={self.id} type={self.type} level={self.triage_level}>"
