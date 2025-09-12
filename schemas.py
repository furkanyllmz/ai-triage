from pydantic import BaseModel, Field,constr
from typing import List, Dict, Literal,Optional,Annotated
from datetime import datetime
class Routing(BaseModel):
    specialty: str = ""
    priority: Literal["low", "medium", "high"] = "medium"

class TriageOutput(BaseModel):
    triage_level: Literal["ESI-1","ESI-2","ESI-3","ESI-4","ESI-5"]
    red_flags: List[str] = Field(default_factory=list)
    immediate_actions: List[str] = Field(default_factory=list)
    questions_to_ask_next: List[str] = Field(default_factory=list)
    routing: Routing = Routing()
    rationale_brief: str = ""
    evidence_ids: List[str] = Field(default_factory=list)
    model_meta: Dict[str, str] = Field(default_factory=dict)


class TriageRead(BaseModel):
    id: int
    case_id: str
    name: str
    age: int
    sex: str
    complaint_text: str
    vitals: Optional[Dict] = None
    triage_level: str
    rationale: Optional[str] = None
    red_flags: Optional[List[str]] = None
    immediate_actions: Optional[List[str]] = None
    questions_to_ask_next: Optional[List[str]] = None
    routing: Optional[Dict] = None
    evidence_ids: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True