import { TriageInput, TriageStartResponse, TriageFollowResponse, AnswerBody } from '../types/TriageTypes';

const BASE_URL = 'http://localhost:9000';

class TriageApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async startTriage(input: TriageInput): Promise<TriageStartResponse> {
    console.log('Frontend gönderilen veri:', JSON.stringify(input, null, 2));
    return this.makeRequest<TriageStartResponse>('/triage/start', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async sendAnswer(caseId: string, body: AnswerBody): Promise<TriageFollowResponse> {
    return this.makeRequest<TriageFollowResponse>(`/triage/${caseId}/answer`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

export const triageApi = new TriageApiService();
