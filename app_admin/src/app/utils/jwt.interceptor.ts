import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { API_BASE_URL } from './api';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const url = new URL(request.url, API_BASE_URL);
  const api = new URL(API_BASE_URL);
  const isTripAPI = url.origin === api.origin &&
    (url.pathname === `${api.pathname}/trips` || url.pathname.startsWith(`${api.pathname}/trips/`));

  // Never send the token to login, registration, or another site's API.
  if (!isTripAPI) return next(request);
  const auth = inject(AuthenticationService);
  if (!auth.isLoggedIn()) return next(request);

  const token = auth.getToken();
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.getToken() === token) auth.logout();
      return throwError(() => error);
    })
  );
};
