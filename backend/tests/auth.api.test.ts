import request from "supertest";
import express from "express";
import authRoutes from "../src/routes/auth.routes";
import { errorHandler } from "../src/middleware/error.middleware";
import { authService } from "../src/services/auth.service";

jest.mock("../src/services/auth.service");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

describe("Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 if validation fails", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "invalid-email" }); // missing password
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Validation failed");
    });

    it("should login successfully and return tokens", async () => {
      const mockResult = {
        message: "Login successful",
        token: "access_token",
        refreshToken: "refresh_token",
        user: { id: 1, email: "test@college.edu", role: "Admin" }
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@college.edu", password: "password123" });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(authService.login).toHaveBeenCalledWith("test@college.edu", "password123", undefined);
    });

    it("should handle invalid credentials", async () => {
      (authService.login as jest.Mock).mockRejectedValue({ status: 401, message: "Invalid email or password." });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@college.edu", password: "wrongpassword" });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password.");
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@college.edu" });
      
      expect(response.status).toBe(400);
    });

    it("should register successfully", async () => {
      (authService.register as jest.Mock).mockResolvedValue({ message: "Registration successful" });

      const response = await request(app)
        .post("/api/auth/register")
        .send({
          firstName: "John",
          lastName: "Doe",
          email: "john@college.edu",
          password: "password123",
          role: "Student"
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Registration successful");
    });
  });
});
