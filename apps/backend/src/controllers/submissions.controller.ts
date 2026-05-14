import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http.js";
import { gradeObjective } from "../services/grading.service.js";

const canAccessSubmission = (reqUser: Express.UserContext | undefined, ownerId: number) => {
  if (!reqUser) return false;
  return reqUser.id === ownerId || reqUser.role === "ADMIN" || reqUser.role === "SUPER_ADMIN";
};

export const startSubmission = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const room = await prisma.examRoom.findUnique({ where: { id: req.body.roomId }, include: { exam: true } });
  if (!room) throw new HttpError(404, "Room not found");

  const attempts = await prisma.submission.count({ where: { userId: req.user.id, room: { examId: room.examId }, submittedAt: { not: null } } });
  if (attempts >= room.exam.maxAttempts) throw new HttpError(403, "Maximum attempts reached");

  const submission = await prisma.submission.upsert({
    where: { roomId_userId: { roomId: room.id, userId: req.user.id } },
    update: {},
    create: { roomId: room.id, userId: req.user.id }
  });
  res.status(201).json(submission);
});

export const saveSubmission = asyncHandler(async (req, res) => {
  const current = await prisma.submission.findUnique({ where: { id: Number(req.params.id) } });
  if (!current) throw new HttpError(404, "Submission not found");
  if (!canAccessSubmission(req.user, current.userId)) throw new HttpError(403, "Forbidden");
  const submission = await prisma.submission.update({
    where: { id: Number(req.params.id) },
    data: { answers: req.body.answers }
  });
  req.app.get("io")?.to(`submission:${submission.id}`).emit("answer-saved", { submissionId: submission.id });
  res.json(submission);
});

export const submitSubmission = asyncHandler(async (req, res) => {
  const existing = await prisma.submission.findUnique({
    where: { id: Number(req.params.id) },
    include: { room: { include: { exam: { include: { examItems: { include: { question: true } } } } } } }
  });
  if (!existing) throw new HttpError(404, "Submission not found");
  if (!canAccessSubmission(req.user, existing.userId)) throw new HttpError(403, "Forbidden");
  if (existing.submittedAt) throw new HttpError(409, "Submission already submitted");

  const result = gradeObjective(existing.room.exam, existing.answers as Record<string, unknown>);
  const submission = await prisma.submission.update({
    where: { id: existing.id },
    data: {
      score: result.score,
      totalPoints: result.totalPoints,
      isPassed: result.isPassed,
      submittedAt: new Date(),
      gradedItems: { create: result.manualItems }
    },
    include: { user: true }
  });
  req.app.get("io")?.to(`room:${submission.roomId}:admin`).emit("user-submitted", { userId: submission.userId, name: submission.user.name });
  res.json(submission);
});

export const getSubmission = asyncHandler(async (req, res) => {
  const item = await prisma.submission.findUnique({
    where: { id: Number(req.params.id) },
    include: { room: { include: { exam: true } }, gradedItems: true }
  });
  if (!item) throw new HttpError(404, "Submission not found");
  if (!canAccessSubmission(req.user, item.userId)) throw new HttpError(403, "Forbidden");
  res.json(item);
});

export const reviewSubmission = asyncHandler(async (req, res) => {
  const item = await prisma.submission.findUnique({
    where: { id: Number(req.params.id) },
    include: { room: { include: { exam: { include: { examItems: { include: { question: true }, orderBy: { order: "asc" } } } } } }, gradedItems: true }
  });
  if (!item) throw new HttpError(404, "Submission not found");
  if (!canAccessSubmission(req.user, item.userId)) throw new HttpError(403, "Forbidden");
  if (!item.room.exam.showAnswerAfter) {
    res.json({ ...item, room: { ...item.room, exam: { ...item.room.exam, examItems: [] } } });
    return;
  }
  res.json(item);
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const items = req.body.items as { questionId: number; score: number; feedback?: string }[];
  const submissionId = Number(req.params.id);
  await prisma.$transaction(
    items.map((item) =>
      prisma.gradedItem.updateMany({
        where: { submissionId, questionId: item.questionId },
        data: { score: item.score, feedback: item.feedback, gradedById: req.user?.id, gradedAt: new Date() }
      })
    )
  );
  const graded = await prisma.gradedItem.findMany({ where: { submissionId } });
  const manualScore = graded.reduce((sum, item) => sum + (item.score ?? 0), 0);
  const current = await prisma.submission.findUnique({ where: { id: submissionId } });
  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: { score: (current?.score ?? 0) + manualScore }
  });
  res.json(submission);
});

export const listRoomSubmissions = asyncHandler(async (req, res) => {
  const items = await prisma.submission.findMany({
    where: { roomId: Number(req.params.id) },
    include: { user: { select: { id: true, name: true, email: true } }, gradedItems: true },
    orderBy: { startedAt: "desc" }
  });
  res.json(items);
});

export const incrementTabSwitch = asyncHandler(async (req, res) => {
  const current = await prisma.submission.findUnique({ where: { id: Number(req.params.id) } });
  if (!current) throw new HttpError(404, "Submission not found");
  if (!canAccessSubmission(req.user, current.userId)) throw new HttpError(403, "Forbidden");
  const submission = await prisma.submission.update({
    where: { id: Number(req.params.id) },
    data: { tabSwitches: { increment: 1 } }
  });
  res.json({ tabSwitches: submission.tabSwitches });
});
