import { Role } from "@prisma/client";
import type { Request, Response } from "express";
import { Router } from "express";
import { createQuestion, deleteQuestion, getQuestion, listQuestions, listTopics, updateQuestion } from "../controllers/questions.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../utils/upload.js";
import { listQuestionsSchema, questionSchema } from "../validators/questions.js";

export const questionsRoutes = Router();
const adminOnly = [requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN)];

questionsRoutes.get("/", requireAuth, validate(listQuestionsSchema), listQuestions);
questionsRoutes.get("/topics", requireAuth, listTopics);
questionsRoutes.get("/:id", requireAuth, getQuestion);
questionsRoutes.post("/", adminOnly, validate(questionSchema), createQuestion);
questionsRoutes.put("/:id", adminOnly, validate(questionSchema), updateQuestion);
questionsRoutes.delete("/:id", adminOnly, deleteQuestion);
questionsRoutes.post("/import", adminOnly, upload.single("file"), (_req: Request, res: Response) => res.status(202).json({ message: "Question import queued" }));
