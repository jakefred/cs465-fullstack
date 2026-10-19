import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripDataService } from '../services/trip-data.service';
import { Trip } from '../models/trip';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-edit-trip',
  styleUrl: './edit-trip.css',
  templateUrl: './edit-trip.html',
})
export class EditTrip implements OnInit {
  public editForm!: FormGroup;
  trip!: Trip;
  submitted = false;
  readonly formError = signal('');
  message: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripDataService: TripDataService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const tripCode = localStorage.getItem('tripCode');
    if (!tripCode) {
      alert('No trip selected. Please choose a trip to edit.');
      this.router.navigate(['']);
      return;
    }

    console.log('EditTrip::ngOnInit');
    console.log('tripCode: ' + tripCode);

    this.editForm = this.formBuilder.group({
      _id: [],
      code: [tripCode, Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required],
    });

    this.tripDataService.getTrip(tripCode).subscribe({
      next: (value) => {
        if (value.length === 0) {
          this.message = 'No Trip Retrieved!';
          console.log(this.message);
          this.router.navigate(['']);
          return;
        }

        this.trip = value[0];
        this.editForm.patchValue({
          ...this.trip,
          start: this.trip.start.slice(0, 10)
        });
        this.message = 'Trip: ' + tripCode + ' retrieved';
        console.log(this.message);
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.log('Error: ' + error);
      }
    });
  }

  public onSubmit(): void {
    this.formError.set('');
    this.submitted = true;
    if (this.editForm.valid) {
      this.tripDataService.updateTrip(this.editForm.value).subscribe({
        next: (value) => {
          console.log(value);
          this.router.navigate(['']);
        },
        error: (error) => {
          this.formError.set(error.status === 401
            ? 'Your session has expired. Please log in again.'
            : 'Unable to save the trip. Please try again.');
        }
      });
    }
  }

  get f() { return this.editForm.controls; }
}
