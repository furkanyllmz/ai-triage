from pydantic import BaseModel, Field
from typing import List, Dict, Literal

class Routing(BaseModel):
    specialty: str = ""
    priority: Literal["low", "medium", "high"] = "medium"

class TriageOutput(BaseModel):
    triage_level: Literal["ESI-1","ESI-2","ESI-3","ESI-4","ESI-5"]
    red_flags: List[str] = []
    immediate_actions: List[str] = []
    questions_to_ask_next: List[str] = []
    routing: Routing = Routing()
    rationale_brief: str = ""
    evidence_ids: List[str] = []
    model_meta: Dict[str, str] = {}
