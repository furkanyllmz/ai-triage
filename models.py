# models.py
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import JSONB
from database import Base

class Triage(Base):
    __tablename__ = "triages"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(20), index=True, nullable=False)

    # Hasta bilgileri
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String(10), nullable=False)

    # Başvuru
    complaint_text = Column(Text, nullable=False)
    vitals = Column(JSONB)

    # LLM çıktıları
    triage_level = Column(String(10), nullable=False)
    rationale = Column(Text)
    red_flags = Column(JSONB)
    immediate_actions = Column(JSONB)
    questions_to_ask_next = Column(JSONB)
    routing = Column(JSONB)
    evidence_ids = Column(JSONB)

    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
