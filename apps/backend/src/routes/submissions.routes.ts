import { Role } from "@prisma/client";
import { Router } from "express";
import { getSubmission, gradeSubmission, incrementTabSwitch, listRoomSubmissions, reviewSubmission, saveSubmission, startSubmission, submitSubmission } from "../controllers/submissions.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { gradeSubmissionSchema, saveSubmissionSchema, startSubmissionSchema } from "../validators/submissions.js";

export const submissionsRoutes = Router();

submissionsRoutes.post("/start", requireAuth, validate(startSubmissionSchema), startSubmission);
submissionsRoutes.post("/:id/save", requireAuth, validate(saveSubmissionSchema), saveSubmission);
submissionsRoutes.post("/:id/submit", requireAuth, submitSubmission);
submissionsRoutes.patch("/:id/tab-switch", requireAuth, incrementTabSwitch);
submissionsRoutes.get("/:id", requireAuth, getSubmission);
submissionsRoutes.get("/:id/review", requireAuth, reviewSubmission);
submissionsRoutes.put("/:id/grade", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN), validate(gradeSubmissionSchema), gradeSubmission);
submissionsRoutes.get("/room/:id", requireAuth, requireRole(Role.SUPER_ADMIN, Role.ADMIN), listRoomSubmissions);
