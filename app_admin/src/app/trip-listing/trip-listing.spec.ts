import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripListing } from './trip-listing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { testToken } from '../testing/auth-fixtures';

describe('TripListing', () => {
  let component: TripListing;
  let fixture: ComponentFixture<TripListing>;

  beforeEach(async () => {
    localStorage.removeItem('travlr-token');
    await TestBed.configureTestingModule({
      imports: [TripListing],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TripListing);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/trips').flush([]);
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.inject(AuthenticationService).logout();
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows Add Trip only while logged in', async () => {
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    const auth = TestBed.inject(AuthenticationService);
    auth.saveToken(testToken());
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Add Trip');
    auth.logout();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
