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
import { Course, Department } from '../../../core/models';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatInputModule, MatSelectModule, MatCardModule, MatIconModule],
  templateUrl: './courses.html',
  styles: [`
    .admin-container { padding: 20px; }
    .form-card { margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    table { width: 100%; margin-top: 20px; }
  `]
})
export class Courses implements OnInit {
  courses: Course[] = [];
  departments: Department[] = [];
  displayedColumns: string[] = ['id', 'name', 'department', 'actions'];
  currentCourse: any = { name: '', description: '', departmentId: null };
  isEditing = false;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadCourses();
    this.adminService.getDepartments().subscribe(data => {
      this.departments = data;
      this.cdr.detectChanges();
    });
  }

  loadCourses() {
    this.adminService.getCourses().subscribe(data => {
      this.courses = data;
      this.cdr.detectChanges();
    });
  }

  saveCourse() {
    if (this.isEditing) {
      this.adminService.updateCourse(this.currentCourse.id, this.currentCourse).subscribe(() => {
        this.loadCourses();
        this.cancelEdit();
      });
    } else {
      this.adminService.createCourse(this.currentCourse).subscribe(() => {
        this.loadCourses();
        this.cancelEdit();
      });
    }
  }

  editCourse(course: any) {
    this.currentCourse = { ...course, departmentId: course.department?.id };
    this.isEditing = true;
    this.cdr.detectChanges();
  }

  deleteCourse(id: number) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.adminService.deleteCourse(id).subscribe(() => this.loadCourses());
    }
  }

  cancelEdit() {
    this.currentCourse = { name: '', description: '', departmentId: null };
    this.isEditing = false;
    this.cdr.detectChanges();
  }
}
