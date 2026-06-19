import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { ApiResponse } from "../utils/ApiResponse";

export const seedAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.seedAdmin();
    res.json(ApiResponse.success(result));
  } catch (error: any) {
    console.error("Seed error:", error);
    res.status(error.status || 500).json(ApiResponse.error(error.message || "Internal server error."));
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, expectedRole } = req.body;
    const result = await authService.login(email, password, expectedRole);
    res.json(ApiResponse.success(result));
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(error.status || 500).json(ApiResponse.error(error.message || "Internal server error."));
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(ApiResponse.success(result));
  } catch (error: any) {
    console.error("Refresh error:", error);
    res.status(error.status || 500).json(ApiResponse.error(error.message || "Internal server error."));
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(ApiResponse.success(result));
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(error.status || 500).json(ApiResponse.error(error.message || "Internal server error."));
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.json(ApiResponse.success(result));
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(error.status || 500).json(ApiResponse.error(error.message || "Internal server error."));
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, otp, newPassword } = req.body;
    const result = await authService.resetPassword(token, otp, newPassword);
    res.json(ApiResponse.success(result));
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(error.status || 500).json(ApiResponse.error(error.message || "Internal server error."));
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    res.json(ApiResponse.success(result));
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(error.status || 500).json(ApiResponse.error(error.message || "Internal server error."));
  }
};
