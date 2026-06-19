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
import { User, Department } from '../../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatButtonModule, MatInputModule, MatSelectModule, MatCardModule, MatIconModule],
  templateUrl: './users.html',
  styles: [`
    .admin-container { padding: 20px; }
    .form-card { margin-bottom: 20px; }
    .form-row { display: flex; gap: 10px; }
    .full-width { width: 100%; margin-bottom: 10px; }
    .half-width { flex: 1; }
    .third-width { flex: 1; }
    table { width: 100%; margin-top: 10px; }
  `]
})
export class Users implements OnInit {
  users: User[] = [];
  departments: Department[] = [];
  selectedRoleFilter: string = '';
  displayedColumns: string[] = ['name', 'email', 'role', 'department', 'actions'];
  
  currentUser: any = this.getEmptyUser();
  isEditing = false;
  
  isString(val: any): boolean {
    return typeof val === 'string';
  }

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
    this.adminService.getDepartments().subscribe(data => {
      this.departments = data;
      this.cdr.detectChanges();
    });
  }

  loadData() {
    this.adminService.getUsers(this.selectedRoleFilter).subscribe(data => {
      this.users = data;
      this.cdr.detectChanges();
    });
  }

  getEmptyUser() {
    return { firstName: '', lastName: '', email: '', password: '', role: 'Student', departmentId: null, semester: '', section: '', rollNumber: '', designation: '' };
  }

  saveUser() {
    if (this.isEditing) {
      this.adminService.updateUser(this.currentUser.id, this.currentUser).subscribe(() => {
        this.loadData();
        this.cancelEdit();
      });
    } else {
      this.adminService.createUser(this.currentUser).subscribe(() => {
        this.loadData();
        this.cancelEdit();
      });
    }
  }

  editUser(user: any) {
    this.currentUser = { 
      ...user, 
      role: typeof user.role === 'string' ? user.role : user.role?.name,
      departmentId: user.department?.id 
    };
    this.isEditing = true;
    this.cdr.detectChanges();
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(id).subscribe(() => this.loadData());
    }
  }

  cancelEdit() {
    this.currentUser = this.getEmptyUser();
    this.isEditing = false;
    this.cdr.detectChanges();
  }
}
