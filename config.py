import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Pydantic Settings config
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # Allow extra env vars like OPENAI_API_KEY, OUTPUT_DIR, PORT
    )
    # API Configs
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "9000"))
    
    # Database Configs
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./triage.db"
    )
    
    # RAG Service Configs
    RAG_URL: str = os.getenv(
        "RAG_URL", 
        "http://localhost:8000/rag/topk"
    )
    
    # CORS Settings
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://localhost:5173"
    ).split(",")
    
    # Environment
    ENV: str = os.getenv("ENV", "development")
    
settings = Settings()