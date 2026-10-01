export interface GeneratedQuestion {
  question: string;
  topic: string;
  difficulty: string;
  type: string;
  expectedAnswer: string[];
  followUps: string[];
  citations: { sourceFile: string; heading: string }[];
}

export interface GenerateRequest {
  resume: string;
  jobDescription: string;
  numberOfQuestions?: number;
  difficulty?: string;
  topicFilter?: string;
}

export interface GenerateResponse {
  success: boolean;
  questions: GeneratedQuestion[];
  meta: Record<string, any>;
}
