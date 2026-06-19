import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { RefreshToken } from "../entities/RefreshToken";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export class AuthService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to Ethereal email for testing if no real credentials are provided
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Nodemailer test account created:', testAccount.user);
    }

    return this.transporter;
  }

  async seedAdmin() {
    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("FATAL: ADMIN_EMAIL or ADMIN_PASSWORD missing in environment. Secure setup required.");
    }

    // Create Admin Role & User
    let adminRole = await roleRepository.findOne({ where: { name: "Admin" } });
    if (!adminRole) {
      adminRole = roleRepository.create({ name: "Admin", description: "Administrator" });
      await roleRepository.save(adminRole);
    }

    let existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const adminUser = userRepository.create({
        firstName: "Super",
        lastName: "Admin",
        email: adminEmail,
        passwordHash,
        role: adminRole
      });
      await userRepository.save(adminUser);
    }

    // Initialize Teacher/Student roles to allow registration
    const roles = ["Teacher", "Student"];
    for (const r of roles) {
      let roleExists = await roleRepository.findOne({ where: { name: r } });
      if (!roleExists) {
        await roleRepository.save(roleRepository.create({ name: r, description: `${r} Role` }));
      }
    }

    return { message: "Seed completed successfully using secure environment variables." };
  }

  async login(email: string, password: string, expectedRole?: string) {
    const userRepository = AppDataSource.getRepository(User);
    const tokenRepository = AppDataSource.getRepository(RefreshToken);
    const user = await userRepository.findOne({ where: { email }, relations: { role: true } });

    if (!user) {
      throw { status: 401, message: "Invalid email or password." };
    }

    // Check Lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw { status: 403, message: `Account locked due to multiple failed login attempts. Try again later.` };
    } else if (user.lockedUntil && user.lockedUntil <= new Date()) {
      // Lock expired, reset counters
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await userRepository.save(user);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      }
      await userRepository.save(user);
      throw { status: 401, message: "Invalid email or password." };
    }

    // Successful login, reset lockout
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await userRepository.save(user);
    }

    if (expectedRole && user.role?.name !== expectedRole && user.role?.name !== "Admin") {
      throw { status: 401, message: "Invalid credentials" };
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role?.name },
      (process.env.JWT_SECRET) as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as any }
    );

    const refreshTokenString = jwt.sign(
      { userId: user.id, role: user.role?.name },
      (process.env.JWT_REFRESH_SECRET) as string,
      { expiresIn: "7d" }
    );

    // Save refresh token to database
    const newRefreshToken = tokenRepository.create({
      token: refreshTokenString,
      user: user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await tokenRepository.save(newRefreshToken);

    return {
      message: "Login successful",
      token,
      refreshToken: refreshTokenString,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role?.name,
      },
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw { status: 400, message: "Refresh token is required for logout." };
    }

    const tokenRepository = AppDataSource.getRepository(RefreshToken);
    const dbToken = await tokenRepository.findOne({ where: { token: refreshToken } });

    if (dbToken) {
      dbToken.isRevoked = true;
      await tokenRepository.save(dbToken);
    }

    return { message: "Logged out successfully." };
  }

  async refresh(refreshTokenString: string) {
    if (!refreshTokenString) {
      throw { status: 401, message: "Refresh token is required." };
    }

    const tokenRepository = AppDataSource.getRepository(RefreshToken);
    const dbToken = await tokenRepository.findOne({ where: { token: refreshTokenString }, relations: { user: { role: true } } });

    if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
      throw { status: 403, message: "Invalid or expired refresh token." };
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshTokenString, process.env.JWT_REFRESH_SECRET as string);
    } catch (e) {
      throw { status: 403, message: "Invalid or expired refresh token." };
    }

    const user = dbToken.user;

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role?.name },
      (process.env.JWT_SECRET) as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as any }
    );

    const newRefreshTokenString = jwt.sign(
      { userId: user.id, role: user.role?.name },
      (process.env.JWT_REFRESH_SECRET) as string,
      { expiresIn: "7d" }
    );

    // Revoke old token and create new one (Rotation)
    dbToken.isRevoked = true;
    await tokenRepository.save(dbToken);

    const newRefreshTokenEntity = tokenRepository.create({
      token: newRefreshTokenString,
      user: user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await tokenRepository.save(newRefreshTokenEntity);

    return {
      message: "Token refreshed successfully",
      token: newAccessToken,
      refreshToken: newRefreshTokenString,
    };
  }

  async register(data: any) {
    const { firstName, lastName, email, password, role } = data;

    if (role === "Admin") {
      throw {
        status: 403,
        message: "Admin registration is not allowed."
      };
    }

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw { status: 400, message: "User already exists with this email." };
    }

    const assignedRole = await roleRepository.findOne({ where: { name: role } });
    if (!assignedRole) {
      throw { status: 400, message: "Invalid role selected." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      firstName,
      lastName,
      email,
      passwordHash,
      role: assignedRole
    });

    await userRepository.save(newUser);

    return { message: "Registration successful. You can now log in." };
  }

  async forgotPassword(email: string) {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw { status: 404, message: "No account found with that email." };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, otp },
      (process.env.JWT_SECRET) as string,
      { expiresIn: "15m" }
    );

    const transporter = await this.getTransporter();

    const info = await transporter.sendMail({
      from: '"Attendance Management System" <no-reply@college.edu>',
      to: email,
      subject: "Password Reset Request",
      text: `Your One-Time Password (OTP) to reset your password is: ${otp}`,
      html: `<p>Your One-Time Password (OTP) to reset your password is: <b>${otp}</b></p><p>This OTP is valid for 15 minutes.</p>`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview Email URL: %s', previewUrl);
    }

    return {
      message: "OTP sent successfully to your email address.",
      resetToken: resetToken,
      previewUrl: previewUrl || undefined
    };
  }

  async resetPassword(token: string, otp: string, newPassword: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (e) {
      throw { status: 400, message: "Invalid or expired reset token." };
    }
    
    if (decoded.otp !== otp) {
      throw { status: 400, message: "Invalid or incorrect OTP." };
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      throw { status: 404, message: "User not found." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await userRepository.save(user);

    return { message: "Password reset successful. You can now log in with your new password." };
  }
}

export const authService = new AuthService();
