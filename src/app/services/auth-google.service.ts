import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class AuthGoogleService {
  public profile = signal<object | null>(null);

  constructor(private oAuthService: OAuthService, private router: Router) {
    this.initConfiguration();
  }

  get getAccessToken() {
    return this.oAuthService.getAccessToken();
  }

  initConfiguration() {
    this.oAuthService.configure({
      issuer: 'https://accounts.google.com',
      redirectUri: window.location.origin,
      clientId: '420616304322-eh5hmo8b3ftpj6edpp0j4emdjtht8o0f.apps.googleusercontent.com',
      scope: 'openid profile email https://www.googleapis.com/auth/gmail.readonly',
      strictDiscoveryDocumentValidation: false,
    });
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oAuthService.hasValidIdToken()) {
        this.profile.set(this.oAuthService.getIdentityClaims());
      }
    });
  }

  login() {
    this.oAuthService.initImplicitFlow();
  }

  logout() {
    this.oAuthService.revokeTokenAndLogout();
    this.oAuthService.logOut();
    this.profile.set(null);
    this.router.navigateByUrl('/');
  }

  getProfile() {
    return this.profile();
  }
}
