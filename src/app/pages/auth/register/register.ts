import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html'
})
export class Register {

  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    username:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  loading  = signal(false);
  apiError = signal('');
  showPass = signal(false);

  togglePass() {
    this.showPass.update(v => !v);
  }

  passwordMismatch(): boolean {
    const { password, confirmPassword } = this.form.value;
    return !!(
      confirmPassword &&
      password !== confirmPassword &&
      this.form.get('confirmPassword')?.touched
    );
  }

  strengthWidth(): string {
    const len = this.form.get('password')?.value?.length ?? 0;
    if (len === 0) return '0%';
    if (len < 6)  return '33%';
    if (len < 10) return '66%';
    return '100%';
  }

  strengthClass(): string {
    const len = this.form.get('password')?.value?.length ?? 0;
    if (len < 6)  return 'weak';
    if (len < 10) return 'fair';
    return 'strong';
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getError(field: string): string {
    const control = this.form.get(field);

    if (control?.errors?.['required']) return 'This field is required';
    if (control?.errors?.['email']) return 'Enter a valid email';

    if (control?.errors?.['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      return `Minimum ${min} characters`;
    }

    return '';
  }

  onSubmit(): void {

    if (this.form.invalid || this.passwordMismatch()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set('');

    const { username, email, password } = this.form.value;

    this.auth.register({
      username: username!,
      email: email!,
      password: password!,
      role: 'USER'
    }).subscribe({

      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },

      error: (err) => {
        this.loading.set(false);
        this.apiError.set(
          err.error?.error || 'Registration failed. Please try again.'
        );
      }

    });
  }
}