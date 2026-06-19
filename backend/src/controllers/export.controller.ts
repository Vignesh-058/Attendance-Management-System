import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppDataSource } from "../config/database";
import { AttendanceRecord } from "../entities/AttendanceRecord";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { ApiResponse } from "../utils/ApiResponse";

export const exportAttendanceCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await AppDataSource.getRepository(AttendanceRecord).find({
      relations: {
        student: true,
        classSession: {
          subject: true,
          teacher: true
        }
      },
      order: {
        classSession: { date: "DESC" }
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    worksheet.columns = [
      { header: "Date", key: "date", width: 15 },
      { header: "Subject", key: "subject", width: 20 },
      { header: "Teacher", key: "teacher", width: 25 },
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Status", key: "status", width: 15 }
    ];

    records.forEach(r => {
      worksheet.addRow({
        date: r.classSession.date,
        subject: r.classSession.subject.name,
        teacher: `${r.classSession.teacher.firstName} ${r.classSession.teacher.lastName}`,
        studentName: `${r.student.firstName} ${r.student.lastName}`,
        rollNumber: r.student.rollNumber || "N/A",
        status: r.status
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "attendance_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json(ApiResponse.error("Failed to generate CSV/Excel export"));
  }
};

export const exportAttendancePDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await AppDataSource.getRepository(AttendanceRecord).find({
      relations: {
        student: true,
        classSession: {
          subject: true,
        }
      },
      take: 100, // Limit to 100 to avoid PDF memory issues in this simple implementation
      order: {
        classSession: { date: "DESC" }
      }
    });

    const doc = new PDFDocument();
    let filename = "attendance_report.pdf";
    res.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Attendance Report", { align: "center" });
    doc.moveDown();

    records.forEach(r => {
      doc.fontSize(12).text(
        `Date: ${r.classSession.date} | Subject: ${r.classSession.subject.name} | Student: ${r.student.firstName} ${r.student.lastName} | Status: ${r.status}`
      );
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json(ApiResponse.error("Failed to generate PDF export"));
    }
  }
};
