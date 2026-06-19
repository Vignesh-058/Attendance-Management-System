import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { attendanceService } from "../services/attendance.service";
import { ApiResponse } from "../utils/ApiResponse";

export const getAssignedSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      res.status(401).json(ApiResponse.error("Unauthorized"));
      return;
    }
    const result = await attendanceService.getAssignedSubjects(teacherId);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error fetching subjects"));
  }
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teacherId = req.user?.userId;
    if (!teacherId) {
      res.status(401).json(ApiResponse.error("Unauthorized"));
      return;
    }
    const result = await attendanceService.markAttendance(teacherId, req.body);
    res.json(ApiResponse.success(result));
  } catch (error: any) {
    console.error("Mark attendance error:", error);
    if (error.message === "Teacher or Subject not found") {
      res.status(404).json(ApiResponse.error(error.message));
    } else if (error.message === "A class session with this subject, date, and time already exists.") {
      res.status(400).json(ApiResponse.error(error.message));
    } else {
      res.status(500).json(ApiResponse.error("Internal server error."));
    }
  }
};

export const getStudentAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json(ApiResponse.error("Unauthorized"));
      return;
    }
    const result = await attendanceService.getStudentAttendance(studentId);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error fetching attendance"));
  }
};

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await attendanceService.getStudents();
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error fetching students"));
  }
};
