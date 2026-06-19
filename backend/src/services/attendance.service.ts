import { AppDataSource } from "../config/database";
import { AttendanceRecord } from "../entities/AttendanceRecord";
import { ClassSession } from "../entities/ClassSession";
import { Subject } from "../entities/Subject";
import { User } from "../entities/User";

export class AttendanceService {
  async getAssignedSubjects(teacherId: number) {
    const subjectRepository = AppDataSource.getRepository(Subject);
    return await subjectRepository.find({
      where: { teacher: { id: teacherId } },
      relations: { course: true }
    });
  }

  async markAttendance(teacherId: number, data: any) {
    const { subjectId, date, startTime, endTime, attendanceData } = data;
    
    const userRepo = AppDataSource.getRepository(User);
    const subjectRepo = AppDataSource.getRepository(Subject);
    const sessionRepo = AppDataSource.getRepository(ClassSession);

    const teacher = await userRepo.findOne({ where: { id: teacherId } });
    const subject = await subjectRepo.findOne({ where: { id: subjectId } });

    if (!teacher || !subject) {
      throw new Error("Teacher or Subject not found");
    }

    const existingSession = await sessionRepo.findOne({
      where: { subject: { id: subject.id }, date, startTime, endTime }
    });

    if (existingSession) {
      throw new Error("A class session with this subject, date, and time already exists.");
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const session = queryRunner.manager.create(ClassSession, {
        subject,
        teacher,
        date,
        startTime,
        endTime
      });
      await queryRunner.manager.save(session);

      const records = attendanceData.map((data: any) => {
        return queryRunner.manager.create(AttendanceRecord, {
          student: { id: data.studentId } as User,
          classSession: session,
          status: data.status
        });
      });

      await queryRunner.manager.save(records);

      await queryRunner.commitTransaction();
      return { message: "Attendance marked successfully", sessionId: session.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Transaction failed:", error);
      throw new Error("Failed to mark attendance. Transaction rolled back.");
    } finally {
      await queryRunner.release();
    }
  }

  async getStudentAttendance(studentId: number) {
    const recordRepo = AppDataSource.getRepository(AttendanceRecord);
    return await recordRepo.find({
      where: { student: { id: studentId } },
      relations: { classSession: { subject: true } }
    });
  }

  async getStudents() {
    const userRepo = AppDataSource.getRepository(User);
    return await userRepo.find({
      where: { role: { name: "Student" } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        semester: true,
        section: true
      }
    });
  }
}

export const attendanceService = new AttendanceService();
