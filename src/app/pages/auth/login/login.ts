import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html'
})
export class LoginComponent {

  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading      = signal(false);
  apiError     = signal('');
  showPassword = signal(false);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getError(field: string): string {
    const control = this.form.get(field);

    if (control?.errors?.['required']) return 'This field is required';
    if (control?.errors?.['email']) return 'Enter a valid email';

    return '';
  }

  onSubmit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set('');

    const { email, password } = this.form.value;

    this.auth.login({
      email: email!,
      password: password!
    }).subscribe({

      next: (res: any) => {
        this.loading.set(false);

        if (res.role === 'ROLE_ADMIN') {
          this.router.navigate(['']);
        } else {
          this.router.navigate(['/']);
        }
      },

      error: (err) => {
        this.loading.set(false);
        this.apiError.set(
          err.error?.error || 'Invalid email or password'
        );
      }

    });
  }
}