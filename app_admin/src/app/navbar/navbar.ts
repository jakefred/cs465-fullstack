import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly auth = inject(AuthenticationService);
  private readonly router = inject(Router);

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
