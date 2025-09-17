from fastapi import FastAPI
from pydantic import BaseModel
import glob, json, numpy as np
from sentence_transformers import SentenceTransformer
import logging
from rapidfuzz import fuzz

app = FastAPI()
model = SentenceTransformer("intfloat/multilingual-e5-large")  # TR için iyi

# Kartları yükle
cards = []
paths = sorted(glob.glob("corpus/triage/*.json"))
for p in paths:
    c = json.load(open(p, "r", encoding="utf-8"))
    rf  = "\n- " + "\n- ".join(c.get("red_flags", [])) if c.get("red_flags") else ""
    acts= "\n- " + "\n- ".join(c.get("immediate_actions", [])) if c.get("immediate_actions") else ""
    nxt = "\n- " + "\n- ".join(c.get("questions_to_ask_next", [])) if c.get("questions_to_ask_next") else ""
    content = f"""{c['title']}
ESI ipucu: {c.get('esi_hint','-')}
Red flags:{rf}
İlk eylemler:{acts}
Sorulacak ek sorular:{nxt}"""
    cards.append({"id": c["id"], "meta": c, "content": content})

# Embedding matrisi
emb_matrix = np.stack([model.encode([c["content"]])[0] for c in cards], axis=0)

def cosine_sim(q, M):
    qn = q / (np.linalg.norm(q) + 1e-8)
    Mn = M / (np.linalg.norm(M, axis=1, keepdims=True) + 1e-8)
    return Mn @ qn

class Query(BaseModel):
    text: str
    chief: str | None = None
    age_group: str | None = None
    pregnancy: str | None = None
    k: int = 4

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def fuzzy_match(query: str, choices: list[str], threshold: int = 70) -> bool:
    """RapidFuzz ile fuzzy eşleşme"""
    if not query or not choices:
        return False
    return any(fuzz.partial_ratio(query.lower(), c.lower()) >= threshold for c in choices)

@app.post("/rag/topk")
def topk(q: Query):
    logger.info(
        f"Yeni RAG sorgusu: text='{q.text}', chief={q.chief}, "
        f"age_group={q.age_group}, pregnancy={q.pregnancy}, k={q.k}"
    )

    qvec = model.encode([q.text])[0]

    candidates = []
    for i, c in enumerate(cards):
        score_chief = fuzzy_match(q.chief, c["meta"].get("complaints", [])) if q.chief else False
        score_age   = fuzzy_match(q.age_group, c["meta"].get("age_groups", []), threshold=80) if q.age_group else False
        score_preg  = fuzzy_match(q.pregnancy, c["meta"].get("pregnancy", []), threshold=80) if q.pregnancy else False

        # En az bir filtre eşleşirse aday kabul et
        if score_chief or score_age or score_preg:
            candidates.append(i)

    if not candidates:
        logger.warning("Hiç aday kart bulunamadı (fuzzy filtre eşleşmedi).")
        return []

    sims = cosine_sim(qvec, emb_matrix[candidates])
    order = np.array(candidates)[np.argsort(-sims)[:q.k]]

    logger.info(f"Toplam {len(candidates)} aday kart bulundu.")
    for rank, i in enumerate(order, start=1):
        logger.info(
            f"[{rank}] id={cards[i]['id']} title='{cards[i]['meta']['title']}' "
            f"score={sims[np.where(np.array(candidates)==i)[0][0]]:.4f}"
        )

    return [
        {
            "id": cards[i]["id"],
            "title": cards[i]["meta"]["title"],
            "content": cards[i]["content"],
            "score": float(cosine_sim(qvec, emb_matrix[i:i+1])[0]),
            "evidence": cards[i]["meta"].get("evidence", []),
        }
        for i in order
    ]
