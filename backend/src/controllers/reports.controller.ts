import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { reportsService } from "../services/reports.service";
import { ApiResponse } from "../utils/ApiResponse";

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user?.role;
    const userId = req.user?.userId;

    if (!role || !userId) {
      res.status(401).json(ApiResponse.error("Unauthorized"));
      return;
    }

    const result = await reportsService.getDashboardStats(role, userId);
    res.json(ApiResponse.success(result));
  } catch (error: any) {
    if (error.message === "Access denied") {
      res.status(403).json(ApiResponse.error("Access denied"));
    } else {
      res.status(500).json(ApiResponse.error("Internal server error."));
    }
  }
};

export const getMonthlyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();
    const subjectId = req.query.subjectId ? Number(req.query.subjectId) : undefined;
    const semester = req.query.semester as string | undefined;

    const result = await reportsService.getMonthlyReport(month, year, subjectId, semester);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Internal server error."));
  }
};

export const getAttendanceTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    const result = await reportsService.getAttendanceTrends(month, year);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Internal server error."));
  }
};
