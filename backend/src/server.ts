import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";

// Load environment variables
dotenv.config();

// Strict environment validation
const requiredEnvVars = [
  "JWT_SECRET", 
  "JWT_REFRESH_SECRET", 
  "ADMIN_EMAIL", 
  "ADMIN_PASSWORD",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS"
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import attendanceRoutes from "./routes/attendance.routes";
import reportsRoutes from "./routes/reports.routes";
import adminRoutes from "./routes/admin.routes";

import { errorHandler } from "./middleware/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { logger } from "./utils/logger";
import { redisClient } from "./config/redis";

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Attendance Management System API is running." });
});

// Health Monitoring Endpoint
app.get("/health", async (req, res) => {
  try {
    const dbStatus = AppDataSource.isInitialized;
    const redisStatus = redisClient.status === "ready";
    res.status(dbStatus && redisStatus ? 200 : 503).json({
      status: dbStatus && redisStatus ? "healthy" : "unhealthy",
      database: dbStatus ? "connected" : "disconnected",
      redis: redisStatus ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Security Middlewares
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler must be after routes
app.use(errorHandler);

import { authService } from "./services/auth.service";
import cron from "node-cron";

// Initialize database connection
AppDataSource.initialize()
  .then(async () => {
    logger.info("Database connection established successfully.");
    
    // Seed default roles and admin
    await authService.seedAdmin();
    logger.info("Database seeded with default roles.");

    // Refresh Token Cleanup Cron (Runs every day at midnight)
    cron.schedule('0 0 * * *', async () => {
      logger.info('Running daily refresh token cleanup...');
      const tokenRepo = AppDataSource.getRepository("RefreshToken");
      await tokenRepo.createQueryBuilder()
        .delete()
        .where("expiresAt < :now OR isRevoked = true", { now: new Date() })
        .execute();
      logger.info('Cleanup completed.');
    });
    
    // Start the server
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error("Error connecting to the database:", error);
  });
