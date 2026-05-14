import { RoomStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";

export const stats = asyncHandler(async (_req, res) => {
  const [exams, questions, users, rooms] = await Promise.all([
    prisma.exam.count(),
    prisma.question.count(),
    prisma.user.count(),
    prisma.examRoom.count()
  ]);
  res.json({ exams, questions, users, rooms });
});

export const activity = asyncHandler(async (_req, res) => {
  const [submissions, rooms] = await Promise.all([
    prisma.submission.findMany({ take: 10, orderBy: { startedAt: "desc" }, include: { user: true, room: { include: { exam: true } } } }),
    prisma.examRoom.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { exam: true } })
  ]);
  res.json({ submissions, rooms });
});

export const liveRooms = asyncHandler(async (_req, res) => {
  res.json(await prisma.examRoom.findMany({ where: { status: RoomStatus.IN_PROGRESS }, include: { exam: true, users: true } }));
});
