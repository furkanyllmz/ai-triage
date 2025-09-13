export interface TriageInput {
  age: number;
  sex: string;
  complaint_text: string;
  vitals?: Record<string, any>;
  pregnancy?: string;
  chief?: string;
  k?: number;
}

export interface AnswerBody {
  answers?: Record<string, string>;
  done?: boolean;
}

export interface Routing {
  specialty: string;
  priority: string;
}

export interface TriageOutput {
  triage_level: string;
  red_flags: string[];
  immediate_actions: string[];
  questions_to_ask_next: string[];
  routing: Routing;
  rationale_brief: string;
  evidence_ids?: string[];
}

export interface TriageStartResponse {
  case_id: string;
  triage: TriageOutput;
  questions_to_ask_next: string[];
}

export interface TriageFollowResponse {
  case_id: string;
  triage: TriageOutput;
  questions_to_ask_next: string[];
}

export interface TriageState {
  caseId: string | null;
  currentQuestion: string | null;
  remainingQuestions: number;
  triage: TriageOutput | null;
  isLoading: boolean;
  error: string | null;
}
