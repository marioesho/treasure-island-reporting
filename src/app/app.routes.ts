import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'dashboard', loadComponent: () => import('./components/fetch-emails/fetch-emails.component').then(m => m.FetchEmailsComponent) },
];
