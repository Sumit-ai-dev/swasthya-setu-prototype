from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    # App
    APP_NAME: str = "Swasthya-Setu API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # AWS Config
    # Uses Default Credential Provider Chain (IAM Role or ~/.aws/credentials)
    # Never hardcode keys in production. Use AWS SSO locally (aws sso login).
    AWS_REGION: str = "ap-south-1"
    AWS_PROFILE: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_SESSION_TOKEN: Optional[str] = None

    # Bedrock model IDs
    TRIAGE_MODEL_ID: str = "anthropic.claude-3-haiku-20240307-v1:0"
    CHATBOT_MODEL_ID: str = "meta.llama3-8b-instruct-v1:0"

    # Database (RDS PostgreSQL)
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/swasthya_setu"

    # CORS
    CORS_ORIGINS: list = ["*"]


settings = Settings()
