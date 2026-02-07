export type InterviewDomain = 
  | 'Technology'
  | 'Marketing'
  | 'Sales'
  | 'HR'
  | 'Finance'
  | 'Data Science'
  | 'Custom';

export type InterviewDuration = 5 | 10 | 15 | 30;

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  domain: InterviewDomain;
  duration: InterviewDuration;
  startTime: Date;
  endTime?: Date;
  score?: number;
  feedback?: InterviewFeedback;
  status: 'pending' | 'in-progress' | 'completed' | 'terminated';
}

export interface InterviewFeedback {
  overallScore: number;
  domainScore: number;
  communicationScore: number;
  technicalScore: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  domainSpecificFeedback: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  domain: InterviewDomain;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedKeywords?: string[];
}

export interface InterviewResponse {
  questionId: string;
  videoBlob?: Blob;
  transcript?: string;
  timestamp: Date;
}
