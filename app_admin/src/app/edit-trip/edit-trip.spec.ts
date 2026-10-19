import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTrip } from './edit-trip';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { testTrip } from '../testing/auth-fixtures';

describe('EditTrip', () => {
  let component: EditTrip;
  let fixture: ComponentFixture<EditTrip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTrip],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    localStorage.setItem('tripCode', testTrip.code);
    fixture = TestBed.createComponent(EditTrip);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/api/trips/M7TEST').flush([testTrip]);
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.removeItem('tripCode');
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
