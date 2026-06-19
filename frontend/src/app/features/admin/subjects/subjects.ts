import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Course, User } from '../../../core/models';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatInputModule, MatSelectModule, MatCardModule, MatIconModule],
  templateUrl: './subjects.html',
  styles: [`
    .admin-container { padding: 20px; }
    .form-card { margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    table { width: 100%; margin-top: 20px; }
  `]
})
export class Subjects implements OnInit {
  subjects: Subject[] = [];
  courses: Course[] = [];
  teachers: User[] = [];
  displayedColumns: string[] = ['code', 'name', 'course', 'teacher', 'actions'];
  currentSubject: any = { name: '', code: '', semester: '', courseId: null, teacherId: null };
  isEditing = false;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getSubjects().subscribe(data => {
      this.subjects = data;
      this.cdr.detectChanges();
    });
    this.adminService.getCourses().subscribe(data => {
      this.courses = data;
      this.cdr.detectChanges();
    });
    this.adminService.getUsers('Teacher').subscribe(data => {
      this.teachers = data;
      this.cdr.detectChanges();
    });
  }

  saveSubject() {
    if (this.isEditing) {
      this.adminService.updateSubject(this.currentSubject.id, this.currentSubject).subscribe(() => {
        this.loadData();
        this.cancelEdit();
      });
    } else {
      this.adminService.createSubject(this.currentSubject).subscribe(() => {
        this.loadData();
        this.cancelEdit();
      });
    }
  }

  editSubject(subject: any) {
    this.currentSubject = { 
      ...subject, 
      courseId: subject.course?.id,
      teacherId: subject.teacher?.id 
    };
    this.isEditing = true;
    this.cdr.detectChanges();
  }

  deleteSubject(id: number) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.adminService.deleteSubject(id).subscribe(() => this.loadData());
    }
  }

  cancelEdit() {
    this.currentSubject = { name: '', code: '', semester: '', courseId: null, teacherId: null };
    this.isEditing = false;
    this.cdr.detectChanges();
  }
}
