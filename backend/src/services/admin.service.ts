import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { Department } from "../entities/Department";
import { Course } from "../entities/Course";
import { Subject } from "../entities/Subject";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError";
import { auditService } from "./audit.service";

export class AdminService {
  // DEPARTMENTS
  async getDepartments() {
    const deptRepo = AppDataSource.getRepository(Department);
    return await deptRepo.find();
  }

  async createDepartment(data: any) {
    const deptRepo = AppDataSource.getRepository(Department);
    const existing = await deptRepo.findOne({ where: { name: data.name } });
    if (existing) {
      throw new ApiError(409, "A department with this name already exists.");
    }
    const newDept = deptRepo.create({ name: data.name, description: data.description });
    const saved = await deptRepo.save(newDept);
    
    await auditService.log("CREATE", "Department", saved.id.toString(), "Admin", data);
    
    return saved;
  }

  async updateDepartment(id: string, data: any) {
    const deptRepo = AppDataSource.getRepository(Department);
    await deptRepo.update(id, { name: data.name, description: data.description });
    return { message: "Department updated successfully" };
  }

  async deleteDepartment(id: string) {
    const deptRepo = AppDataSource.getRepository(Department);
    await deptRepo.delete(id);
    return { message: "Department deleted" };
  }

  // COURSES
  async getCourses() {
    const courseRepository = AppDataSource.getRepository(Course);
    return await courseRepository.find({ relations: { department: true } });
  }

  async createCourse(data: any) {
    const courseRepository = AppDataSource.getRepository(Course);
    const deptRepository = AppDataSource.getRepository(Department);
    const department = await deptRepository.findOne({ where: { id: data.departmentId } });
    const newCourse = courseRepository.create({
      name: data.name,
      description: data.description,
      department: department || undefined
    });
    return await courseRepository.save(newCourse);
  }

  async updateCourse(id: string, data: any) {
    const courseRepo = AppDataSource.getRepository(Course);
    const deptRepo = AppDataSource.getRepository(Department);
    const department = data.departmentId ? await deptRepo.findOne({ where: { id: data.departmentId } }) : undefined;
    
    await courseRepo.update(id, {
      name: data.name,
      description: data.description,
      department: department || undefined
    });
    return { message: "Course updated successfully" };
  }

  async deleteCourse(id: string) {
    const courseRepo = AppDataSource.getRepository(Course);
    await courseRepo.delete(id);
    return { message: "Course deleted" };
  }

  // SUBJECTS
  async getSubjects() {
    const subjectRepository = AppDataSource.getRepository(Subject);
    return await subjectRepository.find({ relations: { course: true, teacher: true } });
  }

  async createSubject(data: any) {
    const subjectRepository = AppDataSource.getRepository(Subject);
    const courseRepository = AppDataSource.getRepository(Course);
    const userRepository = AppDataSource.getRepository(User);

    const course = await courseRepository.findOne({ where: { id: data.courseId } });
    const teacher = data.teacherId ? await userRepository.findOne({ where: { id: data.teacherId } }) : null;

    const newSubject = subjectRepository.create({
      name: data.name,
      code: data.code,
      semester: data.semester,
      course: course || undefined,
      teacher: teacher || undefined
    });

    return await subjectRepository.save(newSubject);
  }

  async updateSubject(id: string, data: any) {
    const subjectRepo = AppDataSource.getRepository(Subject);
    const courseRepo = AppDataSource.getRepository(Course);
    const userRepo = AppDataSource.getRepository(User);

    const course = data.courseId ? await courseRepo.findOne({ where: { id: data.courseId } }) : undefined;
    const teacher = data.teacherId ? await userRepo.findOne({ where: { id: data.teacherId } }) : undefined;

    await subjectRepo.update(id, {
      name: data.name,
      code: data.code,
      semester: data.semester,
      course: course || undefined,
      teacher: teacher || undefined
    });
    return { message: "Subject updated successfully" };
  }

  async deleteSubject(id: string) {
    const subjectRepo = AppDataSource.getRepository(Subject);
    await subjectRepo.delete(id);
    return { message: "Subject deleted" };
  }

  // USERS
  async getUsers(roleName?: string) {
    const userRepository = AppDataSource.getRepository(User);
    const whereClause = roleName ? { role: { name: roleName } } : {};
    const users = await userRepository.find({ where: whereClause, relations: { department: true, role: true } });
    // Remove password hashes from response
    users.forEach(u => (u as any).passwordHash = undefined);
    return users;
  }

  async createUser(data: any) {
    const { firstName, lastName, email, password, role, departmentId, semester, section, rollNumber, designation } = data;
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    const deptRepository = AppDataSource.getRepository(Department);

    const userRole = await roleRepository.findOne({ where: { name: role } });
    const department = departmentId ? await deptRepository.findOne({ where: { id: departmentId } }) : null;

    if (!userRole) {
      throw new Error("Invalid role");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({
      firstName, lastName, email, passwordHash, role: userRole, department: department || undefined,
      semester, section, rollNumber, designation
    });
    
    await userRepository.save(newUser);
    return { message: "User created" };
  }

  async updateUser(id: string, data: any) {
    const { firstName, lastName, email, departmentId, semester, section, rollNumber, designation } = data;
    const userRepo = AppDataSource.getRepository(User);
    const deptRepo = AppDataSource.getRepository(Department);

    const department = departmentId ? await deptRepo.findOne({ where: { id: departmentId } }) : undefined;

    await userRepo.update(id, {
      firstName, lastName, email, department: department || undefined,
      semester, section, rollNumber, designation
    });
    
    return { message: "User updated successfully" };
  }

  async deleteUser(id: string) {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.delete(id);
    return { message: "User deleted" };
  }
}

export const adminService = new AdminService();
