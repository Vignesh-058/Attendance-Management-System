import { Router } from "express";
import { 
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getCourses, createCourse, updateCourse, deleteCourse,
  getSubjects, createSubject, updateSubject, deleteSubject,
  getUsers, createUser, updateUser, deleteUser
} from "../controllers/admin.controller";
import { authenticateJWT, authorizeRole } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { departmentSchema, courseSchema, subjectSchema, createUserSchema } from "../utils/validationSchemas";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRole(["Admin"]));

// Departments
router.get("/departments", getDepartments);
router.post("/departments", validateRequest(departmentSchema), createDepartment);
router.put("/departments/:id", validateRequest(departmentSchema), updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Courses
router.get("/courses", getCourses);
router.post("/courses", validateRequest(courseSchema), createCourse);
router.put("/courses/:id", validateRequest(courseSchema), updateCourse);
router.delete("/courses/:id", deleteCourse);

// Subjects
router.get("/subjects", getSubjects);
router.post("/subjects", validateRequest(subjectSchema), createSubject);
router.put("/subjects/:id", validateRequest(subjectSchema), updateSubject);
router.delete("/subjects/:id", deleteSubject);

// Users (Students / Teachers)
router.get("/users", getUsers);
router.post("/users", validateRequest(createUserSchema), createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
