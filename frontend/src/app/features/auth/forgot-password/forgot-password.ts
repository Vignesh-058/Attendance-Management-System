import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  forgotForm: FormGroup;
  error: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  mockResetToken: string = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.successMessage = '';
      this.mockResetToken = '';
      
      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (res) => {
          this.successMessage = res.message;
          this.mockResetToken = res.mockEmailDetails.otp;
          this.isLoading = false;
          this.cdr.markForCheck();
          
          setTimeout(() => {
            this.router.navigate(['/reset-password'], { queryParams: { token: res.mockEmailDetails.resetToken } });
          }, 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'An error occurred. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
