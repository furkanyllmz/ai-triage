import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
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
    
    class Config:
        env_file = ".env"
        
settings = Settings()