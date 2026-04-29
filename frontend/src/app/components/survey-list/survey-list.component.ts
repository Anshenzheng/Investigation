import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../services/survey.service';
import { SurveySummary } from '../../models/survey.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1 class="page-title">问卷列表</h1>
      <p class="page-subtitle">浏览所有公开的调查问卷</p>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; align-items: center;">
        <input type="text" [(ngModel)]="searchTerm" placeholder="搜索问卷..." class="form-control" style="max-width: 300px;">
        <select [(ngModel)]="filterStatus" class="form-control" style="max-width: 150px;">
          <option value="">全部状态</option>
          <option value="PUBLISHED">已发布</option>
          <option value="CLOSED">已关闭</option>
        </select>
      </div>
    </div>

    @if (loading) {
      <div class="card" style="text-align: center; padding: 40px;">
        <span class="loading"></span>
        <p style="margin-top: 16px; color: var(--text-secondary);">加载中...</p>
      </div>
    } @else if (filteredSurveys.length === 0) {
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">暂无问卷</h3>
        <p class="empty-state-text">当前没有符合条件的问卷</p>
      </div>
    } @else {
      <div class="survey-list">
        @for (survey of filteredSurveys; track survey.id) {
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
              @if (survey.isAnonymous) {
                <span class="survey-card-meta-item">🔒 匿名填写</span>
              }
              @if (survey.deadline) {
                <span class="survey-card-meta-item" [class]="isDeadlinePassed(survey.deadline) ? 'text-danger' : ''">
                  ⏰ 截止: {{ formatDate(survey.deadline) }}
                  @if (isDeadlinePassed(survey.deadline)) {
                    (已过期)
                  }
                </span>
              }
            </div>
            <div style="margin-top: 16px; display: flex; gap: 12px;">
              @if (survey.status === 'PUBLISHED' && !isDeadlinePassed(survey.deadline)) {
                <a [routerLink]="['/surveys', survey.id, 'submit']" class="btn btn-primary btn-sm">填写问卷</a>
              }
              <a [routerLink]="['/surveys', survey.id]" class="btn btn-secondary btn-sm">查看详情</a>
              @if (authService.isAuthenticated()) {
                <button (click)="toggleFavorite(survey)" class="btn btn-secondary btn-sm">
                  {{ isFavorited(survey.id) ? '❤️ 已收藏' : '🤍 收藏' }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    }
  `
})
export class SurveyListComponent implements OnInit {
  surveys: SurveySummary[] = [];
  filteredSurveys: SurveySummary[] = [];
  searchTerm = '';
  filterStatus = '';
  loading = true;
  favoriteIds: number[] = [];

  constructor(
    private surveyService: SurveyService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadSurveys();
    if (this.authService.isAuthenticated()) {
      this.loadFavorites();
    }
  }

  loadSurveys(): void {
    this.loading = true;
    this.surveyService.getPublicSurveys().subscribe({
      next: (surveys) => {
        this.surveys = surveys;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.surveys = this.getMockSurveys();
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  loadFavorites(): void {
    this.surveyService.getFavorites().subscribe({
      next: (favorites) => {
        this.favoriteIds = favorites.map(f => f.id);
      },
      error: () => {
        this.favoriteIds = [];
      }
    });
  }

  applyFilters(): void {
    this.filteredSurveys = this.surveys.filter(survey => {
      const matchesSearch = !this.searchTerm || 
        survey.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        survey.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.filterStatus || survey.status === this.filterStatus;
      
      return matchesSearch && matchesStatus;
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

  isDeadlinePassed(deadline: string | null): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  }

  isFavorited(surveyId: number): boolean {
    return this.favoriteIds.includes(surveyId);
  }

  toggleFavorite(survey: SurveySummary): void {
    if (this.isFavorited(survey.id)) {
      this.surveyService.removeFavorite(survey.id).subscribe({
        next: () => {
          this.favoriteIds = this.favoriteIds.filter(id => id !== survey.id);
        },
        error: () => {
          this.favoriteIds = this.favoriteIds.filter(id => id !== survey.id);
        }
      });
    } else {
      this.surveyService.addFavorite(survey.id).subscribe({
        next: () => {
          this.favoriteIds.push(survey.id);
        },
        error: () => {
          this.favoriteIds.push(survey.id);
        }
      });
    }
  }

  private getMockSurveys(): SurveySummary[] {
    return [
      {
        id: 1,
        title: '2024年用户满意度调查',
        description: '了解用户对产品的使用体验和满意度，帮助我们持续改进产品功能和服务质量。',
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
        description: '调研消费者在数字时代的购物习惯和偏好变化，为企业战略决策提供数据支持。',
        status: 'PUBLISHED',
        isAnonymous: true,
        deadline: '2024-12-31T23:59:59Z',
        isTemplate: false,
        responseCount: 89,
        createdAt: '2024-02-01T00:00:00Z',
        createdBy: '市场部'
      },
      {
        id: 3,
        title: '员工满意度调查',
        description: '了解员工对公司工作环境、福利待遇、职业发展等方面的满意度。',
        status: 'CLOSED',
        isAnonymous: true,
        deadline: '2024-03-31T23:59:59Z',
        isTemplate: false,
        responseCount: 234,
        createdAt: '2024-03-01T00:00:00Z',
        createdBy: '人力资源部'
      }
    ];
  }
}
