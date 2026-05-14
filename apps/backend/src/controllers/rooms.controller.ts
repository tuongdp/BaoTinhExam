import { customAlphabet } from "nanoid";
import { RoomStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError, pageMeta } from "../utils/http.js";

const code = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export const listRooms = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query as unknown as { page: number; limit: number; search?: string };
  const where = search ? { name: { contains: search } } : {};
  const [items, total] = await Promise.all([
    prisma.examRoom.findMany({ where, include: { exam: true, users: true }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.examRoom.count({ where })
  ]);
  res.json({ items, meta: pageMeta(page, limit, total) });
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await prisma.examRoom.findUnique({
    where: { id: Number(req.params.id) },
    include: { exam: { include: { examItems: { include: { question: true }, orderBy: { order: "asc" } } } }, users: { include: { user: true } } }
  });
  if (!room) throw new HttpError(404, "Room not found");
  res.json(room);
});

export const createRoom = asyncHandler(async (req, res) => {
  const room = await prisma.examRoom.create({
    data: { examId: req.body.examId, name: req.body.name, isPrivate: req.body.isPrivate, code: code() }
  });
  res.status(201).json(room);
});

export const startRoom = asyncHandler(async (req, res) => {
  const room = await prisma.examRoom.update({
    where: { id: Number(req.params.id) },
    data: { status: RoomStatus.IN_PROGRESS, startAt: new Date() },
    include: { exam: true }
  });
  req.app.get("io")?.to(`room:${room.id}`).emit("room-status", { status: room.status, startAt: room.startAt, duration: room.exam.duration });
  res.json(room);
});

export const endRoom = asyncHandler(async (req, res) => {
  const room = await prisma.examRoom.update({
    where: { id: Number(req.params.id) },
    data: { status: RoomStatus.ENDED, endAt: new Date() }
  });
  req.app.get("io")?.to(`room:${room.id}`).emit("room-ended");
  res.json(room);
});

export const joinRoom = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const room = await prisma.examRoom.findUnique({ where: { code: req.body.code } });
  if (!room) throw new HttpError(404, "Room not found");
  await prisma.examRoomUser.upsert({
    where: { roomId_userId: { roomId: room.id, userId: req.user.id } },
    update: {},
    create: { roomId: room.id, userId: req.user.id }
  });
  req.app.get("io")?.to(`room:${room.id}:admin`).emit("user-joined", { userId: req.user.id, email: req.user.email });
  res.json(room);
});

export const kickUser = asyncHandler(async (req, res) => {
  await prisma.examRoomUser.deleteMany({ where: { roomId: Number(req.params.id), userId: Number(req.params.userId) } });
  req.app.get("io")?.to(`room:${req.params.id}:user:${req.params.userId}`).emit("kicked");
  res.status(204).send();
});

export const leaderboard = asyncHandler(async (req, res) => {
  const items = await prisma.submission.findMany({
    where: { roomId: Number(req.params.id), submittedAt: { not: null } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: [{ score: "desc" }, { submittedAt: "asc" }]
  });
  res.json(items);
});

export const roomStats = asyncHandler(async (req, res) => {
  const submissions = await prisma.submission.findMany({ where: { roomId: Number(req.params.id), submittedAt: { not: null } } });
  const scores = submissions.map((item) => item.score ?? 0);
  res.json({
    attempts: submissions.length,
    average: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    highest: scores.length ? Math.max(...scores) : 0,
    lowest: scores.length ? Math.min(...scores) : 0
  });
});
