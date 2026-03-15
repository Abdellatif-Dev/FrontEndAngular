import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profil.html',
})
export class ProfilComponent {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);

  isEditing = signal(false); 
  message = signal({ text: '', type: '' }); 

  profileForm: FormGroup = this.fb.group({
    username: [this.auth.user()?.username, Validators.required],
    currentPassword: [''],
    newPassword: ['', [Validators.minLength(6)]]
  });

  toggleEdit() {
    this.isEditing.set(!this.isEditing());
    this.message.set({ text: '', type: '' });
  }

  saveChanges() {
    if (this.profileForm.invalid) return;

    const { username, currentPassword, newPassword } = this.profileForm.value;

    if (username !== this.auth.user()?.username) {
      this.auth.updateProfile(username).subscribe({
        next: () => this.showMessage('Profil mis à jour !', 'success'),
        error: () => this.showMessage('Erreur lors de la mise à jour', 'error')
      });
    }

    if (currentPassword && newPassword) {
      this.auth.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.showMessage('Mot de passe changé !', 'success');
          this.profileForm.patchValue({ currentPassword: '', newPassword: '' });
        },
        error: () => this.showMessage('Ancien mot de passe incorrect', 'error')
      });
    }

    this.isEditing.set(false);
  }

  private showMessage(text: string, type: string) {
    this.message.set({ text, type });
    setTimeout(() => this.message.set({ text: '', type: '' }), 3000);
  }
}