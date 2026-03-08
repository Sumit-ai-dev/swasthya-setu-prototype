from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    # App
    APP_NAME: str = "Swasthya-Setu API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # OpenAI Configuration
    OPENAI_API_KEY: str = ""

    # Model IDs (OpenAI format)
    TRIAGE_MODEL_ID: str = "gpt-4o-mini"
    CHATBOT_MODEL_ID: str = "gpt-4o-mini"

    # AWS Config (kept for embeddings/RDS only)
    BEDROCK_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None

    # Database (RDS PostgreSQL)
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/swasthya_setu"

    # CORS
    CORS_ORIGINS: list = ["*"]


settings = Settings()
