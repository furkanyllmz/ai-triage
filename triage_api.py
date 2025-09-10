# triage_api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests, os, uuid
from typing import Dict, List, Optional
from schemas import TriageOutput
from llm_client_openai import call_llm_triage_openai
from utils_output import save_triage_to_output, append_ndjson

RAG_URL = os.getenv("RAG_URL", "http://localhost:8000/rag/topk")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")
MAX_QA = 3  # Maksimum soru sayısı

app = FastAPI()

# CORS middleware ekle (gerekirse domain bazlı kısıtlayabilirsin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# In-memory case store
# -----------------------
class CaseState(BaseModel):
    case_id: str
    patient_id: Optional[str]
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

# -----------------------
# Input / Output Schemas
# -----------------------
class TriageInput(BaseModel):
    patient_id: Optional[str] = None
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
    file_path: str

class TriageFollowResp(BaseModel):
    case_id: str
    triage: TriageOutput
    questions_to_ask_next: List[str]
    file_path: str

# -----------------------
# Routes
# -----------------------
@app.post("/triage/start", response_model=TriageStartResp)
def triage_start(inp: TriageInput):
    age_group = "adult" if 18 <= inp.age < 65 else ("pediatric" if inp.age < 18 else "geriatric")
    rag_body = {
        "text": f"{inp.complaint_text}\nYaş:{inp.age} Cins:{inp.sex} Preg:{inp.pregnancy}",
        "chief": inp.chief,
        "age_group": age_group,
        "pregnancy": inp.pregnancy,
        "k": inp.k,
    }

    try:
        r = requests.post(RAG_URL, json=rag_body, timeout=15)
        r.raise_for_status()
        cards = r.json()
        if not isinstance(cards, list):
            raise ValueError("RAG response is not a list")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"RAG upstream error: {e}")

    case_id = str(uuid.uuid4())[:8]
    cs = CaseState(
        case_id=case_id,
        patient_id=inp.patient_id,
        age=inp.age,
        sex=inp.sex,
        complaint_text=inp.complaint_text,
        vitals=inp.vitals or {},
        pregnancy=inp.pregnancy,
        chief=inp.chief,
        rag_cards=cards,
    )
    CASES[case_id] = cs

    out = call_llm_triage_openai(
        age=cs.age,
        sex=cs.sex,
        complaint_text=cs.complaint_text,
        vitals=cs.vitals,
        cards=cs.rag_cards,
        qa_list=cs.qa,
    )

    # Guardrail: ilk adımda da max soru kontrolü
    if len(out.questions_to_ask_next) > MAX_QA:
        out.questions_to_ask_next = out.questions_to_ask_next[:MAX_QA]

    input_ctx = {**inp.model_dump(), "age_group": age_group, "case_id": case_id}
    file_path = save_triage_to_output(
        triage=out.model_dump(mode="json"),
        input_ctx=input_ctx,
        rag_cards=cards,
        base_dir=OUTPUT_DIR,
    )
    append_ndjson({
        "case_id": case_id,
        "triage_level": out.triage_level,
        "patient_id": inp.patient_id,
        "file": file_path,
    })

    return TriageStartResp(
        case_id=case_id,
        triage=out,
        questions_to_ask_next=out.questions_to_ask_next,
        file_path=file_path,
    )

@app.patch("/triage/{case_id}/answer", response_model=TriageFollowResp)
def triage_answer(case_id: str, body: AnswerBody):
    cs = CASES.get(case_id)
    if not cs:
        raise HTTPException(404, "case_id not found")

    if body.done:
        cs.done = True

    if body.answers:
        for q, a in body.answers.items():
            cs.qa.append({"q": q, "a": a})

    # Eğer hasta bitirdiyse veya max soruya ulaştıysa final triage yap
    if cs.done or len(cs.qa) >= MAX_QA:
        out = call_llm_triage_openai(
            age=cs.age,
            sex=cs.sex,
            complaint_text=cs.complaint_text,
            vitals=cs.vitals,
            cards=cs.rag_cards,
            qa_list=cs.qa,
        )
        out.questions_to_ask_next = []
    else:
        # Henüz bitmedi - cached triage sonucunu kullan, LLM çağrısı yok
        if cs.cached_triage is None:
            cs.cached_triage = call_llm_triage_openai(
                age=cs.age,
                sex=cs.sex,
                complaint_text=cs.complaint_text,
                vitals=cs.vitals,
                cards=cs.rag_cards,
                qa_list=[],
            )
        out = cs.cached_triage.model_copy()

        remaining_questions = MAX_QA - len(cs.qa)
        if remaining_questions > 0 and out.questions_to_ask_next:
            out.questions_to_ask_next = out.questions_to_ask_next[:remaining_questions]
        else:
            out.questions_to_ask_next = []

    file_path = save_triage_to_output(
        triage=out.model_dump(mode="json"),
        input_ctx={"case_id": case_id, "qa": cs.qa},
        rag_cards=cs.rag_cards,
        base_dir=OUTPUT_DIR,
    )
    append_ndjson({
        "case_id": case_id,
        "triage_level": out.triage_level,
        "patient_id": cs.patient_id,
        "file": file_path,
    })

    return TriageFollowResp(
        case_id=case_id,
        triage=out,
        questions_to_ask_next=out.questions_to_ask_next,
        file_path=file_path,
    )
