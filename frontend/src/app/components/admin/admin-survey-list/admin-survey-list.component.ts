import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SurveyService } from '../../../services/survey.service';
import { SurveySummary } from '../../../models/survey.model';

@Component({
  selector: 'app-admin-survey-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 class="page-title">问卷管理</h1>
        <p class="page-subtitle">管理所有问卷，包括创建、编辑、发布和查看结果</p>
      </div>
      <div class="btn-group">
        <a routerLink="/surveys" class="btn btn-secondary">浏览公开问卷</a>
        <a routerLink="/admin/surveys/new" class="btn btn-primary">+ 创建问卷</a>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">{{ surveys.length }}</div>
        <div class="stat-label">总问卷数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--success-color);">{{ publishedCount }}</div>
        <div class="stat-label">已发布</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--text-muted);">{{ draftCount }}</div>
        <div class="stat-label">草稿</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--danger-color);">{{ closedCount }}</div>
        <div class="stat-label">已关闭</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <input type="text" [(ngModel)]="searchTerm" placeholder="搜索问卷..." class="form-control" style="max-width: 300px;">
        <select [(ngModel)]="filterStatus" class="form-control" style="max-width: 150px;">
          <option value="">全部状态</option>
          <option value="DRAFT">草稿</option>
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
        <p class="empty-state-text">点击上方按钮创建您的第一个问卷</p>
        <a routerLink="/admin/surveys/new" class="btn btn-primary" style="margin-top: 16px;">创建问卷</a>
      </div>
    } @else {
      <div class="card">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>问卷名称</th>
                <th>状态</th>
                <th>回复数</th>
                <th>创建时间</th>
                <th>截止时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              @for (survey of filteredSurveys; track survey.id) {
                <tr>
                  <td>
                    <div style="display: flex; flex-direction: column;">
                      <a [routerLink]="['/admin/surveys', survey.id, 'edit']" style="font-weight: 600; color: var(--text-primary);">
                        {{ survey.title }}
                      </a>
                      <span style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                        @if (survey.isAnonymous) {
                          <span class="badge badge-secondary" style="margin-right: 8px;">🔒 匿名</span>
                        }
                        @if (survey.isTemplate) {
                          <span class="badge badge-primary">📋 模板</span>
                        }
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(survey.status)">
                      {{ getStatusText(survey.status) }}
                    </span>
                  </td>
                  <td>{{ survey.responseCount }}</td>
                  <td>{{ formatDate(survey.createdAt) }}</td>
                  <td>
                    @if (survey.deadline) {
                      <span [class]="isDeadlinePassed(survey.deadline) ? 'text-danger' : ''">
                        {{ formatDate(survey.deadline) }}
                      </span>
                    } @else {
                      <span style="color: var(--text-muted);">无</span>
                    }
                  </td>
                  <td>
                    <div class="actions" style="flex-wrap: wrap; gap: 6px;">
                      <a [routerLink]="['/surveys', survey.id]" class="btn btn-secondary btn-sm">预览</a>
                      <a [routerLink]="['/admin/surveys', survey.id, 'edit']" class="btn btn-primary btn-sm">编辑</a>
                      
                      @if (survey.status === 'DRAFT') {
                        <button (click)="publishSurvey(survey)" class="btn btn-success btn-sm">发布</button>
                      }
                      @if (survey.status === 'PUBLISHED') {
                        <button (click)="closeSurvey(survey)" class="btn btn-warning btn-sm">关闭</button>
                      }
                      
                      @if (survey.status !== 'DRAFT') {
                        <a [routerLink]="['/admin/surveys', survey.id, 'results']" class="btn btn-primary btn-sm">结果</a>
                      }
                      
                      <button (click)="copySurvey(survey)" class="btn btn-secondary btn-sm">复制</button>
                      <button (click)="confirmDelete(survey)" class="btn btn-danger btn-sm">删除</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }

    @if (showDeleteModal) {
      <div class="modal-overlay" (click)="cancelDelete()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">确认删除</h3>
            <button class="modal-close" (click)="cancelDelete()">×</button>
          </div>
          <div class="modal-body">
            <p>确定要删除问卷 <strong>"{{ surveyToDelete?.title }}"</strong> 吗？</p>
            <p style="margin-top: 12px; color: var(--danger-color); font-size: 14px;">
              ⚠️ 此操作不可撤销，所有收集的数据也将被删除。
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancelDelete()">取消</button>
            <button class="btn btn-danger" (click)="deleteSurvey()">确认删除</button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminSurveyListComponent implements OnInit {
  surveys: SurveySummary[] = [];
  filteredSurveys: SurveySummary[] = [];
  searchTerm = '';
  filterStatus = '';
  loading = true;

  showDeleteModal = false;
  surveyToDelete: SurveySummary | null = null;

  get publishedCount(): number {
    return this.surveys.filter(s => s.status === 'PUBLISHED').length;
  }

  get draftCount(): number {
    return this.surveys.filter(s => s.status === 'DRAFT').length;
  }

  get closedCount(): number {
    return this.surveys.filter(s => s.status === 'CLOSED').length;
  }

  constructor(private surveyService: SurveyService) { }

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys(): void {
    this.loading = true;
    this.surveyService.getAdminSurveys().subscribe({
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

  publishSurvey(survey: SurveySummary): void {
    this.surveyService.publishSurvey(survey.id).subscribe({
      next: () => {
        survey.status = 'PUBLISHED';
      }
    });
  }

  closeSurvey(survey: SurveySummary): void {
    this.surveyService.closeSurvey(survey.id).subscribe({
      next: () => {
        survey.status = 'CLOSED';
      }
    });
  }

  copySurvey(survey: SurveySummary): void {
    const newTitle = prompt('请输入新问卷标题：', survey.title + ' (副本)');
    if (newTitle && newTitle.trim()) {
      this.surveyService.copySurvey(survey.id, newTitle.trim()).subscribe({
        next: (newSurvey) => {
          this.loadSurveys();
        }
      });
    }
  }

  confirmDelete(survey: SurveySummary): void {
    this.surveyToDelete = survey;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.surveyToDelete = null;
  }

  deleteSurvey(): void {
    if (!this.surveyToDelete) return;

    this.surveyService.deleteSurvey(this.surveyToDelete.id).subscribe({
      next: () => {
        this.surveys = this.surveys.filter(s => s.id !== this.surveyToDelete!.id);
        this.applyFilters();
        this.cancelDelete();
      }
    });
  }

  private getMockSurveys(): SurveySummary[] {
    return [
      {
        id: 1,
        title: '2024年用户满意度调查',
        description: '了解用户对产品的使用体验和满意度。',
        status: 'PUBLISHED',
        isAnonymous: true,
        isTemplate: false,
        deadline: null,
        responseCount: 156,
        createdAt: '2024-01-15T00:00:00Z',
        createdBy: '管理员'
      },
      {
        id: 2,
        title: '市场消费行为调研',
        description: '调研消费者在数字时代的购物习惯。',
        status: 'PUBLISHED',
        isAnonymous: true,
        isTemplate: false,
        deadline: '2024-12-31T23:59:59Z',
        responseCount: 89,
        createdAt: '2024-02-01T00:00:00Z',
        createdBy: '管理员'
      },
      {
        id: 3,
        title: '员工满意度调查',
        description: '了解员工对公司的满意度。',
        status: 'DRAFT',
        isAnonymous: true,
        isTemplate: false,
        deadline: null,
        responseCount: 0,
        createdAt: '2024-03-01T00:00:00Z',
        createdBy: '管理员'
      },
      {
        id: 4,
        title: '客户反馈问卷模板',
        description: '通用的客户反馈问卷模板。',
        status: 'PUBLISHED',
        isAnonymous: true,
        isTemplate: true,
        deadline: null,
        responseCount: 0,
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: '系统'
      }
    ];
  }
}
