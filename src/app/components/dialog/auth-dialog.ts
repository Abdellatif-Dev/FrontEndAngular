import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
  templateUrl: './auth-dialog.html',
})
export class AuthDialogComponent {
  private dialogRef = inject(MatDialogRef<AuthDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}