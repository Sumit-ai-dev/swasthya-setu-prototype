import logging
from sqlalchemy import text
from app.db.database import engine, Base
from app.db.models import MedicalDocumentChunk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Initializing database...")
    try:
        # Create pgvector extension first
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
            logger.info("pgvector extension ensured.")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
