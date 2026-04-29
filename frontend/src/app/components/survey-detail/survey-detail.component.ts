import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SurveyService } from '../../services/survey.service';
import { Survey } from '../../models/survey.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading) {
      <div class="card" style="text-align: center; padding: 40px;">
        <span class="loading"></span>
        <p style="margin-top: 16px; color: var(--text-secondary);">加载中...</p>
      </div>
    } @else if (survey) {
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 class="card-title" style="font-size: 24px;">{{ survey.title }}</h1>
            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
              发布于 {{ formatDate(survey.createdAt) }} · {{ survey.responseCount }} 份回答
            </p>
          </div>
          <span class="badge" [class]="getStatusBadgeClass(survey.status)">{{ getStatusText(survey.status) }}</span>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">问卷描述</h3>
          <p style="color: var(--text-secondary); line-height: 1.8;">{{ survey.description }}</p>
        </div>
        
        <div class="divider"></div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">问卷信息</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div class="card" style="padding: 16px; margin: 0;">
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">匿名填写</div>
              <div style="font-size: 16px; font-weight: 600;">
                {{ survey.isAnonymous ? '✅ 支持匿名填写' : '❌ 需要登录填写' }}
              </div>
            </div>
            <div class="card" style="padding: 16px; margin: 0;">
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">截止时间</div>
              <div style="font-size: 16px; font-weight: 600;">
                {{ survey.deadline ? formatDate(survey.deadline) : '无截止时间' }}
              </div>
            </div>
            <div class="card" style="padding: 16px; margin: 0;">
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">题目数量</div>
              <div style="font-size: 16px; font-weight: 600;">
                {{ survey.questions.length }} 题
              </div>
            </div>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">题目预览</h3>
          
          @for (question of survey.questions; track question.id; let i = $index) {
            <div class="card" style="margin-bottom: 16px; padding: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                <span style="background: var(--primary-color); color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 600; flex-shrink: 0;">
                  第{{ i + 1 }}题
                </span>
                <span class="badge" [class]="getQuestionTypeBadgeClass(question.type)">{{ getQuestionTypeText(question.type) }}</span>
                @if (question.required) {
                  <span class="badge badge-danger">必填</span>
                }
              </div>
              <div style="font-size: 15px; font-weight: 500; margin-bottom: 12px;">
                {{ question.text }}
              </div>
              
              @if (question.options && question.options.length > 0) {
                <div style="padding-left: 28px;">
                  @for (option of question.options; track option.id; let optIndex = $index) {
                    <div style="font-size: 14px; color: var(--text-secondary); padding: 4px 0;">
                      {{ String.fromCharCode(65 + optIndex) }}. {{ option.text }}
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
        
        <div style="display: flex; gap: 12px;">
          @if (survey.status === 'PUBLISHED' && !isDeadlinePassed(survey.deadline)) {
            <a [routerLink]="['/surveys', survey.id, 'submit']" class="btn btn-primary btn-lg">开始填写问卷</a>
          } @else if (survey.status === 'CLOSED') {
            <div class="alert alert-warning" style="flex: 1;">
              该问卷已关闭，无法继续填写
            </div>
          } @else if (isDeadlinePassed(survey.deadline)) {
            <div class="alert alert-warning" style="flex: 1;">
              该问卷已过截止时间，无法继续填写
            </div>
          }
          
          @if (authService.isAuthenticated()) {
            <button (click)="toggleFavorite()" class="btn btn-secondary btn-lg">
              {{ isFavorited ? '❤️ 已收藏' : '🤍 收藏' }}
            </button>
          }
          
          <a routerLink="/surveys" class="btn btn-secondary btn-lg">返回列表</a>
        </div>
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
export class SurveyDetailComponent implements OnInit {
  survey: Survey | null = null;
  loading = true;
  isFavorited = false;

  constructor(
    private route: ActivatedRoute,
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
        this.loading = false;
      },
      error: () => {
        this.survey = this.getMockSurvey();
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

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isDeadlinePassed(deadline: string | null): boolean {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  }

  toggleFavorite(): void {
    if (!this.survey) return;
    
    if (this.isFavorited) {
      this.surveyService.removeFavorite(this.survey.id).subscribe({
        next: () => {
          this.isFavorited = false;
        }
      });
    } else {
      this.surveyService.addFavorite(this.survey.id).subscribe({
        next: () => {
          this.isFavorited = true;
        }
      });
    }
  }

  private getMockSurvey(): Survey {
    return {
      id: 1,
      title: '2024年用户满意度调查',
      description: '了解用户对产品的使用体验和满意度，帮助我们持续改进产品功能和服务质量。您的反馈对我们非常重要，本次调查预计需要3-5分钟完成。',
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
            { id: 8, text: '报表生成', order: 3 },
            { id: 9, text: '消息通知', order: 4 },
            { id: 10, text: '其他', order: 5 }
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
