import { Role } from "@prisma/client";
import type { Request, Response } from "express";
import { Router } from "express";
import { createUser, deleteUser, getUser, listUsers, toggleUser, updateUser } from "../controllers/users.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listUsersSchema, upsertUserSchema } from "../validators/users.js";
import { upload } from "../utils/upload.js";

export const usersRoutes = Router();
const adminOnly = [requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN)];

usersRoutes.get("/", adminOnly, validate(listUsersSchema), listUsers);
usersRoutes.get("/:id", adminOnly, getUser);
usersRoutes.post("/", adminOnly, validate(upsertUserSchema), createUser);
usersRoutes.put("/:id", adminOnly, validate(upsertUserSchema), updateUser);
usersRoutes.delete("/:id", adminOnly, deleteUser);
usersRoutes.patch("/:id/toggle-status", adminOnly, toggleUser);
usersRoutes.post("/import", adminOnly, upload.single("file"), (_req: Request, res: Response) => res.status(202).json({ message: "CSV import queued" }));
