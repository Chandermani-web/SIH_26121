from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "eRTMAC-NWIS — Nearby Wells Intelligence System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ORGANIZATION: str = "Oil India Limited (OIL)"
    ENVIRONMENT: str = os.getenv("NODE_ENV", "production")

    # PostgreSQL / PostGIS
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://oil_user:oil_secure_pass@localhost:5432/ertmac_nwis"
    )

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]

    # LLM Settings
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
