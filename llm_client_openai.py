# llm_client_openai.py
import os, json, time
from typing import List, Dict, Optional, Union
from dotenv import load_dotenv
from openai import OpenAI, RateLimitError
from schemas import TriageOutput

# .env dosyasını yükle
load_dotenv()

GPT_MODEL = os.getenv("GPT_MODEL", "gpt-4.1-mini")
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

SYSTEM_PROMPT = """Sen bir acil servis e-triyaj asistanısın.
- Tanı koymazsın, tedavi önermezsin.
- ESI ölçeğine göre öncelik verirsin.
- ÇIKTIN KESİNLİKLE SADECE JSON OLACAK. JSON dışında tek bir karakter bile yazma.

ŞEMA:
- DONE=false iken:
  {"next_question": "yeni benzersiz soru", "finished": false}

- DONE=true iken:
  {"triage": {
      "triage_level": "...",
      "red_flags": [...],
      "immediate_actions": [...],
      "questions_to_ask_next": [],
      "routing": {"specialty": "...", "priority": "low|medium|high"},
      "rationale_brief": "...",
      "evidence_ids": [...]
    },
   "finished": true}

KURALLAR:
1. Kart seçimi:
   - CONTEXT_SNIPPETS içinde top-3 kart verilir.
   - Önce şikâyet, vitaller ve cevaplara bakarak EN UYGUN tek kartı seç.
   - Sorular, red_flags ve evidence_ids sadece seçilen karttan alınmalı.

2. Red flags:
   - Karttaki tüm red_flags listesini kopyalama.
   - Sadece şikâyet/vital/cevaplarla doğrudan ilişkili olanları ekle.
   - Hiçbiri uymuyorsa [] döndür.

3. Evidence_ids:
   - SADECE seçilen kartın id’sini listele.
   - Birden fazla kartı ekleme.

4. Sorular:
   - Sorular özellikle red_flag’leri doğrulamaya yönelik olmalı.
   - Daha önce cevaplanan red_flag için tekrar soru sorma.
   - Önceki cevapları analiz et → aynı flag doğrulanmışsa o konuyu tekrar sorma.
   - Eğer tüm red_flag’ler sorulmuş/cevaplanmışsa sabit sorular ["Ne zaman başladı?", "Şiddeti nasıl?"] kullanılabilir.
   - Yeni soru her zaman önceki sorularla farklı olmalı.

5. Routing:
   - {"specialty": "...", "priority": "low|medium|high"} formatında olmalı.
   - priority sadece low, medium veya high olabilir. Türkçe yazma.

6. Dil:
   - JSON’daki tüm metinler Türkçe olmalı.
   - Açıklama, yorum veya JSON dışı metin yazma.
"""




USER_TEMPLATE = """HASTA BİLGİSİ:
- Yaş: {age}
- Cinsiyet: {sex}
- Şikâyet metni: {complaint}
- Vitaller: {vitals}

ÖNCEKİ TAKİP SORULARI VE CEVAPLAR:
{followups}

GÖREV:
- DONE=false ise: SADECE şu JSON'ı döndür: {{"next_question": "yeni benzersiz soru", "finished": false}}
- DONE=true ise: SADECE şu JSON'ı döndür: {{"triage": {{...}}, "finished": true}}
- next_question daha önce sorulmuş sorularla aynı olmamalı.
- Eğer bir red_flag zaten sorulmuş ve cevaplanmışsa tekrar sorma.
- JSON dışında hiçbir şey yazma.

CONTEXT_SNIPPETS:
{snippets}
"""



def render_followups(qa_list: Optional[List[Dict[str, str]]]) -> str:
    if not qa_list:
        return "YOK"
    return "\n".join([f"- Soru: {x['q']}\n  Cevap: {x['a']}" for x in qa_list])

def call_llm_step(
    age: int,
    sex: str,
    complaint_text: str,
    vitals: Optional[Dict],
    cards: List[Dict],
    qa_list: Optional[List[Dict[str, str]]] = None,
    done: bool = False,
    max_retries: int = 2
) -> Dict:
    snippets = "\n\n---\n\n".join(
        f"[id: {c['id']}]\n{c['content']}" for c in cards
    )

    followup_text = render_followups(qa_list or [])
    user_prompt = USER_TEMPLATE.format(
        age=age,
        sex=sex,
        complaint=complaint_text,
        vitals=vitals or {},
        snippets=snippets,
        followups=followup_text,
    )

    last_err = None
    for _ in range(max_retries + 1):
        try:
            resp = client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt + f"\nDONE={done}"},
                ],
                response_format={"type": "json_object"},
                max_tokens=700,
                temperature=0.2,
            )
            raw = resp.choices[0].message.content or "{}"
            data = json.loads(raw)

            # ---- Sıkı Şema Uygulaması ----
            out: Dict = {"next_question": None, "finished": False, "triage": None}
            if not done:
                # DONE=false iken yalnızca next_question ve finished beklenir
                out["next_question"] = (data.get("next_question") or "").strip() or None
                out["finished"] = bool(data.get("finished", False))
                out["triage"] = None
                if out["next_question"] is None:
                    # Geçersiz çıktı → güvenli varsayılan soru
                    out["next_question"] = "Şikâyetinizle ilgili ek bir ayrıntı paylaşır mısınız?"
                    out["finished"] = False
            else:
                # DONE=true iken triage zorunlu
                triage_obj = data.get("triage") or {}
                if not isinstance(triage_obj, dict) or not triage_obj.get("triage_level"):
                    raise ValueError("Final triage eksik veya hatalı")
                
                # Normalize triage_level
                valid_levels = {"1": "ESI-1", "2": "ESI-2", "3": "ESI-3", "4": "ESI-4", "5": "ESI-5"}
                priority_mapping = {
                    "critical": "ESI-1", "high": "ESI-2", "urgent": "ESI-2",
                    "medium": "ESI-3", "moderate": "ESI-3", "standard": "ESI-3",
                    "low": "ESI-4", "routine": "ESI-4", "non-urgent": "ESI-5",
                }
                if "triage_level" in triage_obj:
                    lvl_raw = str(triage_obj["triage_level"]).lower().strip()
                    lvl_num = lvl_raw.upper().replace("LEVEL_", "").replace("ESI-", "").replace("ESI", "").strip()
                    if lvl_num in valid_levels:
                        triage_obj["triage_level"] = valid_levels[lvl_num]
                    elif lvl_raw in priority_mapping:
                        triage_obj["triage_level"] = priority_mapping[lvl_raw]
                    else:
                        triage_obj["triage_level"] = "ESI-3"  # default
                
                # questions_to_ask_next boş listeye zorla
                triage_obj.setdefault("questions_to_ask_next", [])
                # evidence_ids string listeye zorla
                if "evidence_ids" in triage_obj:
                    triage_obj["evidence_ids"] = [str(x) for x in triage_obj["evidence_ids"]]
                else:
                    triage_obj["evidence_ids"] = []
                out["triage"] = triage_obj
                out["finished"] = True
                out["next_question"] = None

            return out

        except RateLimitError as e:
            last_err = e
            time.sleep(0.8)
        except Exception as e:
            last_err = e
            time.sleep(0.3)

    raise last_err
