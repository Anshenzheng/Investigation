import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { SurveySummary } from '../../models/survey.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1 class="page-title">收藏夹</h1>
      <p class="page-subtitle">您收藏的问卷列表</p>
    </div>

    @if (loading) {
      <div class="card" style="text-align: center; padding: 40px;">
        <span class="loading"></span>
        <p style="margin-top: 16px; color: var(--text-secondary);">加载中...</p>
      </div>
    } @else if (favorites.length === 0) {
      <div class="empty-state">
        <div class="empty-state-icon">❤️</div>
        <h3 class="empty-state-title">暂无收藏</h3>
        <p class="empty-state-text">您还没有收藏任何问卷</p>
        <a routerLink="/surveys" class="btn btn-primary" style="margin-top: 16px;">浏览问卷</a>
      </div>
    } @else {
      <div class="survey-list">
        @for (survey of favorites; track survey.id) {
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
            <div style="margin-top: 16px; display: flex; gap: 12px;">
              @if (survey.status === 'PUBLISHED' && !isDeadlinePassed(survey.deadline)) {
                <a [routerLink]="['/surveys', survey.id, 'submit']" class="btn btn-primary btn-sm">填写问卷</a>
              }
              <a [routerLink]="['/surveys', survey.id]" class="btn btn-secondary btn-sm">查看详情</a>
              <button (click)="removeFavorite(survey)" class="btn btn-danger btn-sm">
                取消收藏
              </button>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class FavoritesComponent implements OnInit {
  favorites: SurveySummary[] = [];
  loading = true;

  constructor(private surveyService: SurveyService) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.surveyService.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites = favorites;
        this.loading = false;
      },
      error: () => {
        this.favorites = this.getMockFavorites();
        this.loading = false;
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

  isDeadlinePassed(deadline: string | null): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  }

  removeFavorite(survey: SurveySummary): void {
    this.surveyService.removeFavorite(survey.id).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.id !== survey.id);
      },
      error: () => {
        this.favorites = this.favorites.filter(f => f.id !== survey.id);
      }
    });
  }

  private getMockFavorites(): SurveySummary[] {
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
