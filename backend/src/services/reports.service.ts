import { AppDataSource } from "../config/database";
import { AttendanceRecord } from "../entities/AttendanceRecord";
import { User } from "../entities/User";
import { Subject } from "../entities/Subject";

import { Course } from "../entities/Course";
import { Department } from "../entities/Department";
import { redisClient } from "../config/redis";

const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

export class ReportsService {
  async getDashboardStats(role: string, userId: number) {
    const cacheKey = `dashboard_${role}_${userId}`;

    try {
      if (redisClient.status === "ready") {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      }
    } catch (err) {
      console.error("Redis get error, continuing without cache:", err);
    }

    const userRepository = AppDataSource.getRepository(User);
    const attendanceRepository = AppDataSource.getRepository(AttendanceRecord);
    const subjectRepository = AppDataSource.getRepository(Subject);
    const departmentRepository = AppDataSource.getRepository(Department);
    const courseRepository = AppDataSource.getRepository(Course);

    let result: any = {};

    if (role === "Admin") {
      const totalStudents = await userRepository.count({ where: { role: { name: "Student" } } });
      const totalTeachers = await userRepository.count({ where: { role: { name: "Teacher" } } });
      const totalDepartments = await departmentRepository.count();
      const totalCourses = await courseRepository.count();
      const totalSubjects = await subjectRepository.count();
      
      const allRecords = await attendanceRepository.find({ relations: ["student"] });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysRecords = allRecords.filter(r => r.createdAt >= today);
      const todayPresent = todaysRecords.filter(r => r.status === "Present").length;
      const todaysAttendance = todaysRecords.length ? ((todayPresent / todaysRecords.length) * 100).toFixed(2) : 0;

      const presentCount = allRecords.filter(r => r.status === "Present").length;
      const attendancePercentage = allRecords.length ? ((presentCount / allRecords.length) * 100).toFixed(2) : 0;

      // Calculate defaulters
      const studentMap = new Map<number, { total: number, present: number }>();
      allRecords.forEach(r => {
        const sid = r.student.id;
        if (!studentMap.has(sid)) studentMap.set(sid, { total: 0, present: 0 });
        const data = studentMap.get(sid)!;
        data.total += 1;
        if (r.status === "Present") data.present += 1;
      });

      let totalDefaulters = 0;
      studentMap.forEach((data) => {
        const percentage = (data.present / data.total) * 100;
        if (percentage < 75) totalDefaulters++;
      });

      result = { 
        totalStudents, 
        totalTeachers, 
        totalDepartments,
        totalCourses,
        totalSubjects,
        todaysAttendance,
        attendancePercentage,
        totalDefaulters
      };
    } else if (role === "Teacher") {
      const subjects = await subjectRepository.count({ where: { teacher: { id: userId } } });
      
      const sessionRepo = AppDataSource.getRepository("ClassSession");
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const todaysClasses = await sessionRepo.count({ where: { teacher: { id: userId }, date: dateStr } });
      
      result = { 
        assignedSubjects: subjects,
        todaysClasses: todaysClasses,
        pendingAttendance: "N/A" // Simplified for now, complex logic requires schedule schema
      };
    } else if (role === "Student") {
      const records = await attendanceRepository.find({ where: { student: { id: userId } } });
      const presentCount = records.filter(r => r.status === "Present").length;
      const attendancePercentage = records.length ? ((presentCount / records.length) * 100).toFixed(2) : 0;
      
      let standing = "Defaulter";
      if (Number(attendancePercentage) >= 75) standing = "Good Standing";
      else if (Number(attendancePercentage) >= 60) standing = "Warning";

      result = { 
        attendancePercentage, 
        totalClasses: records.length, 
        attended: presentCount,
        standing
      };
    } else {
      throw new Error("Access denied");
    }

    try {
      if (redisClient.status === "ready") {
        await redisClient.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result));
      }
    } catch (err) {
      console.error("Redis set error, continuing without cache:", err);
    }
    
    return result;
  }

  async getAttendanceTrends(month: number, year: number) {
    const attendanceRepository = AppDataSource.getRepository(AttendanceRecord);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await attendanceRepository.createQueryBuilder("attendance")
      .where("attendance.createdAt >= :startDate AND attendance.createdAt <= :endDate", { startDate, endDate })
      .getMany();

    // Group by day for the trend chart
    const dailyStats = new Map<string, { total: number, present: number }>();

    records.forEach(r => {
      const dateStr = r.createdAt.toISOString().split('T')[0];
      if (!dailyStats.has(dateStr)) dailyStats.set(dateStr, { total: 0, present: 0 });
      const stats = dailyStats.get(dateStr)!;
      stats.total += 1;
      if (r.status === "Present") stats.present += 1;
    });

    const labels: string[] = [];
    const data: number[] = [];

    // Sort dates
    const sortedDates = Array.from(dailyStats.keys()).sort();
    
    sortedDates.forEach(date => {
      const stats = dailyStats.get(date)!;
      labels.push(date);
      data.push(Number(((stats.present / stats.total) * 100).toFixed(2)));
    });

    return {
      labels,
      data
    };
  }

  async getMonthlyReport(month: number, year: number, subjectId?: number, semester?: string) {
    const attendanceRepository = AppDataSource.getRepository(AttendanceRecord);
    
    // Calculate start and end dates for the given month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const query = attendanceRepository.createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.student", "student")
      .leftJoinAndSelect("attendance.classSession", "session")
      .leftJoinAndSelect("session.subject", "subject")
      .where("attendance.createdAt >= :startDate AND attendance.createdAt <= :endDate", { startDate, endDate });

    if (subjectId) {
      query.andWhere("subject.id = :subjectId", { subjectId });
    }
    
    if (semester) {
      query.andWhere("subject.semester = :semester", { semester });
    }

    const records = await query.getMany();

    // Group by student for percentage logic
    const studentStats = new Map<number, { present: number, total: number, name: string }>();

    records.forEach(record => {
      const sid = record.student.id;
      if (!studentStats.has(sid)) {
        studentStats.set(sid, { 
          present: 0, 
          total: 0, 
          name: `${record.student.firstName} ${record.student.lastName}` 
        });
      }
      const data = studentStats.get(sid)!;
      data.total += 1;
      if (record.status === "Present") data.present += 1;
    });

    const reportData = records.map(record => {
      const sid = record.student.id;
      const stats = studentStats.get(sid)!;
      const percentage = (stats.present / stats.total) * 100;

      return {
        user: {
          firstName: record.student.firstName,
          lastName: record.student.lastName,
          email: record.student.email
        },
        subject: record.classSession?.subject?.name,
        status: record.status,
        date: record.createdAt.toISOString().split('T')[0],
        monthAttendancePercentage: percentage.toFixed(2),
        isDefaulter: percentage < 75
      };
    });

    return reportData;
  }
}

export const reportsService = new ReportsService();
