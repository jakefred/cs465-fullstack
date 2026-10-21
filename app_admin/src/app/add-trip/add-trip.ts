import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TripDataService } from '../services/trip-data.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-add-trip',
  styleUrl: './add-trip.css',
  templateUrl: './add-trip.html',
})
export class AddTrip implements OnInit {
  public addForm!: FormGroup;
  submitted = false;
  readonly formError = signal('');

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripService: TripDataService
  ) {}

  ngOnInit(): void {
    this.addForm = this.formBuilder.group({
      _id: [],
      code: ['', Validators.required],
      name: ['', Validators.required],
      length: ['', Validators.required],
      start: ['', Validators.required],
      resort: ['', Validators.required],
      perPerson: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  public onSubmit(): void {
    this.formError.set('');
    this.submitted = true;
    if (this.addForm.valid) {
      this.tripService.addTrip(this.addForm.value).subscribe({
        next: (data) => {
          console.log(data);
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

  get f() { return this.addForm.controls; }
}
