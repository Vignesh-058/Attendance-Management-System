import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Department, Course, Subject, User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // -------------------------------------------------------------------------
  // DEPARTMENTS
  // -------------------------------------------------------------------------
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`, { headers: this.getHeaders() });
  }

  createDepartment(data: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/departments`, data, { headers: this.getHeaders() });
  }

  updateDepartment(id: number, data: Partial<Department>): Observable<any> {
    return this.http.put(`${this.apiUrl}/departments/${id}`, data, { headers: this.getHeaders() });
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/departments/${id}`, { headers: this.getHeaders() });
  }

  // -------------------------------------------------------------------------
  // COURSES
  // -------------------------------------------------------------------------
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/courses`, { headers: this.getHeaders() });
  }

  createCourse(data: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/courses`, data, { headers: this.getHeaders() });
  }

  updateCourse(id: number, data: Partial<Course>): Observable<any> {
    return this.http.put(`${this.apiUrl}/courses/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${id}`, { headers: this.getHeaders() });
  }

  // -------------------------------------------------------------------------
  // SUBJECTS
  // -------------------------------------------------------------------------
  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/subjects`, { headers: this.getHeaders() });
  }

  createSubject(data: Partial<Subject>): Observable<Subject> {
    return this.http.post<Subject>(`${this.apiUrl}/subjects`, data, { headers: this.getHeaders() });
  }

  updateSubject(id: number, data: Partial<Subject>): Observable<any> {
    return this.http.put(`${this.apiUrl}/subjects/${id}`, data, { headers: this.getHeaders() });
  }

  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subjects/${id}`, { headers: this.getHeaders() });
  }

  // -------------------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------------------
  getUsers(role?: string): Observable<User[]> {
    const url = role ? `${this.apiUrl}/users?role=${role}` : `${this.apiUrl}/users`;
    return this.http.get<User[]>(url, { headers: this.getHeaders() });
  }

  createUser(data: Partial<User>): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data, { headers: this.getHeaders() });
  }

  updateUser(id: number, data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data, { headers: this.getHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }
}
