import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReportsService } from '../../core/services/reports.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats: any = null;
  isLoading = true;
  error = '';

  private reportsService = inject(ReportsService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  role: string = '';

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.role = typeof user.role === 'string' ? user.role : (user.role?.name || '');
    }
    this.fetchStats();
  }

  fetchStats() {
    this.reportsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard statistics.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
