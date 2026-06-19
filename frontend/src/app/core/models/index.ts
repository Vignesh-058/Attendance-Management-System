export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role | string;
  department?: Department;
  designation?: string;
  semester?: string;
  section?: string;
  rollNumber?: string;
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  department?: Department;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  semester: string;
  course?: Course;
  teacher?: User;
}

export interface ClassSession {
  id: number;
  subject: Subject;
  teacher: User;
  date: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceRecord {
  id: number;
  student: User;
  classSession: ClassSession;
  status: 'Present' | 'Absent' | 'Leave';
}
