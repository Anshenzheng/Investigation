import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div style="max-width: 400px; margin: 40px auto;">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title" style="text-align: center; font-size: 24px;">登录问集</h2>
        </div>
        
        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" formControlName="username" class="form-control" placeholder="请输入用户名"
                   [class.error]="submitted && loginForm.get('username')?.invalid">
            @if (submitted && loginForm.get('username')?.invalid) {
              <div class="error-message">请输入用户名</div>
            }
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <input type="password" formControlName="password" class="form-control" placeholder="请输入密码"
                   [class.error]="submitted && loginForm.get('password')?.invalid">
            @if (submitted && loginForm.get('password')?.invalid) {
              <div class="error-message">请输入密码</div>
            }
          </div>
          
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;" [disabled]="loading">
            @if (loading) {
              <span class="loading"></span>
            } @else {
              登录
            }
          </button>
        </form>
        
        <div class="divider"></div>
        
        <div style="text-align: center; font-size: 14px; color: var(--text-secondary);">
          还没有账号？<a routerLink="/register" style="font-weight: 500;">立即注册</a>
        </div>
      </div>
      
      <div class="card" style="margin-top: 20px;">
        <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary);">演示账号：</h4>
        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.8;">
          <div><strong>管理员：</strong>用户名 <code>admin</code>，密码 <code>admin123</code></div>
          <div><strong>普通用户：</strong>用户名 <code>user</code>，密码 <code>user123</code></div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || '登录失败，请检查用户名和密码';
      }
    });
  }
}
