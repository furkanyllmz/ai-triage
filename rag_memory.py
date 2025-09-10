from fastapi import FastAPI
from pydantic import BaseModel
import glob, json, numpy as np
from sentence_transformers import SentenceTransformer

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

@app.post("/rag/topk")
def topk(q: Query):
    qvec = model.encode([q.text])[0]
    mask = np.ones(len(cards), dtype=bool)

    # Hafif filtre (opsiyonel)
    if q.chief:
        mask &= np.array([q.chief in c["meta"].get("complaints", []) for c in cards])
    if q.age_group:
        mask &= np.array([q.age_group in c["meta"].get("age_groups", []) for c in cards])
    if q.pregnancy:
        mask &= np.array([q.pregnancy in c["meta"].get("pregnancy", []) for c in cards])

    idx = np.where(mask)[0]
    sims = cosine_sim(qvec, emb_matrix[idx]) if len(idx) else np.array([])
    order = idx[np.argsort(-sims)[:q.k]] if len(idx) else np.array([], dtype=int)

    return [{
        "id": cards[i]["id"],
        "title": cards[i]["meta"]["title"],
        "content": cards[i]["content"],
        "score": float(cosine_sim(qvec, emb_matrix[i:i+1])[0]),
        "evidence": cards[i]["meta"].get("evidence", [])
    } for i in order]
