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
from sqlalchemy import Column, String, DateTime, Text
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
    embedding = Column(Vector(384))
    source = Column(String(255), nullable=False, index=True)
    document_type = Column(String(100), nullable=True, default="guideline")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<MedicalDocumentChunk id={self.id} source={self.source}>"
