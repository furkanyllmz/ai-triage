# utils_output.py
import json, os, tempfile, shutil
from datetime import datetime
from uuid import uuid4
import re

def _slug(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9\-_.]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "na"

def timestamp():
    # 2025-09-09_22-41-03 gibi
    return datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

def ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)

def atomic_write_json(path: str, data: dict):
    """Dosyayı atomik yaz (yarım kalmış dosya olmaz)."""
    d = os.path.dirname(path)
    ensure_dir(d)
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".tmp_", suffix=".json")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        shutil.move(tmp, path)
    finally:
        try: os.remove(tmp)
        except OSError: pass

def save_triage_to_output(
    *,
    triage: dict,
    input_ctx: dict,
    rag_cards: list,
    base_dir: str = "output"
) -> str:
    """
    output/triage/YYYY-MM-DD/<ts>__ESI-4__<patient or uuid>.json
    """
    day = datetime.now().strftime("%Y-%m-%d")
    triage_level = triage.get("triage_level", "ESI-?")
    patient_id = _slug(str(input_ctx.get("patient_id") or "")) if input_ctx else ""
    suffix = patient_id or str(uuid4())[:8]

    fname = f"{timestamp()}__{triage_level}__{suffix}.json"
    out_dir = os.path.join(base_dir, "triage", day)
    out_path = os.path.join(out_dir, fname)

    payload = {
        "saved_at": datetime.now().isoformat(timespec="seconds"),
        "triage": triage,          # LLM doğrulanmış çıktısı (TriageOutput)
        "input_context": input_ctx, # age, sex, complaint_text, vitals...
        "rag_cards": rag_cards,     # /rag/topk cevabı (kanıt)
    }
    atomic_write_json(out_path, payload)
    return out_path

def append_ndjson(record: dict, path: str = "output/triage_log.ndjson"):
    ensure_dir(os.path.dirname(path) or ".")
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
