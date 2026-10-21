import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const authGuard: CanActivateFn = () => {
  return inject(AuthenticationService).isLoggedIn() || inject(Router).createUrlTree(['/login']);
};
