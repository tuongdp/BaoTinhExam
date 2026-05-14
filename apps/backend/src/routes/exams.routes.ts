import { Role } from "@prisma/client";
import { Router } from "express";
import { createExam, deleteExam, getExam, listExams, publishExam, replaceExamItems, updateExam } from "../controllers/exams.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { examItemsSchema, examSchema, listExamsSchema } from "../validators/exams.js";

export const examsRoutes = Router();
const adminOnly = [requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN)];

examsRoutes.get("/", requireAuth, validate(listExamsSchema), listExams);
examsRoutes.get("/:id", requireAuth, getExam);
examsRoutes.post("/", adminOnly, validate(examSchema), createExam);
examsRoutes.put("/:id", adminOnly, validate(examSchema), updateExam);
examsRoutes.delete("/:id", adminOnly, deleteExam);
examsRoutes.patch("/:id/publish", adminOnly, publishExam);
examsRoutes.post("/:id/items", adminOnly, validate(examItemsSchema), replaceExamItems);
examsRoutes.put("/:id/items", adminOnly, validate(examItemsSchema), replaceExamItems);
