import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm: FormGroup;
  error: string = '';
  isLoading: boolean = false;
  portalRole: string = 'Teacher'; // Default to Teacher
  portalIcon: string = 'co_present';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    const url = this.router.url;
    if (url.includes('/student')) {
      this.portalRole = 'Student';
      this.portalIcon = 'face';
    } else if (url.includes('/teacher')) {
      this.portalRole = 'Teacher';
      this.portalIcon = 'local_library';
    } else if (url.includes('/admin')) {
      this.portalRole = 'Admin';
      this.portalIcon = 'admin_panel_settings';
    } else {
      this.portalRole = 'Student';
      this.portalIcon = 'face';
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      
      const payload = {
        ...this.loginForm.value,
        expectedRole: this.portalRole
      };
      
      this.authService.login(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Login failed. Please try again.';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
