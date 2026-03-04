from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    # App
    APP_NAME: str = "Swasthya-Setu API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # AWS / Bedrock
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # Bedrock model IDs
    TRIAGE_MODEL_ID: str = "anthropic.claude-3-haiku-20240307-v1:0"
    CHATBOT_MODEL_ID: str = "meta.llama3-8b-instruct-v1:0"

    # Database (RDS PostgreSQL)
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/swasthya_setu"

    # CORS
    CORS_ORIGINS: list = ["*"]


settings = Settings()
