import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthenticationService } from '../services/authentication.service';
import { testToken } from '../testing/auth-fixtures';
import { jwtInterceptor } from './jwt.interceptor';

describe('JWT interceptor', () => {
  let auth: AuthenticationService;
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('travlr-token');
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([jwtInterceptor])), provideHttpClientTesting()
    ] });
    auth = TestBed.inject(AuthenticationService);
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { auth.logout(); http.verify(); });

  it('attaches a Bearer token to trip POST and PUT requests', () => {
    const token = testToken();
    auth.saveToken(token);
    for (const method of ['POST', 'PUT']) {
      const url = 'http://localhost:3000/api/trips' + (method === 'PUT' ? '/M7TEST' : '');
      client.request(method, url, { body: {} }).subscribe();
      const request = http.expectOne(url);
      expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      request.flush({});
    }
  });

  it('never attaches tokens to auth endpoints, foreign hosts, or unrelated paths', () => {
    auth.saveToken(testToken());
    for (const url of [
      'http://localhost:3000/api/login', 'http://localhost:3000/api/register',
      'https://example.test/api/trips', 'http://localhost:3000/api/trips-other',
      'http://localhost.evil.test:3000/api/trips'
    ]) {
      client.get(url).subscribe();
      const request = http.expectOne(url);
      expect(request.request.headers.has('Authorization')).toBe(false);
      request.flush({});
    }
  });

  it('does not attach expired tokens', () => {
    auth.saveToken(testToken(-1));
    client.get('http://localhost:3000/api/trips').subscribe();
    const request = http.expectOne('http://localhost:3000/api/trips');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('clears a rejected session and delivers the error to the component', () => {
    auth.saveToken(testToken());
    let status = 0;
    client.get('http://localhost:3000/api/trips').subscribe({ error: error => status = error.status });
    http.expectOne('http://localhost:3000/api/trips').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isLoggedIn()).toBe(false);
    expect(status).toBe(401);
  });
});
