import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SurveyService from '../../services/survey.service';
import { Survey } from '../../models/survey.model';

@Component({
  selector: 'app-survey-thankyou',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="max-width: 600px; margin: 80px auto; text-align: center;">
      <div class="card">
        <div style="font-size: 80px; margin-bottom: 24px;">🎉</div>
        <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">
          感谢您的参与！
        </h1>
        <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 32px; line-height: 1.8;">
          您的问卷已成功提交。感谢您抽出宝贵时间完成 <strong>{{ surveyTitle }}</strong>，
          您的反馈对我们非常重要。
        </p>
        
        <div class="divider"></div>
        
        <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
          @if (survey) {
            <div style="background: var(--bg-tertiary); padding: 16px 24px; border-radius: var(--border-radius); width: 100%;">
              <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">问卷信息</div>
              <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">
                {{ survey.title }}
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
                共 {{ survey.questions.length }} 题 · 已有 {{ survey.responseCount + 1 }} 人参与
              </div>
            </div>
          }
          
          <div style="display: flex; gap: 16px; margin-top: 16px;">
            <a routerLink="/surveys" class="btn btn-primary">浏览更多问卷</a>
            <a routerLink="/" class="btn btn-secondary">返回首页</a>
          </div>
        </div>
      </div>
      
      <div class="card" style="margin-top: 24px;">
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">还可以做什么？</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; text-align: left;">
          <a routerLink="/surveys" class="card" style="margin: 0; padding: 16px; text-decoration: none; color: inherit; transition: all var(--transition);">
            <div style="font-size: 24px; margin-bottom: 8px;">📋</div>
            <div style="font-weight: 600; margin-bottom: 4px;">浏览问卷</div>
            <div style="font-size: 13px; color: var(--text-secondary);">发现更多有趣的问卷</div>
          </a>
          <a routerLink="/favorites" class="card" style="margin: 0; padding: 16px; text-decoration: none; color: inherit; transition: all var(--transition);">
            <div style="font-size: 24px; margin-bottom: 8px;">❤️</div>
            <div style="font-weight: 600; margin-bottom: 4px;">我的收藏</div>
            <div style="font-size: 13px; color: var(--text-secondary);">查看收藏的问卷</div>
          </a>
          <a routerLink="/my-responses" class="card" style="margin: 0; padding: 16px; text-decoration: none; color: inherit; transition: all var(--transition);">
            <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
            <div style="font-weight: 600; margin-bottom: 4px;">我的提交</div>
            <div style="font-size: 13px; color: var(--text-secondary);">查看提交历史</div>
          </a>
        </div>
      </div>
    </div>
  `
})
export class SurveyThankyouComponent implements OnInit {
  survey: Survey | null = null;
  surveyTitle = '此问卷';

  constructor(
    private route: ActivatedRoute,
    private surveyService: SurveyService
  ) { }

  ngOnInit(): void {
    const surveyId = this.route.snapshot.params['id'];
    if (surveyId) {
      this.loadSurvey(+surveyId);
    }
  }

  loadSurvey(id: number): void {
    this.surveyService.getSurvey(id).subscribe({
      next: (survey) => {
        this.survey = survey;
        this.surveyTitle = survey.title;
      },
      error: () => {
        // 使用默认值
      }
    });
  }
}
