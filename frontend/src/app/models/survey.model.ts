export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'RATING';
export type SurveyStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export interface QuestionOption {
  id: number;
  text: string;
  order: number;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
  options: QuestionOption[];
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  status: SurveyStatus;
  isAnonymous: boolean;
  deadline: string | null;
  isTemplate: boolean;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  questions: Question[];
}

export interface SurveyResponse {
  id: number;
  surveyId: number;
  userId: number | null;
  submittedAt: string;
  answers: Answer[];
}

export interface Answer {
  id: number;
  questionId: number;
  questionType: QuestionType;
  textValue: string | null;
  optionId: number | null;
  optionIds: number[] | null;
  ratingValue: number | null;
}

export interface SurveySummary {
  id: number;
  title: string;
  description: string;
  status: SurveyStatus;
  isAnonymous: boolean;
  deadline: string | null;
  isTemplate: boolean;
  responseCount: number;
  createdAt: string;
  createdBy: string;
}

export interface SurveyStatistics {
  totalResponses: number;
  questionStats: QuestionStatistic[];
}

export interface QuestionStatistic {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  optionCounts: { [key: number]: number } | null;
  textAnswers: string[] | null;
  ratingDistribution: { [key: number]: number } | null;
  ratingAverage: number | null;
}
