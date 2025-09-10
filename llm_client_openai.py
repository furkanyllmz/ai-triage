# llm_client_openai.py
import os, json, time
from typing import List, Dict, Optional
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError
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
- "routing" mutlaka OBJEDİR: {"specialty": "...", "priority": "low|medium|high"}.
- TÜM YANITLARINI TÜRKÇE VER. JSON içindeki tüm metin alanları Türkçe olmalı.
- red_flags, immediate_actions, questions_to_ask_next alanları MUTLAKA LİSTE olmalı (string değil).
- red_flags, immediate_actions, questions_to_ask_next, rationale_brief alanlarındaki metinler Türkçe olsun.
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

ÖRNEK JSON FORMATI:
{{
  "triage_level": "ESI-3",
  "red_flags": ["Kırmızı bayrak 1", "Kırmızı bayrak 2"],
  "immediate_actions": ["Acil eylem 1", "Acil eylem 2"],
  "questions_to_ask_next": ["Soru 1", "Soru 2"],
  "routing": {{"specialty": "kardiyoloji", "priority": "high"}},
  "rationale_brief": "Kısa açıklama",
  "evidence_ids": ["kart_id_1", "kart_id_2"]
}}

CONTEXT_SNIPPETS:
{snippets}

ÖRNEK JSON FORMATI:
{{
  "triage_level": "ESI-3",
  "red_flags": ["Şiddetli göğüs ağrısı", "Nefes darlığı"],
  "immediate_actions": ["EKG çek", "Oksijen sat ölç"],
  "questions_to_ask_next": ["Ağrı ne zaman başladı?", "Daha önce kalp problemi var mı?"],
  "routing": {{"specialty": "kardiyoloji", "priority": "high"}},
  "rationale_brief": "Göğüs ağrısı ve nefes darlığı kardiyak acil durumu işaret edebilir",
  "evidence_ids": ["chest_pain_adult_v1"]
}}
"""

def render_followups(qa_list: Optional[List[Dict[str, str]]]) -> str:
    if not qa_list:
        return ""
    lines = "\n".join([f"- Soru: {x['q']}\n  Cevap: {x['a']}" for x in qa_list])
    return f"ÖNCEKİ TAKİP SORULARI VE CEVAPLAR:\n{lines}\n"

def call_llm_triage_openai(
    age: int,
    sex: str,
    complaint_text: str,
    vitals: Optional[Dict],
    cards: List[Dict],
    qa_list: Optional[List[Dict[str, str]]] = None,
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
                response_format={"type": "json_object"},
                max_tokens=700,
                temperature=0.2,
            )
            raw = resp.choices[0].message.content or "{}"
            data = json.loads(raw)

            # ---- Guardrails ----
            # routing string gelirse objeye çevir
            if isinstance(data.get("routing"), str):
                data["routing"] = {"specialty": data["routing"], "priority": "medium"}
            # routing eksikse doldur
            data.setdefault("routing", {"specialty": "", "priority": "medium"})
            # Normalize triage_level
            valid_levels = {"1": "ESI-1", "2": "ESI-2", "3": "ESI-3", "4": "ESI-4", "5": "ESI-5"}
            priority_mapping = {
                "critical": "ESI-1", "high": "ESI-2", "urgent": "ESI-2",
                "medium": "ESI-3", "moderate": "ESI-3", "standard": "ESI-3",
                "low": "ESI-4", "routine": "ESI-4", "non-urgent": "ESI-5"
            }
            if "triage_level" in data:
                lvl_raw = str(data["triage_level"]).lower().strip()
                # Önce sayısal değerleri kontrol et
                lvl_num = lvl_raw.upper().replace("LEVEL_", "").replace("ESI-", "").replace("ESI", "").strip()
                if lvl_num in valid_levels:
                    data["triage_level"] = valid_levels[lvl_num]
                # Sonra kelime bazlı mapping'i kontrol et
                elif lvl_raw in priority_mapping:
                    data["triage_level"] = priority_mapping[lvl_raw]
                # Hiçbiri yoksa varsayılan değer
                else:
                    data["triage_level"] = "ESI-3"

            
            # evidence boşsa RAG'den doldur
            data.setdefault("evidence_ids", evidence_ids)
            # listeler eksikse boş liste ata
            data.setdefault("red_flags", [])
            data.setdefault("immediate_actions", [])
            data.setdefault("questions_to_ask_next", [])
            data.setdefault("rationale_brief", "")

            out = TriageOutput(**data)
            out.model_meta = {
                "model": GPT_MODEL,
                "prompt_version": "triage-prompt-v1",
                "corpus_hint": "memory-cards",
            }
            return out

        except RateLimitError as e:
            last_err = e
            time.sleep(0.8)  # rate limit için biraz daha bekle
        except Exception as e:
            last_err = e
            time.sleep(0.3)

    raise last_err
