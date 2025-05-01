import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class AuthGoogleService {
  constructor(private oAuthService: OAuthService, private router: Router) {
    this.oAuthService.configure({
      issuer: 'https://accounts.google.com',
      redirectUri: window.location.origin,
      clientId: '420616304322-eh5hmo8b3ftpj6edpp0j4emdjtht8o0f.apps.googleusercontent.com',
      scope: 'openid profile email https://www.googleapis.com/auth/gmail.readonly',
      strictDiscoveryDocumentValidation: false,
    });
    this.oAuthService.setupAutomaticSilentRefresh();
  }

  get getAccessToken() {
    return this.oAuthService.getAccessToken();
  }

  async loadDiscoveryDocumentAndTryLogin(): Promise<boolean> {
    return this.oAuthService.loadDiscoveryDocumentAndTryLogin();
  }

  isValidUser(): boolean {
    return this.oAuthService.hasValidAccessToken() && this.oAuthService.hasValidIdToken();
  }

  login() {
    this.oAuthService.initImplicitFlow();
  }

  logout() {
    this.oAuthService.revokeTokenAndLogout();
    this.oAuthService.logOut();
    this.router.navigateByUrl('/');
  }
}
