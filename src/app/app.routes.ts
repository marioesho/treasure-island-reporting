import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/fetch-emails/fetch-emails.component').then(m => m.FetchEmailsComponent) },
];
