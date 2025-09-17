# triage_api.py
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests, uuid
from typing import Dict, List, Optional
try:
    from typing import Literal
except ImportError:
    from typing_extensions import Literal
from sqlalchemy.orm import Session
from datetime import datetime

from schemas import TriageRead, TriageOutput
from database import SessionLocal, get_db
from models import Triage
from llm_client_openai import call_llm_step  # <-- yeni step tabanlı LLM çağrısı
from config import settings

# Kaç soru sonra final triage verileceği
MAX_QA = 3

app = FastAPI(
    title="AI Triage API",
    description="AI-powered medical triage system (step-wise Q&A)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- In-memory case state ----
class CaseState(BaseModel):
    case_id: str
    age: int
    sex: str
    complaint_text: str
    vitals: dict
    pregnancy: Optional[str]
    chief: Optional[str]
    rag_cards: List[Dict] = []
    qa: List[Dict[str, str]] = []  # {"q": "...", "a": "..."}
    done: bool = False
    finished: bool = False  # final triage verildi mi?

CASES: Dict[str, CaseState] = {}

# ---- Input / Output şemaları ----
class TriageInput(BaseModel):
    # TC yok
    age: int
    sex: str
    complaint_text: str
    vitals: Optional[dict] = None
    pregnancy: Optional[str] = "any"
    chief: Optional[str] = None
    k: int = 3

class AnswerBody(BaseModel):
    answers: Optional[Dict[str, str]] = None  # {"Soru metni": "Cevap"}
    done: Optional[bool] = False              # kullanıcı erken bitirmek isterse

class StepResp(BaseModel):
    case_id: str
    finished: bool
    next_question: Optional[str] = None
    triage: Optional[TriageOutput] = None  # final olduğunda dolar

# ---- Yardımcılar ----
def _serialize_routing(routing_obj_or_dict):
    if hasattr(routing_obj_or_dict, "model_dump"):
        return routing_obj_or_dict.model_dump()
    if hasattr(routing_obj_or_dict, "dict"):
        return routing_obj_or_dict.dict()
    return routing_obj_or_dict

def _db() -> Session:
    return SessionLocal()

# ---- Rotalar ----
@app.post("/triage/start", response_model=StepResp)
def triage_start(inp: TriageInput):
    # Yaş grubunu belirle (RAG için)
    age_group = "adult" if 18 <= inp.age < 65 else ("pediatric" if inp.age < 18 else "geriatric")

    rag_body = {
        "text": f"{inp.complaint_text}\nYaş:{inp.age} Cins:{inp.sex} Preg:{inp.pregnancy}",
        "chief": inp.chief,
        "age_group": age_group,
        "pregnancy": inp.pregnancy,
        "k": inp.k,
    }

    try:
        r = requests.post(settings.RAG_URL, json=rag_body, timeout=15)
        r.raise_for_status()
        cards = r.json()
        if not isinstance(cards, list):
            raise ValueError("RAG response is not a list")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"RAG upstream error: {e}")

    case_id = str(uuid.uuid4())[:8]

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

    # İlk step → done=False
    step = call_llm_step(
        age=cs.age,
        sex=cs.sex,
        complaint_text=cs.complaint_text,
        vitals=cs.vitals,
        cards=cs.rag_cards,
        qa_list=cs.qa,
        done=False,
    )

    next_q = step.get("next_question")
    # Backend guard: tekrar eden soru geldiyse finala zorla
    if next_q and any((q.get("q") or "").strip().lower() == next_q.strip().lower() for q in cs.qa):
        step = call_llm_step(
            age=cs.age,
            sex=cs.sex,
            complaint_text=cs.complaint_text,
            vitals=cs.vitals,
            cards=cs.rag_cards,
            qa_list=cs.qa,
            done=True,
        )
        finished = True
        return StepResp(case_id=case_id, finished=finished, next_question=None, triage=TriageOutput(**(step.get("triage") or {})))
    finished = bool(step.get("finished", False))

    resp = StepResp(
        case_id=case_id,
        finished=finished,
        next_question=next_q,
        triage=None
    )
    print("DEBUG RESPONSE /triage/start:", resp.model_dump())  # 🔍 LOG

    return resp

@app.patch("/triage/{case_id}/answer", response_model=StepResp)
def triage_answer(case_id: str, body: AnswerBody):
    cs = CASES.get(case_id)
    if not cs:
        raise HTTPException(404, "case_id not found")

    # Kullanıcı erken bitirmek isterse
    if body.done:
        cs.done = True

    # Gelen cevapları kaydet
    if body.answers:
        for q, a in body.answers.items():
            cs.qa.append({"q": q, "a": a})

    # Final triage zamanı mı?
    finished_flag = cs.done or (len(cs.qa) >= MAX_QA)

    # LLM çağrısı
    step = call_llm_step(
        age=cs.age,
        sex=cs.sex,
        complaint_text=cs.complaint_text,
        vitals=cs.vitals,
        cards=cs.rag_cards,
        qa_list=cs.qa,          # 🔑 geçmiş tüm Q/A gönderiliyor
        done=finished_flag,
    )

    # Backend guard: tekrar eden soru geldiyse finala zorla
    if not finished_flag:
        next_q = step.get("next_question")
        if next_q and any((q.get("q") or "").strip().lower() == next_q.strip().lower() for q in cs.qa):
            step = call_llm_step(
                age=cs.age,
                sex=cs.sex,
                complaint_text=cs.complaint_text,
                vitals=cs.vitals,
                cards=cs.rag_cards,
                qa_list=cs.qa,
                done=True,
            )
            finished_flag = True

    # Eğer final aşamadaysak
    if finished_flag:
        triage_data = step.get("triage") or {}
        try:
            triage_obj = TriageOutput(**triage_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM triage parse error: {e}")

        cs.finished = True

        # Final triage’ı DB’ye yaz
        db = _db()
        try:
            tri = Triage(
                case_id=cs.case_id,
                age=cs.age,
                sex=cs.sex,
                complaint_text=cs.complaint_text,
                vitals=cs.vitals,
                triage_level=triage_obj.triage_level,
                rationale=triage_obj.rationale_brief,
                red_flags=triage_obj.red_flags,
                immediate_actions=triage_obj.immediate_actions,
                questions_to_ask_next=[],  # finalde soru yok
                routing=_serialize_routing(triage_obj.routing),
                evidence_ids=triage_obj.evidence_ids,
            )
            db.add(tri)
            db.commit()
        finally:
            db.close()

        return StepResp(
            case_id=case_id,
            finished=True,
            next_question=None,
            triage=triage_obj
        )

    # Eğer hala devam ediyorsa → sıradaki soruyu döndür
    next_q = step.get("next_question")
    finished = bool(step.get("finished", False))

    return StepResp(
        case_id=case_id,
        finished=finished,
        next_question=next_q,
        triage=None
    )


# ---- Listeleme uçları (değiştirmeden koruyoruz) ----
@app.get("/triage/alltriages", response_model=List[TriageRead])
def get_all_triages(
    db: Session = Depends(get_db),
    limit: int = Query(1000, ge=1, le=10000),
    offset: int = Query(0, ge=0),
    sort: Literal["asc", "desc"] = "desc",
    case_id: Optional[str] = None,
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
    """Belirli bir tarihteki tüm triage kayıtlarını getirir (YYYY-MM-DD)."""
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())

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
        raise HTTPException(
            status_code=400,
            detail="Geçersiz tarih formatı. YYYY-MM-DD olmalı (örn: 2025-01-15)"
        )
