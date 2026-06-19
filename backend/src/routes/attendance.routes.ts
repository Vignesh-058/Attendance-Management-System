import { Router } from "express";
import { getAssignedSubjects, markAttendance, getStudentAttendance, getStudents } from "../controllers/attendance.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { attendanceDataSchema } from "../utils/validationSchemas";

const router = Router();

// Protect all routes with JWT
router.use(authenticateJWT);

router.get("/subjects", authorizeRole(["Teacher"]), getAssignedSubjects);
router.post("/mark", authorizeRole(["Teacher"]), validateRequest(attendanceDataSchema), markAttendance);
router.get("/students", authorizeRole(["Teacher"]), getStudents);
router.get("/student", authorizeRole(["Student"]), getStudentAttendance);

export default router;
