import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../../services/survey.service';
import { SurveySummary } from '../../models/survey.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <h1 class="page-title">欢迎使用问集</h1>
      <p class="page-subtitle">专业的在线调查问卷平台，支持学术调研、市场研究等多种场景</p>
    </div>

    <div class="card" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; border: none;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 40px;">
        <div>
          <h2 style="font-size: 24px; margin-bottom: 12px; font-weight: 600;">开始创建您的问卷</h2>
          <p style="font-size: 16px; opacity: 0.9; margin-bottom: 20px;">
            简单易用的问卷设计，丰富的题型选择，强大的数据分析能力。
          </p>
          <div class="btn-group">
            @if (authService.isAuthenticated()) {
              @if (authService.isAdmin()) {
                <a routerLink="/admin/surveys/new" class="btn btn-lg" style="background: white; color: #3b82f6;">创建问卷</a>
              }
              <a routerLink="/surveys" class="btn btn-lg" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);">浏览问卷</a>
            } @else {
              <a routerLink="/register" class="btn btn-lg" style="background: white; color: #3b82f6;">免费注册</a>
              <a routerLink="/surveys" class="btn btn-lg" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);">浏览问卷</a>
            }
          </div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 64px; margin-bottom: 8px;">📋</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 40px 0;">
      <div class="card" style="text-align: center;">
        <div style="font-size: 40px; margin-bottom: 16px;">✨</div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">简单易用</h3>
        <p style="font-size: 14px; color: var(--text-secondary);">直观的问卷设计界面，拖拽式操作，无需编程基础即可创建专业问卷。</p>
      </div>
      <div class="card" style="text-align: center;">
        <div style="font-size: 40px; margin-bottom: 16px;">🔒</div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">匿名填写</h3>
        <p style="font-size: 14px; color: var(--text-secondary);">支持匿名填写选项，保护受访者隐私，获取更真实的反馈数据。</p>
      </div>
      <div class="card" style="text-align: center;">
        <div style="font-size: 40px; margin-bottom: 16px;">📊</div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">数据分析</h3>
        <p style="font-size: 14px; color: var(--text-secondary);">实时数据统计，可视化图表展示，支持CSV/Excel导出，便于深入分析。</p>
      </div>
    </div>

    @if (featuredSurveys.length > 0) {
      <div class="page-header" style="margin-top: 40px;">
        <h2 class="page-title" style="font-size: 22px;">热门问卷</h2>
      </div>
      
      <div class="survey-list">
        @for (survey of featuredSurveys; track survey.id) {
          <div class="survey-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <h3 class="survey-card-title">
                <a [routerLink]="['/surveys', survey.id]" style="color: inherit;">{{ survey.title }}</a>
              </h3>
              <span class="badge" [class]="getStatusBadgeClass(survey.status)">{{ getStatusText(survey.status) }}</span>
            </div>
            <p class="survey-card-description">{{ survey.description }}</p>
            <div class="survey-card-meta">
              <span class="survey-card-meta-item">👤 {{ survey.createdBy }}</span>
              <span class="survey-card-meta-item">📝 {{ survey.responseCount }} 份回答</span>
              @if (survey.deadline) {
                <span class="survey-card-meta-item">⏰ 截止: {{ formatDate(survey.deadline) }}</span>
              }
            </div>
          </div>
        }
      </div>
    }
  `
})
export class HomeComponent implements OnInit {
  featuredSurveys: SurveySummary[] = [];

  constructor(
    private surveyService: SurveyService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadFeaturedSurveys();
  }

  loadFeaturedSurveys(): void {
    this.surveyService.getPublicSurveys().subscribe({
      next: (surveys) => {
        this.featuredSurveys = surveys.slice(0, 5);
      },
      error: () => {
        this.featuredSurveys = this.getMockFeaturedSurveys();
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'DRAFT': '草稿',
      'PUBLISHED': '已发布',
      'CLOSED': '已关闭'
    };
    return statusMap[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'DRAFT': 'badge-secondary',
      'PUBLISHED': 'badge-success',
      'CLOSED': 'badge-danger'
    };
    return classMap[status] || 'badge-secondary';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  }

  private getMockFeaturedSurveys(): SurveySummary[] {
    return [
      {
        id: 1,
        title: '2024年用户满意度调查',
        description: '了解用户对产品的使用体验和满意度，帮助我们持续改进。',
        status: 'PUBLISHED',
        isAnonymous: true,
        deadline: null,
        isTemplate: false,
        responseCount: 156,
        createdAt: '2024-01-15T00:00:00Z',
        createdBy: '产品团队'
      },
      {
        id: 2,
        title: '市场消费行为调研',
        description: '调研消费者在数字时代的购物习惯和偏好变化。',
        status: 'PUBLISHED',
        isAnonymous: true,
        deadline: '2024-12-31T23:59:59Z',
        isTemplate: false,
        responseCount: 89,
        createdAt: '2024-02-01T00:00:00Z',
        createdBy: '市场部'
      }
    ];
  }
}
