import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthenticationService);
  private readonly router = inject(Router);
  readonly formError = signal('');
  readonly submitted = signal(false);
  credentials = { email: '', password: '' };

  onLoginSubmit(): void {
    if (this.submitted()) return;
    this.formError.set('');
    if (!this.credentials.email.trim() || !this.credentials.password) {
      this.formError.set('Email and password are required.');
      return;
    }
    this.submitted.set(true);
    this.auth.login({ name: '', email: this.credentials.email.trim() }, this.credentials.password)
      .pipe(finalize(() => this.submitted.set(false)))
      .subscribe({
        next: () => {
          this.credentials.password = '';
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          this.formError.set(error.status === 0
            ? 'Unable to reach the server. Please try again.'
            : error.error?.message || 'Unable to log in. Please try again.');
        }
      });
  }
}
