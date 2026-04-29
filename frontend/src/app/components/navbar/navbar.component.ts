import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-content">
        <a routerLink="/" class="navbar-brand">
          <div class="navbar-logo">问</div>
          <span>问集</span>
        </a>
        
        <div class="navbar-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            首页
          </a>
          <a routerLink="/surveys" routerLinkActive="active" class="nav-link">
            问卷列表
          </a>
          
          @if (isAuthenticated()) {
            <a routerLink="/my-responses" routerLinkActive="active" class="nav-link">
              我的提交
            </a>
            <a routerLink="/favorites" routerLinkActive="active" class="nav-link">
              收藏夹
            </a>
          }
          
          @if (isAdmin()) {
            <a routerLink="/admin/surveys" routerLinkActive="active" class="nav-link">
              管理后台
            </a>
          }
        </div>
        
        <div class="navbar-nav">
          @if (isAuthenticated()) {
            <div class="user-info">
              <div class="user-avatar">{{ initials() }}</div>
              <span style="font-size: 14px; color: var(--text-primary);">{{ currentUser()?.username }}</span>
            </div>
            <button (click)="logout()" class="btn btn-secondary btn-sm">退出登录</button>
          } @else {
            <a routerLink="/login" class="nav-link">登录</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">注册</a>
          }
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;
  
  initials = computed(() => {
    const user = this.currentUser();
    return user ? user.username.charAt(0).toUpperCase() : '?';
  });

  constructor(private authService: AuthService) { }

  logout(): void {
    this.authService.logout();
  }
}
