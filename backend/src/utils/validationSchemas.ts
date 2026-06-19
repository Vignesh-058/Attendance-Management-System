import { z } from "zod";

const passwordPolicy = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordPolicy,
    role: z.enum(["Teacher", "Student"], { message: "Role must be Teacher or Student. Admin registration is prohibited." })
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    expectedRole: z.string().optional()
  })
});

export const departmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Department name must be at least 2 characters"),
    description: z.string().optional()
  })
});

export const courseSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Course name is required"),
    description: z.string().optional(),
    departmentId: z.number().int().positive().optional()
  })
});

export const subjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Subject name is required"),
    code: z.string().min(2, "Subject code is required"),
    semester: z.string().min(1, "Semester is required"),
    courseId: z.number().int().positive(),
    teacherId: z.number().int().positive().optional()
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address")
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    otp: z.string().min(1, "OTP is required"),
    newPassword: passwordPolicy
  })
});

export const attendanceDataSchema = z.object({
  body: z.object({
    subjectId: z.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    startTime: z.string(),
    endTime: z.string(),
    attendanceData: z.array(z.object({
      studentId: z.number().int().positive(),
      status: z.enum(["Present", "Absent", "Leave"])
    }))
  })
});

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordPolicy,
    role: z.enum(["Admin", "Teacher", "Student"], { message: "Role is required" }),
    departmentId: z.number().int().positive().optional(),
    semester: z.string().optional(),
    section: z.string().optional(),
    rollNumber: z.string().optional(),
    designation: z.string().optional()
  })
});
