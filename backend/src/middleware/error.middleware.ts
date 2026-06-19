import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error Handler Caught:", err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json(ApiResponse.error(err.message));
    return;
  }

  // Handle TypeORM or Database unique constraints
  if (err.code === '23505') {
    res.status(409).json(ApiResponse.error("Resource already exists. Duplicate detected."));
    return;
  }

  // Fallback
  res.status(500).json(ApiResponse.error(err.message || "Internal Server Error"));
};
