# triage_api.py
from fastapi import FastAPI, HTTPException,Depends,Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests, os, uuid
from typing import Dict, List, Optional
try:
    from typing import Literal
except ImportError:
    from typing_extensions import Literal
from sqlalchemy.orm import Session
from datetime import datetime
from schemas import TriageRead
from database import SessionLocal
from models import Triage
from schemas import TriageOutput
from llm_client_openai import call_llm_triage_openai
from database import get_db

RAG_URL = os.getenv("RAG_URL", "http://localhost:8000/rag/topk")
MAX_QA = 3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory case state
class CaseState(BaseModel):
    case_id: str
    age: int
    sex: str
    complaint_text: str
    vitals: dict
    pregnancy: Optional[str]
    chief: Optional[str]
    rag_cards: List[Dict]
    qa: List[Dict[str, str]] = []
    done: bool = False
    cached_triage: Optional[TriageOutput] = None

CASES: Dict[str, CaseState] = {}

# ---- Input / Output ----
class TriageInput(BaseModel):
    # TC YOK
    age: int
    sex: str

    complaint_text: str
    vitals: Optional[dict] = None

    pregnancy: Optional[str] = "any"
    chief: Optional[str] = None
    k: int = 3

class AnswerBody(BaseModel):
    answers: Optional[Dict[str, str]] = None
    done: Optional[bool] = False

class TriageStartResp(BaseModel):
    case_id: str
    triage: TriageOutput
    questions_to_ask_next: List[str]

class TriageFollowResp(BaseModel):
    case_id: str
    triage: TriageOutput
    questions_to_ask_next: List[str]

def _serialize_routing(routing_obj_or_dict):
    if hasattr(routing_obj_or_dict, "model_dump"):
        return routing_obj_or_dict.model_dump()
    if hasattr(routing_obj_or_dict, "dict"):
        return routing_obj_or_dict.dict()
    return routing_obj_or_dict

def _db() -> Session:
    return SessionLocal()

# ---- Routes ----
@app.post("/triage/start", response_model=TriageStartResp)
def triage_start(inp: TriageInput):
    print(f"Backend aldığı veri: {inp.model_dump()}")
    age_group = "adult" if 18 <= inp.age < 65 else ("pediatric" if inp.age < 18 else "geriatric")
    rag_body = {
        "text": f"{inp.complaint_text}\nYaş:{inp.age} Cins:{inp.sex} Preg:{inp.pregnancy}",
        "chief": inp.chief,
        "age_group": age_group,
        "pregnancy": inp.pregnancy,
        "k": inp.k,
    }

    # RAG
    try:
        r = requests.post(RAG_URL, json=rag_body, timeout=15)
        r.raise_for_status()
        cards = r.json()
        if not isinstance(cards, list):
            raise ValueError("RAG response is not a list")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"RAG upstream error: {e}")

    # Yeni case_id
    case_id = str(uuid.uuid4())[:8]

    # State
    cs = CaseState(
        case_id=case_id,
        age=inp.age,
        sex=inp.sex,
        complaint_text=inp.complaint_text,
        vitals=inp.vitals or {},
        pregnancy=inp.pregnancy,
        chief=inp.chief,
        rag_cards=cards,
    )
    CASES[case_id] = cs

    # LLM
    out = call_llm_triage_openai(
        age=cs.age,
        sex=cs.sex,
        complaint_text=cs.complaint_text,
        vitals=cs.vitals,
        cards=cs.rag_cards,
        qa_list=cs.qa,
    )

    if len(out.questions_to_ask_next) > MAX_QA:
        out.questions_to_ask_next = out.questions_to_ask_next[:MAX_QA]

    # DB insert
    db = _db()
    try:
        tri = Triage(
            case_id=case_id,
            age=cs.age,
            sex=cs.sex,
            complaint_text=cs.complaint_text,
            vitals=cs.vitals,
            triage_level=out.triage_level,
            rationale=out.rationale_brief,
            red_flags=out.red_flags,
            immediate_actions=out.immediate_actions,
            questions_to_ask_next=out.questions_to_ask_next,
            routing=_serialize_routing(out.routing),
            evidence_ids=out.evidence_ids,
        )
        db.add(tri)
        db.commit()
    finally:
        db.close()

    return TriageStartResp(
        case_id=case_id,
        triage=out,
        questions_to_ask_next=out.questions_to_ask_next,
    )

