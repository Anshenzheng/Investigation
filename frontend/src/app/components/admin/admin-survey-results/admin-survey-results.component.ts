import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../../services/survey.service';
import { Survey, SurveyStatistics, QuestionStatistic, QuestionType } from '../../../models/survey.model';

@Component({
  selector: 'app-admin-survey-results',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading) {
      <div class="card" style="text-align: center; padding: 40px;">
        <span class="loading"></span>
        <p style="margin-top: 16px; color: var(--text-secondary);">加载中...</p>
      </div>
    } @else {
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 class="page-title">结果统计</h1>
          <p class="page-subtitle">{{ survey?.title }}</p>
        </div>
        <div class="btn-group">
          <button (click)="exportResults('csv')" class="btn btn-secondary">导出 CSV</button>
          <button (click)="exportResults('excel')" class="btn btn-secondary">导出 Excel</button>
          <a [routerLink]="['/admin/surveys']" class="btn btn-secondary">返回列表</a>
        </div>
      </div>

      @if (statistics && statistics.totalResponses === 0) {
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <h3 class="empty-state-title">暂无数据</h3>
          <p class="empty-state-text">该问卷还没有收到任何回复</p>
        </div>
      } @else if (statistics) {
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.totalResponses }}</div>
            <div class="stat-label">总回复数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistics.questionStats.length }}</div>
            <div class="stat-label">题目数</div>
          </div>
        </div>

        @for (stat of statistics.questionStats; track stat.questionId; let i = $index) {
          <div class="chart-container">
            <h3 class="chart-title">
              <span style="background: var(--primary-color); color: white; padding: 2px 10px; border-radius: 4px; font-size: 14px; margin-right: 8px;">
                第{{ i + 1 }}题
              </span>
              {{ stat.questionText }}
              <span class="badge" [class]="getQuestionTypeBadgeClass(stat.questionType)" style="margin-left: 8px;">
                {{ getQuestionTypeText(stat.questionType) }}
              </span>
            </h3>

            @if (stat.questionType === 'SINGLE_CHOICE' || stat.questionType === 'MULTIPLE_CHOICE') {
              @if (stat.optionCounts) {
                <div class="bar-chart">
                  @for (entry of getOptionCountEntries(stat.optionCounts); track entry.optionId) {
                    <div class="bar-item" style="flex: 1;">
                      <div style="position: relative; height: 100%; display: flex; align-items: flex-end; justify-content: center;">
                        <div class="bar" [style.height.%]="getBarHeight(entry.count, stat.optionCounts!)"></div>
                      </div>
                      <div class="bar-value">{{ entry.count }}</div>
                      <div class="bar-label">{{ getOptionText(i, entry.optionId) }}</div>
                    </div>
                  }
                </div>

                <div class="card" style="margin-top: 20px; padding: 16px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">详细数据</h4>
                  <div class="table-responsive">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>选项</th>
                          <th>数量</th>
                          <th>占比</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (entry of getOptionCountEntries(stat.optionCounts); track entry.optionId) {
                          <tr>
                            <td>{{ getOptionText(i, entry.optionId) }}</td>
                            <td>{{ entry.count }}</td>
                            <td>{{ getPercentage(entry.count, statistics!.totalResponses) }}%</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            }

            @if (stat.questionType === 'TEXT') {
              @if (stat.textAnswers && stat.textAnswers.length > 0) {
                <div class="card" style="padding: 16px;">
                  <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">
                    收到 {{ stat.textAnswers.length }} 条回答
                  </h4>
                  <div style="display: flex; flex-direction: column; gap: 12px;">
                    @for (answer of stat.textAnswers; track answer) {
                      <div style="background: var(--bg-tertiary); padding: 12px 16px; border-radius: var(--border-radius);">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6;">{{ answer }}</p>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <p style="color: var(--text-secondary);">暂无文字回答</p>
              }
            }

            @if (stat.questionType === 'RATING') {
              @if (stat.ratingDistribution) {
                <div class="bar-chart">
                  @for (rating of [1,2,3,4,5]; track rating) {
                    <div class="bar-item">
                      <div style="position: relative; height: 100%; display: flex; align-items: flex-end; justify-content: center;">
                        <div class="bar" [style.height.%]="getRatingBarHeight(rating, stat.ratingDistribution!)"></div>
                      </div>
                      <div class="bar-value">{{ stat.ratingDistribution![rating] || 0 }}</div>
                      <div class="bar-label">
                        <span style="color: #fbbf24;">★</span> {{ rating }}分
                      </div>
                    </div>
                  }
                </div>

                @if (stat.ratingAverage !== null) {
                  <div class="card" style="margin-top: 20px; padding: 16px; text-align: center;">
                    <div style="font-size: 48px; color: #fbbf24; margin-bottom: 8px;">
                      ★★★★★
                    </div>
                    <div style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
                      {{ stat.ratingAverage.toFixed(1) }}
                    </div>
                    <div style="font-size: 14px; color: var(--text-secondary);">
                      平均评分
                    </div>
                  </div>
                }
              }
            }
          </div>
        }
      }
    }
  `
})
export class AdminSurveyResultsComponent implements OnInit {
  survey: Survey | null = null;
  statistics: SurveyStatistics | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private surveyService: SurveyService
  ) { }

  ngOnInit(): void {
    const surveyId = this.route.snapshot.params['id'];
    if (surveyId) {
      this.loadData(+surveyId);
    }
  }

  loadData(id: number): void {
    this.loading = true;
    
    this.surveyService.getSurvey(id).subscribe({
      next: (survey) => {
        this.survey = survey;
      }
    });

    this.surveyService.getSurveyResults(id).subscribe({
      next: (stats) => {
        this.statistics = stats;
        this.loading = false;
      },
      error: () => {
        this.statistics = this.getMockStatistics();
        this.survey = this.getMockSurvey();
        this.loading = false;
      }
    });
  }

  getQuestionTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'SINGLE_CHOICE': '单选题',
      'MULTIPLE_CHOICE': '多选题',
      'TEXT': '填空题',
      'RATING': '评分题'
    };
    return typeMap[type] || type;
  }

  getQuestionTypeBadgeClass(type: string): string {
    const classMap: { [key: string]: string } = {
      'SINGLE_CHOICE': 'badge-primary',
      'MULTIPLE_CHOICE': 'badge-warning',
      'TEXT': 'badge-secondary',
      'RATING': 'badge-success'
    };
    return classMap[type] || 'badge-secondary';
  }

  getOptionCountEntries(optionCounts: { [key: number]: number }): { optionId: number; count: number }[] {
    return Object.entries(optionCounts).map(([key, value]) => ({
      optionId: +key,
      count: value
    }));
  }

  getOptionText(questionIndex: number, optionId: number): string {
    if (!this.survey || !this.survey.questions[questionIndex]) {
      return `选项 ${optionId}`;
    }
    const option = this.survey.questions[questionIndex].options.find(o => o.id === optionId);
    return option?.text || `选项 ${optionId}`;
  }

  getBarHeight(count: number, optionCounts: { [key: number]: number }): number {
    const maxCount = Math.max(...Object.values(optionCounts));
    if (maxCount === 0) return 0;
    return (count / maxCount) * 100;
  }

  getRatingBarHeight(rating: number, distribution: { [key: number]: number }): number {
    const maxCount = Math.max(...Object.values(distribution));
    const count = distribution[rating] || 0;
    if (maxCount === 0) return 0;
    return (count / maxCount) * 100;
  }

  getPercentage(value: number, total: number): string {
    if (total === 0) return '0';
    return ((value / total) * 100).toFixed(1);
  }

  exportResults(format: 'csv' | 'excel'): void {
    const surveyId = this.route.snapshot.params['id'];
    if (!surveyId) return;

    this.surveyService.exportSurveyResults(+surveyId, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `survey_results_${surveyId}.${format === 'csv' ? 'csv' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    });
  }

  private getMockSurvey(): Survey {
    return {
      id: 1,
      title: '2024年用户满意度调查',
      description: '了解用户对产品的使用体验和满意度。',
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
          text: '您使用过我们产品的哪些功能？',
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

  private getMockStatistics(): SurveyStatistics {
    return {
      totalResponses: 156,
      questionStats: [
        {
          questionId: 1,
          questionText: '您对我们产品的整体满意度如何？',
          questionType: 'SINGLE_CHOICE',
          optionCounts: { 1: 45, 2: 78, 3: 25, 4: 6, 5: 2 },
          textAnswers: null,
          ratingDistribution: null,
          ratingAverage: null
        },
        {
          questionId: 2,
          questionText: '您使用过我们产品的哪些功能？',
          questionType: 'MULTIPLE_CHOICE',
          optionCounts: { 6: 120, 7: 95, 8: 68 },
          textAnswers: null,
          ratingDistribution: null,
          ratingAverage: null
        },
        {
          questionId: 3,
          questionText: '您对产品有什么建议或意见？',
          questionType: 'TEXT',
          optionCounts: null,
          textAnswers: [
            '产品体验很好，希望能增加更多功能。',
            '界面美观，操作简单，非常好用！',
            '数据分析功能很强大，帮助很大。'
          ],
          ratingDistribution: null,
          ratingAverage: null
        },
        {
          questionId: 4,
          questionText: '请为我们的客服服务打分',
          questionType: 'RATING',
          optionCounts: null,
          textAnswers: null,
          ratingDistribution: { 1: 3, 2: 8, 3: 25, 4: 60, 5: 60 },
          ratingAverage: 4.08
        }
      ]
    };
  }
}
