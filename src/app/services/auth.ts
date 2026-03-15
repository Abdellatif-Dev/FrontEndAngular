import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '.';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8081/api/auth';
  private readonly TOKEN_KEY = 'shopx_token';

  // Reactive state
  private _user = signal<User | null>(this.loadUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ROLE_ADMIN');
  readonly username = computed(() => this._user()?.username ?? '');

  constructor(private http: HttpClient, private router: Router) { }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, req).pipe(
      tap(res => this.saveSession(res))
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('shopx_user');
    this._user.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    const user: User = { username: res.username, email: res.email, role: res.role };
    localStorage.setItem('shopx_user', JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('shopx_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  updateProfile(username: string): Observable<any> {
    return this.http.put(`${this.API}/update-profile`, { username }).pipe(
      tap(() => {
        const currentUser = this._user();
        if (currentUser) {
          const updatedUser = { ...currentUser, username };
          localStorage.setItem('shopx_user', JSON.stringify(updatedUser));
          this._user.set(updatedUser);
        }
      })
    );
  }

  changePassword(oldPass: string, newPass: string): Observable<any> {
    return this.http.put(`${this.API}/change-password`, { oldPass, newPass });
  }
}
