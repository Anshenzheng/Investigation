import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Survey, SurveySummary, SurveyResponse, SurveyStatistics, QuestionType } from '../models/survey.model';

@Injectable({ providedIn: 'root' })
export class SurveyService {

  constructor(private http: HttpClient) { }

  getPublicSurveys(): Observable<SurveySummary[]> {
    return this.http.get<SurveySummary[]>('/api/surveys/public');
  }

  getSurvey(id: number): Observable<Survey> {
    return this.http.get<Survey>(`/api/surveys/${id}`);
  }

  submitSurvey(id: number, answers: SubmissionAnswer[]): Observable<void> {
    return this.http.post<void>(`/api/surveys/${id}/submit`, { answers });
  }

  getMyResponses(): Observable<SurveyResponse[]> {
    return this.http.get<SurveyResponse[]>('/api/responses/my');
  }

  getFavorites(): Observable<SurveySummary[]> {
    return this.http.get<SurveySummary[]>('/api/favorites');
  }

  addFavorite(surveyId: number): Observable<void> {
    return this.http.post<void>('/api/favorites', { surveyId });
  }

  removeFavorite(surveyId: number): Observable<void> {
    return this.http.delete<void>(`/api/favorites/${surveyId}`);
  }

  getAdminSurveys(): Observable<SurveySummary[]> {
    return this.http.get<SurveySummary[]>('/api/admin/surveys');
  }

  createSurvey(survey: SurveyCreateRequest): Observable<Survey> {
    return this.http.post<Survey>('/api/admin/surveys', survey);
  }

  updateSurvey(id: number, survey: SurveyUpdateRequest): Observable<Survey> {
    return this.http.put<Survey>(`/api/admin/surveys/${id}`, survey);
  }

  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/surveys/${id}`);
  }

  publishSurvey(id: number): Observable<Survey> {
    return this.http.put<Survey>(`/api/admin/surveys/${id}/publish`, {});
  }

  closeSurvey(id: number): Observable<Survey> {
    return this.http.put<Survey>(`/api/admin/surveys/${id}/close`, {});
  }

  getSurveyResults(id: number): Observable<SurveyStatistics> {
    return this.http.get<SurveyStatistics>(`/api/admin/surveys/${id}/results`);
  }

  exportSurveyResults(id: number, format: 'csv' | 'excel'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    return this.http.get(`/api/admin/surveys/${id}/export`, {
      params,
      responseType: 'blob'
    });
  }

  copySurvey(id: number, newTitle: string): Observable<Survey> {
    return this.http.post<Survey>(`/api/admin/surveys/${id}/copy`, { newTitle });
  }

  getTemplates(): Observable<SurveySummary[]> {
    return this.http.get<SurveySummary[]>('/api/surveys/templates');
  }

  createFromTemplate(templateId: number, newTitle: string): Observable<Survey> {
    return this.http.post<Survey>(`/api/surveys/templates/${templateId}/create`, { newTitle });
  }
}

export interface SurveyCreateRequest {
  title: string;
  description: string;
  isAnonymous: boolean;
  deadline: string | null;
  isTemplate: boolean;
  questions: QuestionCreateRequest[];
}

export interface SurveyUpdateRequest {
  title: string;
  description: string;
  isAnonymous: boolean;
  deadline: string | null;
  isTemplate: boolean;
  questions: QuestionCreateRequest[];
}

export interface QuestionCreateRequest {
  id: number | null;
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
  options: OptionCreateRequest[];
}

export interface OptionCreateRequest {
  id: number | null;
  text: string;
  order: number;
}

export interface SubmissionAnswer {
  questionId: number;
  questionType: QuestionType;
  textValue: string | null;
  optionId: number | null;
  optionIds: number[] | null;
  ratingValue: number | null;
}
