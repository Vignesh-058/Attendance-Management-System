import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/role-selection/role-selection').then(m => m.RoleSelection), canActivate: [guestGuard] },
  { path: 'login/admin', loadComponent: () => import('./features/auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'login/teacher', loadComponent: () => import('./features/auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'login/student', loadComponent: () => import('./features/auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register), canActivate: [guestGuard] },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword), canActivate: [guestGuard] },
  { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPassword), canActivate: [guestGuard] },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  { 
    path: 'attendance', 
    loadComponent: () => import('./features/attendance/check-in-out/check-in-out').then(m => m.CheckInOut),
    canActivate: [authGuard]
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./features/reports/monthly-report/monthly-report').then(m => m.MonthlyReport),
    canActivate: [authGuard]
  },
  { 
    path: 'admin/departments', 
    loadComponent: () => import('./features/admin/departments/departments').then(m => m.Departments),
    canActivate: [authGuard]
  },
  { 
    path: 'admin/courses', 
    loadComponent: () => import('./features/admin/courses/courses').then(m => m.Courses),
    canActivate: [authGuard]
  },
  { 
    path: 'admin/subjects', 
    loadComponent: () => import('./features/admin/subjects/subjects').then(m => m.Subjects),
    canActivate: [authGuard]
  },
  { 
    path: 'admin/users', 
    loadComponent: () => import('./features/admin/users/users').then(m => m.Users),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
