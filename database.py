# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# .env içinden DATABASE_URL okunur
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:triage_pass@localhost:5432/triage_db"
)

# SQLAlchemy engine oluştur
engine = create_engine(DATABASE_URL, echo=True, future=True)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class - modeller buradan extend edilir
Base = declarative_base()

# Dependency (FastAPI için)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
