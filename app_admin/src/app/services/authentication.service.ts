import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripDataService } from './trip-data.service';

interface TokenPayload extends User {
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly tripDataService = inject(TripDataService);
  private readonly token = signal(this.storage.getItem('travlr-token') || '');

  getToken(): string {
    return this.token();
  }

  saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
    this.token.set(token);
  }

  logout(): void {
    this.storage.removeItem('travlr-token');
    this.token.set('');
  }

  // Decoding controls the UI only. The API verifies the token's signature.
  private getPayload(): TokenPayload | null {
    try {
      const parts = this.getToken().split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
      const payload = JSON.parse(new TextDecoder().decode(bytes));
      if (typeof payload?.exp !== 'number' || !Number.isFinite(payload.exp) ||
          typeof payload.email !== 'string' || typeof payload.name !== 'string') {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const payload = this.getPayload();
    return payload !== null && payload.exp > Date.now() / 1000;
  }

  getCurrentUser(): User | null {
    const payload = this.getPayload();
    if (!payload || payload.exp <= Date.now() / 1000) return null;
    return { name: payload.name, email: payload.email };
  }

  login(user: User, password: string): Observable<AuthResponse> {
    return this.tripDataService.login(user, password).pipe(
      tap(response => this.saveToken(response.token))
    );
  }

  register(user: User, password: string): Observable<AuthResponse> {
    return this.tripDataService.register(user, password).pipe(
      tap(response => this.saveToken(response.token))
    );
  }
}
