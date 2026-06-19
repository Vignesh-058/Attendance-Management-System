import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { Department } from "../entities/Department";
import { AttendanceRecord } from "../entities/AttendanceRecord";
import * as dotenv from "dotenv";

dotenv.config();

import { Course } from "../entities/Course";
import { Subject } from "../entities/Subject";
import { ClassSession } from "../entities/ClassSession";
import { RefreshToken } from "../entities/RefreshToken";
import { AuditLog } from "../entities/AuditLog";

export const AppDataSource = new DataSource({
  type: "postgres",
  ...(process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Required for managed databases like Supabase
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "attendance",
      }),
  synchronize: false, // Turned off for production safety
  logging: false,
  entities: [User, Role, Department, AttendanceRecord, Course, Subject, ClassSession, RefreshToken, AuditLog],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
});
