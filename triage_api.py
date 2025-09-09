from fastapi import FastAPI
from pydantic import BaseModel
import requests, os
from schemas import TriageOutput
from llm_client_gemini import call_llm_triage_gemini
from utils_output import save_triage_to_output, append_ndjson

RAG_URL = os.getenv("RAG_URL", "http://localhost:8000/rag/topk")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")
app = FastAPI()

class TriageInput(BaseModel):
    patient_id: str | None = None
    age: int
    sex: str
    complaint_text: str
    vitals: dict | None = None
    pregnancy: str | None = "any"
    chief: str | None = None
    k: int = 3

class TriageWithFile(BaseModel):
    triage: TriageOutput
    file_path: str

@app.post("/triage", response_model=TriageWithFile)
def triage(inp: TriageInput):
    # 1) RAG
    age_group = "adult" if 18 <= inp.age < 65 else ("pediatric" if inp.age < 18 else "geriatric")
    rag_body = {
        "text": f"{inp.complaint_text}\nYaş:{inp.age} Cins:{inp.sex} Preg:{inp.pregnancy}",
        "chief": inp.chief,
        "age_group": age_group,
        "pregnancy": inp.pregnancy,
        "k": inp.k
    }
    cards = requests.post(RAG_URL, json=rag_body, timeout=10).json()

    # 2) Gemini → TriageOutput (doğrulanmış)
    out = call_llm_triage_gemini(
        age=inp.age,
        sex=inp.sex,
        complaint_text=inp.complaint_text,
        vitals=inp.vitals or {},
        cards=cards
    )

    # 3) Dosyaya kaydet
    input_ctx = {
        "patient_id": inp.patient_id,
        "age": inp.age,
        "sex": inp.sex,
        "complaint_text": inp.complaint_text,
        "vitals": inp.vitals or {},
        "pregnancy": inp.pregnancy,
        "chief": inp.chief,
        "k": inp.k,
        "age_group": age_group,
    }
    file_path = save_triage_to_output(
        triage=out.model_dump(mode="json"),
        input_ctx=input_ctx,
        rag_cards=cards,
        base_dir=OUTPUT_DIR
    )

    # (Opsiyonel) NDJSON kısa log
    append_ndjson({
        "ts": out.model_meta.get("prompt_version", "v1"),
        "triage_level": out.triage_level,
        "patient_id": inp.patient_id,
        "file": file_path,
    })

    return TriageWithFile(triage=out, file_path=file_path)
