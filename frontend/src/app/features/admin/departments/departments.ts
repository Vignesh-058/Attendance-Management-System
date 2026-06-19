import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Department } from '../../../core/models';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatInputModule, MatCardModule, MatIconModule],
  templateUrl: './departments.html',
  styles: [`
    .admin-container { padding: 20px; }
    .form-card { margin-bottom: 20px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    table { width: 100%; margin-top: 20px; }
  `]
})
export class Departments implements OnInit {
  departments: Department[] = [];
  displayedColumns: string[] = ['id', 'name', 'description', 'actions'];
  currentDept: Partial<Department> = { name: '', description: '' };
  isEditing = false;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.adminService.getDepartments().subscribe(data => {
      this.departments = data;
      this.cdr.detectChanges();
    });
  }

  saveDepartment() {
    if (this.isEditing) {
      this.adminService.updateDepartment(this.currentDept.id!, this.currentDept).subscribe(() => {
        this.loadDepartments();
        this.cancelEdit();
      });
    } else {
      this.adminService.createDepartment(this.currentDept).subscribe(() => {
        this.loadDepartments();
        this.cancelEdit();
      });
    }
  }

  editDepartment(dept: Department) {
    this.currentDept = { ...dept };
    this.isEditing = true;
    this.cdr.detectChanges();
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.adminService.deleteDepartment(id).subscribe(() => this.loadDepartments());
    }
  }

  cancelEdit() {
    this.currentDept = { name: '', description: '' };
    this.isEditing = false;
    this.cdr.detectChanges();
  }
}
