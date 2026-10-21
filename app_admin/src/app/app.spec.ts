import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { testToken } from './testing/auth-fixtures';

describe('App', () => {
  beforeEach(async () => {
    localStorage.removeItem('travlr-token');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
      .compileComponents();
  });

  afterEach(() => TestBed.inject(AuthenticationService).logout());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render navigation and the login link', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')?.textContent).toContain('Trips');
    expect(compiled.querySelector('a[href="/login"]')?.textContent).toContain('Log In');
  });

  it('updates the navbar after login and logs out when its button is clicked', async () => {
    const fixture = TestBed.createComponent(App);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const auth = TestBed.inject(AuthenticationService);
    auth.saveToken(testToken());
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('nav button') as HTMLButtonElement;
    expect(button.textContent).toContain('Log Out');
    button.click();
    await fixture.whenStable();
    expect(auth.isLoggedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/']);
    expect(fixture.nativeElement.querySelector('a[href="/login"]')).not.toBeNull();
  });
});
