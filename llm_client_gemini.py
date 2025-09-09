# llm_client_gemini.py
import os, json, time
from typing import List, Dict
from dotenv import load_dotenv
import google.generativeai as genai
from google.generativeai.protos import Schema, Type  # <-- Önemli: Gemini'nin Schema tipini kullan
from schemas import TriageOutput

# .env dosyasını yükle
load_dotenv()

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

SYSTEM_PROMPT = """Sen bir acil servis e-triyaj asistanısın.
- Tanı koymazsın, tedavi önermezsin.
- ESI ölçeğine göre öncelik verirsin.
- SADECE JSON döndürürsün (verilen şemaya uyan).
- Emin olamadığında güvenli tarafta kal (daha yüksek öncelik).
"""

USER_TEMPLATE = """HASTA BİLGİSİ:
- Yaş: {age}
- Cinsiyet: {sex}
- Şikâyet metni: {complaint}
- Vitaller: {vitals}

GÖREV:
- Aşağıdaki KAPSAM PARÇALARINI (CONTEXT_SNIPPETS) referans al.
- Sadece JSON döndür (triage_level, red_flags, immediate_actions, questions_to_ask_next, routing, rationale_brief, evidence_ids).
- evidence_ids alanına kullandığın kart id'lerini yaz.

CONTEXT_SNIPPETS:
{snippets}
"""

# ---- BURASI YENİ: Gemini'ye uygun yalın şema ----
ROUTING_SCHEMA = Schema(
    type=Type.OBJECT,
    properties={
        "specialty": Schema(type=Type.STRING),
        "priority": Schema(type=Type.STRING, enum=["low", "medium", "high"]),
    },
    required=["specialty", "priority"],
)

TRIAGE_SCHEMA = Schema(
    type=Type.OBJECT,
    properties={
        "triage_level": Schema(type=Type.STRING, enum=["ESI-1","ESI-2","ESI-3","ESI-4","ESI-5"]),
        "red_flags": Schema(type=Type.ARRAY, items=Schema(type=Type.STRING)),
        "immediate_actions": Schema(type=Type.ARRAY, items=Schema(type=Type.STRING)),
        "questions_to_ask_next": Schema(type=Type.ARRAY, items=Schema(type=Type.STRING)),
        "routing": ROUTING_SCHEMA,
        "rationale_brief": Schema(type=Type.STRING),
        "evidence_ids": Schema(type=Type.ARRAY, items=Schema(type=Type.STRING)),
        "model_meta": Schema(
            type=Type.OBJECT,
            properties={
                "model": Schema(type=Type.STRING),
                "prompt_version": Schema(type=Type.STRING),
                "corpus_hint": Schema(type=Type.STRING),
            },
        ),
    },
    required=[
        "triage_level",
        "red_flags",
        "immediate_actions",
        "questions_to_ask_next",
        "routing",
        "rationale_brief",
        "evidence_ids",
    ],
)

def call_llm_triage_gemini(
    age: int,
    sex: str,
    complaint_text: str,
    vitals: Dict,
    cards: List[Dict],
    max_retries: int = 2
) -> TriageOutput:
    snippets = "\n\n---\n\n".join(c["content"] for c in cards)
    evidence_ids = [c["id"] for c in cards]

    user_prompt = USER_TEMPLATE.format(
        age=age, sex=sex, complaint=complaint_text, vitals=vitals or {}, snippets=snippets
    )

    model = genai.GenerativeModel(
        GEMINI_MODEL,
        system_instruction=SYSTEM_PROMPT,
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 700,
            # JSON'u zorla + Gemini Schema kullan
            "response_mime_type": "application/json",
            "response_schema": TRIAGE_SCHEMA,
        },
    )

    last_err = None
    for _ in range(max_retries + 1):
        try:
            resp = model.generate_content(user_prompt)
            # Gemini JSON döndürecek; .text genelde JSON string olur
            raw = resp.text or "{}"
            data = json.loads(raw)

            # evidence_ids boş geldiyse RAG kartlarını doldur
            data.setdefault("evidence_ids", evidence_ids)

            out = TriageOutput(**data)
            out.model_meta = {
                "model": GEMINI_MODEL,
                "prompt_version": "triage-prompt-v1",
                "corpus_hint": "memory-cards",
            }
            return out
        except Exception as e:
            last_err = e
            time.sleep(0.3)
    raise last_err
