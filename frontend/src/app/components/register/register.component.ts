import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div style="max-width: 400px; margin: 40px auto;">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title" style="text-align: center; font-size: 24px;">注册问集</h2>
        </div>
        
        @if (errorMessage) {
          <div class="alert alert-error">{{ errorMessage }}</div>
        }
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input type="text" formControlName="username" class="form-control" placeholder="请输入用户名"
                   [class.error]="submitted && registerForm.get('username')?.invalid">
            @if (submitted && registerForm.get('username')?.invalid) {
              <div class="error-message">
                @if (registerForm.get('username')?.errors?.['required']) {
                  请输入用户名
                }
                @if (registerForm.get('username')?.errors?.['minlength']) {
                  用户名至少3个字符
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <input type="email" formControlName="email" class="form-control" placeholder="请输入邮箱地址"
                   [class.error]="submitted && registerForm.get('email')?.invalid">
            @if (submitted && registerForm.get('email')?.invalid) {
              <div class="error-message">
                @if (registerForm.get('email')?.errors?.['required']) {
                  请输入邮箱地址
                }
                @if (registerForm.get('email')?.errors?.['email']) {
                  请输入有效的邮箱地址
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <input type="password" formControlName="password" class="form-control" placeholder="请输入密码"
                   [class.error]="submitted && registerForm.get('password')?.invalid">
            @if (submitted && registerForm.get('password')?.invalid) {
              <div class="error-message">
                @if (registerForm.get('password')?.errors?.['required']) {
                  请输入密码
                }
                @if (registerForm.get('password')?.errors?.['minlength']) {
                  密码至少6个字符
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input type="password" formControlName="confirmPassword" class="form-control" placeholder="请再次输入密码"
                   [class.error]="submitted && (registerForm.get('confirmPassword')?.invalid || registerForm.hasError('passwordMismatch'))">
            @if (submitted && (registerForm.get('confirmPassword')?.invalid || registerForm.hasError('passwordMismatch'))) {
              <div class="error-message">
                @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                  请确认密码
                }
                @if (registerForm.hasError('passwordMismatch')) {
                  两次输入的密码不一致
                }
              </div>
            }
          </div>
          
          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;" [disabled]="loading">
            @if (loading) {
              <span class="loading"></span>
            } @else {
              注册
            }
          </button>
        </form>
        
        <div class="divider"></div>
        
        <div style="text-align: center; font-size: 14px; color: var(--text-secondary);">
          已有账号？<a routerLink="/login" style="font-weight: 500;">立即登录</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const userData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || '注册失败，请稍后重试';
      }
    });
  }
}
