import { Role } from "@prisma/client";
import { Router } from "express";
import { createRoom, endRoom, getRoom, joinRoom, kickUser, leaderboard, listRooms, roomStats, startRoom } from "../controllers/rooms.controller.js";
import { listRoomSubmissions } from "../controllers/submissions.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createRoomSchema, joinRoomSchema, listRoomsSchema } from "../validators/rooms.js";

export const roomsRoutes = Router();
const adminOnly = [requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN)];

roomsRoutes.get("/", requireAuth, validate(listRoomsSchema), listRooms);
roomsRoutes.get("/:id", requireAuth, getRoom);
roomsRoutes.post("/", adminOnly, validate(createRoomSchema), createRoom);
roomsRoutes.patch("/:id/start", adminOnly, startRoom);
roomsRoutes.patch("/:id/end", adminOnly, endRoom);
roomsRoutes.post("/join", requireAuth, validate(joinRoomSchema), joinRoom);
roomsRoutes.delete("/:id/kick/:userId", adminOnly, kickUser);
roomsRoutes.get("/:id/leaderboard", requireAuth, leaderboard);
roomsRoutes.get("/:id/stats", requireAuth, roomStats);
roomsRoutes.get("/:id/submissions", adminOnly, listRoomSubmissions);
