const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: { id: string; email: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name?: string) =>
    apiRequest<{ token: string; user: { id: string; email: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),
};

export const interviewApi = {
  createSession: (domain: string, duration: number) =>
    apiRequest<{ sessionId: string }>('/api/interview/create', {
      method: 'POST',
      body: JSON.stringify({ domain, duration }),
    }),

  getQuestions: (sessionId: string) =>
    apiRequest<{ questions: Array<{ id: string; question: string }> }>(
      `/api/interview/${sessionId}/questions`
    ),

  getNextQuestion: (sessionId: string, timeRemaining: number) =>
    apiRequest<{ question: { id: string; question: string } }>(
      `/api/interview/${sessionId}/next-question`,
      {
        method: 'POST',
        body: JSON.stringify({ timeRemaining }),
      }
    ),

  submitResponse: (sessionId: string, questionId: string, transcript: string, videoUrl?: string) =>
    apiRequest('/api/interview/response', {
      method: 'POST',
      body: JSON.stringify({ sessionId, questionId, transcript, videoUrl }),
    }),

  endInterview: (sessionId: string) =>
    apiRequest<{ score: number; feedback: any }>(`/api/interview/${sessionId}/end`, {
      method: 'POST',
    }),
};
