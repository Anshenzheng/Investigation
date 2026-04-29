import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { SurveyResponse } from '../../models/survey.model';

@Component({
  selector: 'app-my-responses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1 class="page-title">我的提交</h1>
      <p class="page-subtitle">查看您填写过的所有问卷</p>
    </div>

    @if (loading) {
      <div class="card" style="text-align: center; padding: 40px;">
        <span class="loading"></span>
        <p style="margin-top: 16px; color: var(--text-secondary);">加载中...</p>
      </div>
    } @else if (responses.length === 0) {
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <h3 class="empty-state-title">暂无提交记录</h3>
        <p class="empty-state-text">您还没有填写过任何问卷</p>
        <a routerLink="/surveys" class="btn btn-primary" style="margin-top: 16px;">浏览问卷</a>
      </div>
    } @else {
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>问卷名称</th>
                <th>提交时间</th>
                <th>答案数量</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              @for (response of responses; track response.id) {
                <tr>
                  <td>
                    <a [routerLink]="['/surveys', response.surveyId]" style="font-weight: 500;">
                      问卷 #{{ response.surveyId }}
                    </a>
                  </td>
                  <td>{{ formatDate(response.submittedAt) }}</td>
                  <td>{{ response.answers.length }} 题</td>
                  <td>
                    <div class="actions">
                      <a [routerLink]="['/surveys', response.surveyId]" class="btn btn-secondary btn-sm">查看问卷</a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class MyResponsesComponent implements OnInit {
  responses: SurveyResponse[] = [];
  loading = true;

  constructor(private surveyService: SurveyService) { }

  ngOnInit(): void {
    this.loadResponses();
  }

  loadResponses(): void {
    this.surveyService.getMyResponses().subscribe({
      next: (responses) => {
        this.responses = responses;
        this.loading = false;
      },
      error: () => {
        this.responses = this.getMockResponses();
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getMockResponses(): SurveyResponse[] {
    return [
      {
        id: 1,
        surveyId: 1,
        userId: 1,
        submittedAt: '2024-02-15T10:30:00Z',
        answers: [
          { id: 1, questionId: 1, questionType: 'SINGLE_CHOICE', textValue: null, optionId: 1, optionIds: null, ratingValue: null },
          { id: 2, questionId: 2, questionType: 'MULTIPLE_CHOICE', textValue: null, optionId: null, optionIds: [6, 7], ratingValue: null },
          { id: 3, questionId: 3, questionType: 'TEXT', textValue: '产品体验很好，希望能增加更多功能。', optionId: null, optionIds: null, ratingValue: null },
          { id: 4, questionId: 4, questionType: 'RATING', textValue: null, optionId: null, optionIds: null, ratingValue: 5 }
        ]
      },
      {
        id: 2,
        surveyId: 2,
        userId: 1,
        submittedAt: '2024-03-01T14:20:00Z',
        answers: [
          { id: 5, questionId: 5, questionType: 'SINGLE_CHOICE', textValue: null, optionId: 2, optionIds: null, ratingValue: null },
          { id: 6, questionId: 6, questionType: 'TEXT', textValue: '非常满意这次调研体验。', optionId: null, optionIds: null, ratingValue: null }
        ]
      }
    ];
  }
}
