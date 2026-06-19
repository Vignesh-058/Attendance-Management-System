import { Router } from "express";
import { getDashboardStats, getMonthlyReport, getAttendanceTrends } from "../controllers/reports.controller";
import { exportAttendanceCSV, exportAttendancePDF } from "../controllers/export.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

// Protect all routes
router.use(authenticateJWT);

router.get("/dashboard", getDashboardStats);
router.get("/monthly", authorizeRole(["Admin", "Teacher"]), getMonthlyReport);
router.get("/trends", authorizeRole(["Admin", "Teacher"]), getAttendanceTrends);
router.get("/export/csv", authorizeRole(["Admin", "Teacher"]), exportAttendanceCSV);
router.get("/export/pdf", authorizeRole(["Admin", "Teacher"]), exportAttendancePDF);

export default router;
