import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { SurveyListComponent } from './components/survey-list/survey-list.component';
import { SurveyDetailComponent } from './components/survey-detail/survey-detail.component';
import { SurveySubmitComponent } from './components/survey-submit/survey-submit.component';
import { SurveyThankyouComponent } from './components/survey-thankyou/survey-thankyou.component';
import { MyResponsesComponent } from './components/my-responses/my-responses.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { AdminSurveyListComponent } from './components/admin/admin-survey-list/admin-survey-list.component';
import { AdminSurveyEditComponent } from './components/admin/admin-survey-edit/admin-survey-edit.component';
import { AdminSurveyResultsComponent } from './components/admin/admin-survey-results/admin-survey-results.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'surveys', component: SurveyListComponent },
  { path: 'surveys/:id', component: SurveyDetailComponent },
  { path: 'surveys/:id/submit', component: SurveySubmitComponent },
  { path: 'surveys/:id/thankyou', component: SurveyThankyouComponent },
  { path: 'my-responses', component: MyResponsesComponent, canActivate: [AuthGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [AuthGuard] },
  { path: 'admin/surveys', component: AdminSurveyListComponent, canActivate: [AdminGuard] },
  { path: 'admin/surveys/new', component: AdminSurveyEditComponent, canActivate: [AdminGuard] },
  { path: 'admin/surveys/:id/edit', component: AdminSurveyEditComponent, canActivate: [AdminGuard] },
  { path: 'admin/surveys/:id/results', component: AdminSurveyResultsComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];
