import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripCard } from './trip-card';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { testTrip, testToken } from '../testing/auth-fixtures';

describe('TripCard', () => {
  let component: TripCard;
  let fixture: ComponentFixture<TripCard>;

  beforeEach(async () => {
    localStorage.removeItem('travlr-token');
    await TestBed.configureTestingModule({
      imports: [TripCard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TripCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('trip', testTrip);
    await fixture.whenStable();
  });

  afterEach(() => TestBed.inject(AuthenticationService).logout());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows Edit Trip only while logged in', async () => {
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    const auth = TestBed.inject(AuthenticationService);
    auth.saveToken(testToken());
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Edit Trip');
    auth.logout();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
