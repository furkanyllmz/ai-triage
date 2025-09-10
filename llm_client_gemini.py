# llm_client_openai.py
import os, json, time
from typing import List, Dict
from dotenv import load_dotenv
from openai import OpenAI
from schemas import TriageOutput

# .env dosyasını yükle
load_dotenv()

GPT_MODEL = os.getenv("GPT_MODEL", "gpt-4.1-nano")
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

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

{followups}

GÖREV:
- Aşağıdaki KAPSAM PARÇALARINI (CONTEXT_SNIPPETS) referans al.
- Sadece JSON döndür (triage_level, red_flags, immediate_actions, questions_to_ask_next, routing, rationale_brief, evidence_ids).
- evidence_ids alanına kullandığın kart id'lerini yaz.

CONTEXT_SNIPPETS:
{snippets}
"""

# ---- Yardımcı: Önceki Q/A'ları yazdır ----
def render_followups(qa_list: List[Dict[str, str]] | None) -> str:
    if not qa_list:
        return ""
    lines = "\n".join([f"- Soru: {x['q']}\n  Cevap: {x['a']}" for x in qa_list])
    return f"ÖNCEKİ TAKİP SORULARI VE CEVAPLAR:\n{lines}\n"

# ---- Ana çağrı ----
def call_llm_triage_openai(
    age: int,
    sex: str,
    complaint_text: str,
    vitals: Dict,
    cards: List[Dict],
    qa_list: List[Dict[str, str]] | None = None,
    max_retries: int = 2
) -> TriageOutput:
    snippets = "\n\n---\n\n".join(c["content"] for c in cards)
    evidence_ids = [c["id"] for c in cards]

    followup_text = render_followups(qa_list or [])

    user_prompt = USER_TEMPLATE.format(
        age=age,
        sex=sex,
        complaint=complaint_text,
        vitals=vitals or {},
        snippets=snippets,
        followups=followup_text
    )

    last_err = None
    for _ in range(max_retries + 1):
        try:
            resp = client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={ "type": "json_object" },
                max_tokens=700,
                temperature=0.2,
            )
            raw = resp.choices[0].message.content or "{}"
            data = json.loads(raw)

            # evidence_ids boş gelirse RAG’den doldur
            data.setdefault("evidence_ids", evidence_ids)

            out = TriageOutput(**data)
            out.model_meta = {
                "model": GPT_MODEL,
                "prompt_version": "triage-prompt-v1",
                "corpus_hint": "memory-cards",
            }
            return out
        except Exception as e:
            last_err = e
            time.sleep(0.3)
    raise last_err
