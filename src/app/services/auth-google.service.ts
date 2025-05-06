import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '@environment';

@Injectable({
  providedIn: 'root',
})
export class AuthGoogleService {
  constructor(private oAuthService: OAuthService) {
    this.oAuthService.configure({
      issuer: 'https://accounts.google.com',
      redirectUri: `${window.location.origin}${environment.baseUrl}`,
      clientId: '220413165819-ujhngpvuo4dq04h27mmp92tt30sfkp1j.apps.googleusercontent.com',
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
    this.oAuthService.revokeTokenAndLogout().then(() => window.location.assign(environment.baseUrl));
  }
}
