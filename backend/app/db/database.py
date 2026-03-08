from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Use connection pooling to handle Lambda scalability requirements later (RDS Proxy equivalent setup)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,          # Maintain 5 connections
    max_overflow=10,      # Allow up to 10 more if all 5 are busy
    pool_timeout=30,      # Wait up to 30 seconds for a connection
    pool_recycle=1800     # Recycle connections every 30 mins
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
