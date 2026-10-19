import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { testToken, testUser } from '../testing/auth-fixtures';

describe('AuthenticationService', () => {
  let auth: AuthenticationService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('travlr-token');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    auth = TestBed.inject(AuthenticationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { auth.logout(); http.verify(); });

  it('stores the login token after the response and clears it on logout', () => {
    const token = testToken();
    auth.login(testUser, 'test-password').subscribe();
    expect(auth.isLoggedIn()).toBe(false);
    const request = http.expectOne('http://localhost:3000/api/login');
    expect(request.request.body).toEqual({ ...testUser, password: 'test-password' });
    request.flush({ token });
    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.getCurrentUser()).toEqual(testUser);
    expect(localStorage.getItem('travlr-token')).toBe(token);
    auth.logout();
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('travlr-token')).toBeNull();
  });

  it('registers through the API and saves the returned token', () => {
    auth.register(testUser, 'test-password').subscribe();
    http.expectOne('http://localhost:3000/api/register').flush({ token: testToken() });
    expect(auth.isLoggedIn()).toBe(true);
  });

  it('restores a saved session when the service is created', () => {
    const token = testToken();
    localStorage.setItem('travlr-token', token);
    const restored = TestBed.runInInjectionContext(() => new AuthenticationService());
    expect(restored.isLoggedIn()).toBe(true);
  });

  it('treats missing, malformed and expired tokens as logged out without throwing', () => {
    for (const token of ['', 'broken', 'a.bad-json.c', 'a.bnVsbA.c', testToken(-1)]) {
      auth.saveToken(token);
      expect(auth.isLoggedIn()).toBe(false);
      expect(auth.getCurrentUser()).toBeNull();
    }
  });

  it('decodes names containing Unicode from base64url tokens', () => {
    auth.saveToken(testToken(3600, 'Zoë García'));
    expect(auth.getCurrentUser()?.name).toBe('Zoë García');
  });
});
