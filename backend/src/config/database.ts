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

const isUrl = !!process.env.DATABASE_URL;
console.log(`[DEBUG] Initializing database connection... Using URL format: ${isUrl}`);
if (isUrl) {
  try {
    const parsed = new URL(process.env.DATABASE_URL!);
    console.log(`[DEBUG] Trying to connect to host: ${parsed.hostname} on port: ${parsed.port}`);
  } catch(e) {
    console.log(`[DEBUG] DATABASE_URL is not a valid URL format`);
  }
}

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
  logging: ["error", "warn", "info"], // Enable logging to see what's happening
  extra: {
    connectionTimeoutMillis: 10000, // 10 seconds timeout instead of hanging forever
    query_timeout: 10000,
    statement_timeout: 10000
  },
  entities: [User, Role, Department, AttendanceRecord, Course, Subject, ClassSession, RefreshToken, AuditLog],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
});
