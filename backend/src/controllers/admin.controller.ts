import { Request, Response } from "express";
import { adminService } from "../services/admin.service";
import { ApiResponse } from "../utils/ApiResponse";

// DEPARTMENTS
export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.getDepartments();
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error fetching departments"));
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.createDepartment(req.body);
    res.status(201).json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error creating department"));
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.updateDepartment(req.params.id as string, req.body);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error updating department"));
  }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.deleteDepartment(req.params.id as string);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error deleting department"));
  }
};

// COURSES
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.getCourses();
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error fetching courses"));
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.createCourse(req.body);
    res.status(201).json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error creating course"));
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.updateCourse(req.params.id as string, req.body);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error updating course"));
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.deleteCourse(req.params.id as string);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error deleting course"));
  }
};

// SUBJECTS
export const getSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.getSubjects();
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error fetching subjects"));
  }
};

export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.createSubject(req.body);
    res.status(201).json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error creating subject"));
  }
};

export const updateSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.updateSubject(req.params.id as string, req.body);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error updating subject"));
  }
};

export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.deleteSubject(req.params.id as string);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error deleting subject"));
  }
};

// USERS
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleName = req.query.role as string;
    const result = await adminService.getUsers(roleName);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error fetching users"));
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.createUser(req.body);
    res.status(201).json(ApiResponse.success(result));
  } catch (error: any) {
    res.status(error.message === "Invalid role" ? 400 : 500).json(ApiResponse.error(error.message || "Error creating user"));
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.updateUser(req.params.id as string, req.body);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error updating user"));
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.deleteUser(req.params.id as string);
    res.json(ApiResponse.success(result));
  } catch (error) {
    res.status(500).json(ApiResponse.error("Error deleting user"));
  }
};
