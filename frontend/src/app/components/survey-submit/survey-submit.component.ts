import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService, SubmissionAnswer } from '../../services/survey.service';
import { Survey, Question, QuestionType } from '../../models/survey.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-survey-submit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (loading) {
      <div class="card" style="text-align: center; padding: 40px;">
        <span class="loading"></span>
        <p style="margin-top: 16px; color: var(--text-secondary);">加载中...</p>
      </div>
    } @else if (survey) {
      <div class="card">
        <div class="card-header">
          <h1 class="card-title" style="font-size: 24px;">{{ survey.title }}</h1>
          <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">{{ survey.description }}</p>
        </div>
        
        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }
        
        @if (survey.isAnonymous) {
          <div class="alert alert-info">
            🔒 此问卷支持匿名填写，您的身份信息将不会被记录
          </div>
        } @else if (!authService.isAuthenticated()) {
          <div class="alert alert-warning">
            此问卷需要登录后才能填写。<a routerLink="/login" style="font-weight: 500;">立即登录</a>
          </div>
        }
        
        <form #surveyForm="ngForm" (ngSubmit)="onSubmit()">
          @for (question of survey.questions; track question.id; let i = $index) {
            <div class="question-card">
              <div class="question-title">
                <span style="background: var(--primary-color); color: white; padding: 2px 10px; border-radius: 4px; font-size: 14px; margin-right: 8px;">
                  {{ i + 1 }}
                </span>
                {{ question.text }}
                @if (question.required) {
                  <span class="required">*</span>
                }
              </div>
              
              @if (question.type === 'SINGLE_CHOICE') {
                <div class="options-list">
                  @for (option of question.options; track option.id) {
                    <label class="option-item" [class.selected]="getSingleChoiceAnswer(question.id) === option.id">
                      <input type="radio" 
                             [name]="'q' + question.id" 
                             [value]="option.id"
                             [(ngModel)]="singleChoiceAnswers[question.id]"
                             (change)="updateSingleChoiceAnswer(question.id, option.id)">
                      <span>{{ option.text }}</span>
                    </label>
                  }
                </div>
              }
              
              @if (question.type === 'MULTIPLE_CHOICE') {
                <div class="options-list">
                  @for (option of question.options; track option.id) {
                    <label class="option-item" [class.selected]="isOptionSelected(question.id, option.id)">
                      <input type="checkbox" 
                             [value]="option.id"
                             [checked]="isOptionSelected(question.id, option.id)"
                             (change)="toggleOption(question.id, option.id)">
                      <span>{{ option.text }}</span>
                    </label>
                  }
                </div>
              }
              
              @if (question.type === 'TEXT') {
                <textarea 
                  [(ngModel)]="textAnswers[question.id]" 
                  class="form-control" 
                  placeholder="请输入您的答案..."
                  rows="4"
                  name="text{{question.id}}">
                </textarea>
              }
              
              @if (question.type === 'RATING') {
                <div class="rating-stars">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span 
                      class="rating-star" 
                      [class.active]="getRatingValue(question.id) >= star"
                      (click)="setRatingValue(question.id, star)">
                      ★
                    </span>
                  }
                </div>
                @if (getRatingValue(question.id) > 0) {
                  <p style="margin-top: 8px; font-size: 14px; color: var(--text-secondary);">
                    您选择了 {{ getRatingValue(question.id) }} 分
                  </p>
                }
              }
            </div>
          }
          
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="submitting">
              @if (submitting) {
                <span class="loading"></span>
              } @else {
                提交问卷
              }
            </button>
            <a [routerLink]="['/surveys', survey.id]" class="btn btn-secondary btn-lg">取消</a>
          </div>
        </form>
      </div>
    } @else {
      <div class="empty-state">
        <div class="empty-state-icon">😕</div>
        <h3 class="empty-state-title">问卷不存在</h3>
        <p class="empty-state-text">您访问的问卷不存在或已被删除</p>
        <a routerLink="/surveys" class="btn btn-primary" style="margin-top: 16px;">返回问卷列表</a>
      </div>
    }
  `
})
export class SurveySubmitComponent implements OnInit {
  survey: Survey | null = null;
  loading = true;
  submitting = false;
  errorMessage = '';

  singleChoiceAnswers: { [questionId: number]: number | null } = {};
  multipleChoiceAnswers: { [questionId: number]: number[] } = {};
  textAnswers: { [questionId: number]: string } = {};
  ratingAnswers: { [questionId: number]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private surveyService: SurveyService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    const surveyId = this.route.snapshot.params['id'];
    if (surveyId) {
      this.loadSurvey(+surveyId);
    }
  }

  loadSurvey(id: number): void {
    this.loading = true;
    this.surveyService.getSurvey(id).subscribe({
      next: (survey) => {
        this.survey = survey;
        this.initAnswers(survey.questions);
        this.loading = false;
      },
      error: () => {
        this.survey = this.getMockSurvey();
        this.initAnswers(this.survey.questions);
        this.loading = false;
      }
    });
  }

  initAnswers(questions: Question[]): void {
    questions.forEach(q => {
      if (q.type === 'SINGLE_CHOICE') {
        this.singleChoiceAnswers[q.id] = null;
      } else if (q.type === 'MULTIPLE_CHOICE') {
        this.multipleChoiceAnswers[q.id] = [];
      } else if (q.type === 'TEXT') {
        this.textAnswers[q.id] = '';
      } else if (q.type === 'RATING') {
        this.ratingAnswers[q.id] = 0;
      }
    });
  }

  getSingleChoiceAnswer(questionId: number): number | null {
    return this.singleChoiceAnswers[questionId] ?? null;
  }

  updateSingleChoiceAnswer(questionId: number, optionId: number): void {
    this.singleChoiceAnswers[questionId] = optionId;
  }

  isOptionSelected(questionId: number, optionId: number): boolean {
    return (this.multipleChoiceAnswers[questionId] || []).includes(optionId);
  }

  toggleOption(questionId: number, optionId: number): void {
    if (!this.multipleChoiceAnswers[questionId]) {
      this.multipleChoiceAnswers[questionId] = [];
    }
    
    const index = this.multipleChoiceAnswers[questionId].indexOf(optionId);
    if (index > -1) {
      this.multipleChoiceAnswers[questionId].splice(index, 1);
    } else {
      this.multipleChoiceAnswers[questionId].push(optionId);
    }
  }

  getRatingValue(questionId: number): number {
    return this.ratingAnswers[questionId] || 0;
  }

  setRatingValue(questionId: number, value: number): void {
    this.ratingAnswers[questionId] = value;
  }

  validate(): boolean {
    if (!this.survey) return false;

    for (const question of this.survey.questions) {
      if (!question.required) continue;

      if (question.type === 'SINGLE_CHOICE') {
        if (!this.singleChoiceAnswers[question.id]) {
          this.errorMessage = `请回答第 ${question.order} 题：${question.text}`;
          return false;
        }
      } else if (question.type === 'MULTIPLE_CHOICE') {
        if (!this.multipleChoiceAnswers[question.id]?.length) {
          this.errorMessage = `请回答第 ${question.order} 题：${question.text}`;
          return false;
        }
      } else if (question.type === 'TEXT') {
        if (!this.textAnswers[question.id]?.trim()) {
          this.errorMessage = `请回答第 ${question.order} 题：${question.text}`;
          return false;
        }
      } else if (question.type === 'RATING') {
        if (!this.ratingAnswers[question.id]) {
          this.errorMessage = `请回答第 ${question.order} 题：${question.text}`;
          return false;
        }
      }
    }

    return true;
  }

  onSubmit(): void {
    if (!this.survey) return;

    this.errorMessage = '';
    if (!this.validate()) return;

    this.submitting = true;

    const answers: SubmissionAnswer[] = [];

    this.survey.questions.forEach(q => {
      const answer: SubmissionAnswer = {
        questionId: q.id,
        questionType: q.type,
        textValue: null,
        optionId: null,
        optionIds: null,
        ratingValue: null
      };

      if (q.type === 'SINGLE_CHOICE') {
        answer.optionId = this.singleChoiceAnswers[q.id] || null;
      } else if (q.type === 'MULTIPLE_CHOICE') {
        answer.optionIds = this.multipleChoiceAnswers[q.id]?.length ? this.multipleChoiceAnswers[q.id] : null;
      } else if (q.type === 'TEXT') {
        answer.textValue = this.textAnswers[q.id]?.trim() || null;
      } else if (q.type === 'RATING') {
        answer.ratingValue = this.ratingAnswers[q.id] || null;
      }

      answers.push(answer);
    });

    this.surveyService.submitSurvey(this.survey.id, answers).subscribe({
      next: () => {
        this.router.navigate(['/surveys', this.survey?.id, 'thankyou']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || '提交失败，请稍后重试';
      }
    });
  }

  private getMockSurvey(): Survey {
    return {
      id: 1,
      title: '2024年用户满意度调查',
      description: '了解用户对产品的使用体验和满意度，帮助我们持续改进。',
      status: 'PUBLISHED',
      isAnonymous: true,
      deadline: null,
      isTemplate: false,
      responseCount: 156,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      createdBy: 1,
      questions: [
        {
          id: 1,
          text: '您对我们产品的整体满意度如何？',
          type: 'SINGLE_CHOICE',
          required: true,
          order: 1,
          options: [
            { id: 1, text: '非常满意', order: 1 },
            { id: 2, text: '满意', order: 2 },
            { id: 3, text: '一般', order: 3 },
            { id: 4, text: '不满意', order: 4 },
            { id: 5, text: '非常不满意', order: 5 }
          ]
        },
        {
          id: 2,
          text: '您使用过我们产品的哪些功能？（可多选）',
          type: 'MULTIPLE_CHOICE',
          required: true,
          order: 2,
          options: [
            { id: 6, text: '用户管理', order: 1 },
            { id: 7, text: '数据分析', order: 2 },
            { id: 8, text: '报表生成', order: 3 }
          ]
        },
        {
          id: 3,
          text: '您对产品有什么建议或意见？',
          type: 'TEXT',
          required: false,
          order: 3,
          options: []
        },
        {
          id: 4,
          text: '请为我们的客服服务打分',
          type: 'RATING',
          required: true,
          order: 4,
          options: []
        }
      ]
    };
  }
}
