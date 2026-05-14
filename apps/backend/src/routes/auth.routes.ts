import { Router } from "express";
import { login, logout, me, refresh, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, refreshSchema, registerSchema } from "../validators/auth.js";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/refresh", validate(refreshSchema), refresh);
authRoutes.post("/logout", logout);
authRoutes.post("/forgot-password", (_req, res) => res.status(202).json({ message: "Luồng gửi email đặt lại mật khẩu đang chờ triển khai" }));
authRoutes.post("/reset-password", (_req, res) => res.status(202).json({ message: "Luồng đặt lại mật khẩu đang chờ triển khai" }));
authRoutes.get("/me", requireAuth, me);
