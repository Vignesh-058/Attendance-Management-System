import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { HttpClient } from '@angular/common/http';
import { AttendanceService } from '../../../core/services/attendance.service';

@Component({
  selector: 'app-check-in-out',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    FormsModule, ReactiveFormsModule, MatSelectModule, MatInputModule, MatRadioModule
  ],
  templateUrl: './check-in-out.html',
  styleUrl: './check-in-out.css'
})
export class CheckInOut implements OnInit {
  subjects: any[] = [];
  students: any[] = [];
  attendanceForm: FormGroup;
  isLoading = false;
  message = '';

  displayedColumns: string[] = ['name', 'rollNumber', 'status'];
  
  private attendanceService = inject(AttendanceService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.attendanceForm = this.fb.group({
      subjectId: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSubjects();
    this.loadStudents();
  }

  loadSubjects() {
    this.attendanceService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  loadStudents() {
    // We use http direct since getStudents is not in AttendanceService yet, or we can just fetch
    this.http.get('http://localhost:3000/api/attendance/students', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe({
      next: (data: any) => {
        this.students = data.map((s: any) => ({ ...s, status: 'Present' }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  submitAttendance() {
    if (this.attendanceForm.invalid || this.students.length === 0) return;
    
    this.isLoading = true;
    const payload = {
      ...this.attendanceForm.value,
      attendanceData: this.students.map(s => ({ studentId: s.id, status: s.status }))
    };

    this.attendanceService.markAttendance(payload).subscribe({
      next: (res) => {
        this.message = res.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message = err.error?.message || 'Error marking attendance';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