@app.patch("/triage/{case_id}/answer", response_model=TriageFollowResp)
def triage_answer(case_id: str, body: AnswerBody):
    cs = CASES.get(case_id)
    if not cs:
        # state kaybolduysa ilk satırdan hydrate
        db = _db()
        try:
            first_row = (
                db.query(Triage)
                .filter(Triage.case_id == case_id)
                .order_by(Triage.created_at.asc())
                .first()
            )
        finally:
            db.close()

        if not first_row:
            raise HTTPException(404, "case_id not found")

        cs = CaseState(
            case_id=case_id,
    
            age=first_row.age,
            sex=first_row.sex,
            complaint_text=first_row.complaint_text,
            vitals=first_row.vitals or {},
            pregnancy="any",
            chief=None,
            rag_cards=[],
        )
        CASES[case_id] = cs

    if body.done:
        cs.done = True

    if body.answers:
        for q, a in body.answers.items():
            cs.qa.append({"q": q, "a": a})

    # LLM
    if cs.done or len(cs.qa) >= MAX_QA:
        out = call_llm_triage_openai(
            age=cs.age, sex=cs.sex,
            complaint_text=cs.complaint_text, vitals=cs.vitals,
            cards=cs.rag_cards, qa_list=cs.qa,
        )
        out.questions_to_ask_next = []
    else:
        if cs.cached_triage is None:
            cs.cached_triage = call_llm_triage_openai(
                age=cs.age, sex=cs.sex,
                complaint_text=cs.complaint_text, vitals=cs.vitals,
                cards=cs.rag_cards, qa_list=[],
            )
        out = cs.cached_triage.model_copy()
        remaining = MAX_QA - len(cs.qa)
        out.questions_to_ask_next = out.questions_to_ask_next[:remaining] if out.questions_to_ask_next else []

    # DB append
    db = _db()
    try:
        tri = Triage(
            case_id=case_id,
            age=cs.age,
            sex=cs.sex,
            complaint_text=cs.complaint_text,
            vitals=cs.vitals,
            triage_level=out.triage_level,
            rationale=out.rationale_brief,
            red_flags=out.red_flags,
            immediate_actions=out.immediate_actions,
            questions_to_ask_next=out.questions_to_ask_next,
            routing=_serialize_routing(out.routing),
            evidence_ids=out.evidence_ids,
        )
        db.add(tri)
        db.commit()
    finally:
        db.close()

    return TriageFollowResp(
        case_id=case_id,
        triage=out,
        questions_to_ask_next=out.questions_to_ask_next,
    )



@app.get("/triage/alltriages", response_model=List[TriageRead])
def get_all_triages(
    db: Session = Depends(get_db),
    limit: int = Query(1000, ge=1, le=10000),   # istersen “tümü” için büyük bir limit
    offset: int = Query(0, ge=0),
    sort: Literal["asc", "desc"] = "desc",
    case_id: Optional[str] = None,              # opsiyonel filtre
):
    q = db.query(Triage)
    if case_id:
        q = q.filter(Triage.case_id == case_id)
    q = q.order_by(Triage.created_at.desc() if sort == "desc" else Triage.created_at.asc())
    rows = q.offset(offset).limit(limit).all()
    return rows


@app.get("/triage/alltriages/byCase/{case_id}", response_model=List[TriageRead])
def get_triages_by_case_id(
    case_id: str,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: Literal["asc", "desc"] = "desc",
):
    """Belirli bir case_id'ye ait tüm triage kayıtlarını getirir"""
    q = db.query(Triage).filter(Triage.case_id == case_id)
    q = q.order_by(Triage.created_at.desc() if sort == "desc" else Triage.created_at.asc())
    rows = q.offset(offset).limit(limit).all()
    
    if not rows:
        raise HTTPException(status_code=404, detail=f"Case ID '{case_id}' için kayıt bulunamadı")
    
    return rows


@app.get("/triage/alltriages/byDate/{date}", response_model=List[TriageRead])
def get_triages_by_date(
    date: str,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: Literal["asc", "desc"] = "desc",
):
    """Belirli bir tarihteki tüm triage kayıtlarını getirir (YYYY-MM-DD formatında)"""
    try:
        # Tarihi parse et
        from datetime import datetime
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        
        # O günün başlangıcı ve bitişi
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        
        # Sorgu
        q = db.query(Triage).filter(
            Triage.created_at >= start_datetime,
            Triage.created_at <= end_datetime
        )
        q = q.order_by(Triage.created_at.desc() if sort == "desc" else Triage.created_at.asc())
        rows = q.offset(offset).limit(limit).all()
        
        if not rows:
            raise HTTPException(status_code=404, detail=f"'{date}' tarihinde kayıt bulunamadı")
        
        return rows
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz tarih formatı. YYYY-MM-DD formatında olmalı (örn: 2024-01-15)")