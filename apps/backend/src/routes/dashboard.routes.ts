import { Role } from "@prisma/client";
import { Router } from "express";
import { activity, liveRooms, stats } from "../controllers/dashboard.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const dashboardRoutes = Router();
const adminOnly = [requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN)];

dashboardRoutes.get("/stats", adminOnly, stats);
dashboardRoutes.get("/activity", adminOnly, activity);
dashboardRoutes.get("/live-rooms", adminOnly, liveRooms);
