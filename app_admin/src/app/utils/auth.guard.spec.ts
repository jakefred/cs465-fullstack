import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { testToken } from '../testing/auth-fixtures';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.removeItem('travlr-token');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
  });
  afterEach(() => TestBed.inject(AuthenticationService).logout());

  it('redirects logged-out visitors to login and allows authenticated visitors', () => {
    const check = () => TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(check() as UrlTree)).toBe('/login');
    TestBed.inject(AuthenticationService).saveToken(testToken());
    expect(check()).toBe(true);
  });
});
