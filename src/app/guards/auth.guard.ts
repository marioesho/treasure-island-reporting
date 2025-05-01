import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

import { AuthGoogleService } from '@services';

export const authGuard: CanActivateFn = async (route, state) => {
  const authGoogleService = inject(AuthGoogleService);

  await authGoogleService.loadDiscoveryDocumentAndTryLogin();
  const isValid = authGoogleService.isValidUser();

  if (!isValid) {
    authGoogleService.login();
    return false;
  }

  return true;
};
