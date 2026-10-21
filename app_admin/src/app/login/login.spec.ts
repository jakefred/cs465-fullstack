import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';
import { AuthenticationService } from '../services/authentication.service';
import { testToken } from '../testing/auth-fixtures';

describe('Login', () => {
  beforeEach(() => {
    localStorage.removeItem('travlr-token');
    TestBed.configureTestingModule({ imports: [Login], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([])
    ] });
  });
  afterEach(() => {
    TestBed.inject(AuthenticationService).logout();
    TestBed.inject(HttpTestingController).verify();
  });

  it('waits for the API response before navigating; name is not required', async () => {
    const fixture = TestBed.createComponent(Login);
    const login = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    login.credentials = { email: 'module7@example.test', password: 'test-password' };
    login.onLoginSubmit();
    expect(navigate).not.toHaveBeenCalled();
    expect(login.submitted()).toBe(true);
    TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/login').flush({ token: testToken() });
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith(['/']);
    expect(login.submitted()).toBe(false);
  });

  it('displays failed login errors and allows another attempt', async () => {
    const fixture = TestBed.createComponent(Login);
    const login = fixture.componentInstance;
    login.credentials = { email: 'module7@example.test', password: 'wrong' };
    login.onLoginSubmit();
    TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/login')
      .flush({ message: 'Incorrect email or password.' }, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Incorrect email or password.');
    expect(login.submitted()).toBe(false);
  });

  it('rejects empty fields without sending a request', () => {
    const login = TestBed.createComponent(Login).componentInstance;
    login.onLoginSubmit();
    expect(login.formError()).toBe('Email and password are required.');
    TestBed.inject(HttpTestingController).expectNone('http://localhost:3000/api/login');
  });
});
