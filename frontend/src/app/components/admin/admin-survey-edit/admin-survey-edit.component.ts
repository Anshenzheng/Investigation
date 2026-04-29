import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { SurveyService, SurveyCreateRequest, SurveyUpdateRequest, QuestionCreateRequest, OptionCreateRequest } from '../../../services/survey.service';
import { Survey, QuestionType } from '../../../models/survey.model';

@Component({
  selector: 'app-admin-survey-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 class="page-title">{{ isEdit ? '编辑问卷' : '创建问卷' }}</h1>
        <p class="page-subtitle">{{ isEdit ? '修改问卷内容和设置' : '设计您的调查问卷' }}</p>
      </div>
      <div class="btn-group">
        <button (click)="saveDraft()" class="btn btn-secondary" [disabled]="saving">
          {{ saving ? '保存中...' : '保存草稿' }}
        </button>
        <button (click)="saveAndPublish()" class="btn btn-success" [disabled]="saving">
          {{ saving ? '发布中...' : '保存并发布' }}
        </button>
        <a routerLink="/admin/surveys" class="btn btn-secondary">取消</a>
      </div>
    </div>

    @if (errorMessage) {
      <div class="alert alert-error">{{ errorMessage }}</div>
    }

    <form [formGroup]="surveyForm">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">基本信息</h2>
        </div>
        
        <div class="form-group">
          <label class="form-label">问卷标题 <span style="color: var(--danger-color);">*</span></label>
          <input type="text" formControlName="title" class="form-control" placeholder="请输入问卷标题"
                 [class.error]="submitted && surveyForm.get('title')?.invalid">
          @if (submitted && surveyForm.get('title')?.invalid) {
            <div class="error-message">请输入问卷标题</div>
          }
        </div>
        
        <div class="form-group">
          <label class="form-label">问卷描述</label>
          <textarea formControlName="description" class="form-control" placeholder="请输入问卷描述（可选）" rows="3"></textarea>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
          <div class="form-group">
            <label class="checkbox-wrapper">
              <input type="checkbox" formControlName="isAnonymous">
              <span style="font-weight: 500;">允许匿名填写</span>
            </label>
            <p class="form-text">勾选后，受访者可以匿名填写，身份信息不会被记录</p>
          </div>
          
          <div class="form-group">
            <label class="checkbox-wrapper">
              <input type="checkbox" formControlName="isTemplate">
              <span style="font-weight: 500;">设为模板</span>
            </label>
            <p class="form-text">勾选后，其他用户可以以此问卷为模板快速创建</p>
          </div>
          
          <div class="form-group">
            <label class="form-label">截止时间</label>
            <input type="datetime-local" formControlName="deadline" class="form-control">
            <p class="form-text">留空表示无截止时间</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2 class="card-title">题目设计</h2>
          <div class="btn-group">
            <button type="button" (click)="addQuestion('SINGLE_CHOICE')" class="btn btn-secondary btn-sm">+ 单选题</button>
            <button type="button" (click)="addQuestion('MULTIPLE_CHOICE')" class="btn btn-secondary btn-sm">+ 多选题</button>
            <button type="button" (click)="addQuestion('TEXT')" class="btn btn-secondary btn-sm">+ 填空题</button>
            <button type="button" (click)="addQuestion('RATING')" class="btn btn-secondary btn-sm">+ 评分题</button>
          </div>
        </div>
        
        <div formArrayName="questions">
          @if (questions.length === 0) {
            <div class="empty-state" style="border: 2px dashed var(--border-color); border-radius: var(--border-radius);">
              <div class="empty-state-icon">❓</div>
              <h3 class="empty-state-title">暂无题目</h3>
              <p class="empty-state-text">点击上方按钮添加题目</p>
            </div>
          } @else {
            @for (question of questions.controls; track i; let i = $index) {
              <div [formGroupName]="i" class="card" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="background: var(--primary-color); color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 600;">
                      第{{ i + 1 }}题
                    </span>
                    <select formControlName="type" class="form-control" style="width: auto; padding: 6px 12px; font-size: 13px;">
                      <option value="SINGLE_CHOICE">单选题</option>
                      <option value="MULTIPLE_CHOICE">多选题</option>
                      <option value="TEXT">填空题</option>
                      <option value="RATING">评分题</option>
                    </select>
                    <label class="checkbox-wrapper" style="margin: 0;">
                      <input type="checkbox" formControlName="required">
                      <span style="font-size: 13px;">必填</span>
                    </label>
                  </div>
                  <button type="button" (click)="removeQuestion(i)" class="btn btn-danger btn-sm" [disabled]="questions.length <= 1">
                    删除
                  </button>
                </div>
                
                <div class="form-group" style="margin-bottom: 16px;">
                  <input type="text" formControlName="text" class="form-control" placeholder="请输入题目内容">
                </div>
                
                @if (question.value.type === 'SINGLE_CHOICE' || question.value.type === 'MULTIPLE_CHOICE') {
                  <div style="padding-left: 16px;">
                    <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">选项：</div>
                    <div formArrayName="options">
                      @for (option of getOptions(i).controls; track optIdx; let optIdx = $index) {
                        <div [formGroupName]="optIdx" style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                          <span style="font-size: 14px; color: var(--text-secondary); width: 24px; flex-shrink: 0;">
                            {{ String.fromCharCode(65 + optIdx) }}.
                          </span>
                          <input type="text" formControlName="text" class="form-control" placeholder="选项内容">
                          <button type="button" (click)="removeOption(i, optIdx)" class="btn btn-danger btn-sm" 
                                  [disabled]="getOptions(i).length <= 1">
                            ×
                          </button>
                        </div>
                      }
                    </div>
                    <button type="button" (click)="addOption(i)" class="btn btn-secondary btn-sm" style="margin-top: 8px;">
                      + 添加选项
                    </button>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </form>
  `
})
export class AdminSurveyEditComponent implements OnInit {
  surveyForm: FormGroup;
  isEdit = false;
  surveyId: number | null = null;
  survey: Survey | null = null;
  saving = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private surveyService: SurveyService
  ) {
    this.surveyForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      isAnonymous: [true],
      isTemplate: [false],
      deadline: [''],
      questions: this.fb.array([])
    });
  }

  get questions(): FormArray {
    return this.surveyForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.params['id'];
    this.isEdit = !!this.surveyId;

    if (this.isEdit && this.surveyId) {
      this.loadSurvey(this.surveyId);
    } else {
      this.addQuestion('SINGLE_CHOICE');
    }
  }

  loadSurvey(id: number): void {
    this.surveyService.getSurvey(id).subscribe({
      next: (survey) => {
        this.survey = survey;
        this.surveyForm.patchValue({
          title: survey.title,
          description: survey.description,
          isAnonymous: survey.isAnonymous,
          isTemplate: survey.isTemplate,
          deadline: survey.deadline ? this.formatDateTimeLocal(survey.deadline) : ''
        });

        this.questions.clear();
        survey.questions.forEach(q => {
          this.questions.push(this.createQuestionGroup(q));
        });
      },
      error: () => {
        this.addQuestion('SINGLE_CHOICE');
      }
    });
  }

  private formatDateTimeLocal(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private createQuestionGroup(question?: any): FormGroup {
    const options = question?.options || [];
    const optionsArray = this.fb.array(
      options.map((opt: any) => this.fb.group({
        id: [opt.id || null],
        text: [opt.text || ''],
        order: [opt.order || 0]
      }))
    );

    if (optionsArray.length === 0 && (question?.type === 'SINGLE_CHOICE' || question?.type === 'MULTIPLE_CHOICE')) {
      optionsArray.push(this.fb.group({ id: [null], text: ['选项A'], order: [0] }));
      optionsArray.push(this.fb.group({ id: [null], text: ['选项B'], order: [1] }));
    }

    return this.fb.group({
      id: [question?.id || null],
      text: [question?.text || '', Validators.required],
      type: [question?.type || 'SINGLE_CHOICE'],
      required: [question?.required ?? true],
      order: [question?.order || 0],
      options: optionsArray
    });
  }

  addQuestion(type: QuestionType): void {
    const newQuestion = this.createQuestionGroup({
      type,
      text: '',
      required: true,
      order: this.questions.length
    });
    this.questions.push(newQuestion);
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  addOption(questionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.push(this.fb.group({
      id: [null],
      text: [''],
      order: [options.length]
    }));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);
    if (options.length > 1) {
      options.removeAt(optionIndex);
    }
  }

  private prepareSaveData(): SurveyCreateRequest | SurveyUpdateRequest {
    const formValue = this.surveyForm.value;
    const questions: QuestionCreateRequest[] = formValue.questions.map((q: any, index: number) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      required: q.required,
      order: index,
      options: q.options.map((opt: any, optIndex: number) => ({
        id: opt.id,
        text: opt.text,
        order: optIndex
      }))
    }));

    const data: any = {
      title: formValue.title,
      description: formValue.description,
      isAnonymous: formValue.isAnonymous,
      isTemplate: formValue.isTemplate,
      deadline: formValue.deadline || null,
      questions
    };

    return data;
  }

  saveDraft(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.surveyForm.get('title')?.invalid) {
      this.errorMessage = '请输入问卷标题';
      return;
    }

    this.saving = true;
    const data = this.prepareSaveData();

    if (this.isEdit && this.surveyId) {
      this.surveyService.updateSurvey(this.surveyId, data as SurveyUpdateRequest).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/admin/surveys']);
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || '保存失败';
        }
      });
    } else {
      this.surveyService.createSurvey(data as SurveyCreateRequest).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/admin/surveys']);
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || '创建失败';
        }
      });
    }
  }

  saveAndPublish(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.surveyForm.invalid) {
      this.errorMessage = '请完善问卷信息';
      return;
    }

    if (this.questions.length === 0) {
      this.errorMessage = '请至少添加一个题目';
      return;
    }

    this.saving = true;
    const data = this.prepareSaveData();

    const saveAndPublishLogic = (surveyId?: number) => {
      const id = surveyId || this.surveyId;
      if (id) {
        this.surveyService.publishSurvey(id).subscribe({
          next: () => {
            this.saving = false;
            this.router.navigate(['/admin/surveys']);
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage = err.error?.message || '发布失败';
          }
        });
      }
    };

    if (this.isEdit && this.surveyId) {
      this.surveyService.updateSurvey(this.surveyId, data as SurveyUpdateRequest).subscribe({
        next: () => saveAndPublishLogic(),
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || '保存失败';
        }
      });
    } else {
      this.surveyService.createSurvey(data as SurveyCreateRequest).subscribe({
        next: (survey) => saveAndPublishLogic(survey.id),
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || '创建失败';
        }
      });
    }
  }
}
