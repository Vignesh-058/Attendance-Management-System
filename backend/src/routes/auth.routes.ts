import { Router } from "express";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication operations
 * 
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
import { login, seedAdmin, register, forgotPassword, resetPassword, refresh, logout } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validation.middleware";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../utils/validationSchemas";

const router = Router();

router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/seed", seedAdmin);
router.post("/register", validateRequest(registerSchema), register);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), resetPassword);

export default router;
