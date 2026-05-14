import { Prisma } from "@prisma/client";
import type { Server } from "socket.io";
import { prisma } from "../config/prisma.js";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("join-room", ({ roomId, userId }: { roomId: number; userId: number }) => {
      socket.join(`room:${roomId}`);
      socket.join(`room:${roomId}:user:${userId}`);
      socket.to(`room:${roomId}:admin`).emit("user-joined", { userId });
    });

    socket.on("join-admin-room", ({ roomId }: { roomId: number }) => {
      socket.join(`room:${roomId}:admin`);
    });

    socket.on("leave-room", ({ roomId }: { roomId: number }) => {
      socket.leave(`room:${roomId}`);
    });

    socket.on("save-answer", async ({ submissionId, questionId, answer }: { submissionId: number; questionId: number; answer: unknown }) => {
      const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
      if (!submission) return;
      const answers = { ...(submission.answers as Record<string, unknown>), [String(questionId)]: answer };
      await prisma.submission.update({ where: { id: submissionId }, data: { answers: answers as Prisma.InputJsonObject } });
      socket.emit("answer-saved", { submissionId, questionId });
    });

    socket.on("tab-switch", async ({ submissionId }: { submissionId: number }) => {
      await prisma.submission.update({ where: { id: submissionId }, data: { tabSwitches: { increment: 1 } } });
    });

    socket.on("request-time", async ({ roomId }: { roomId: number }) => {
      const room = await prisma.examRoom.findUnique({ where: { id: roomId }, include: { exam: true } });
      if (!room?.startAt) return;
      const end = room.startAt.getTime() + room.exam.duration * 60_000;
      socket.emit("time-sync", { remainingSeconds: Math.max(0, Math.floor((end - Date.now()) / 1000)) });
    });
  });

  let isSyncingRooms = false;
  let lastTimerWarningAt = 0;

  setInterval(async () => {
    if (isSyncingRooms) return;
    isSyncingRooms = true;
    try {
      const rooms = await prisma.examRoom.findMany({ where: { status: "IN_PROGRESS" }, include: { exam: true } });
      for (const room of rooms) {
        if (!room.startAt) continue;
        const remainingSeconds = Math.max(0, Math.floor((room.startAt.getTime() + room.exam.duration * 60_000 - Date.now()) / 1000));
        io.to(`room:${room.id}`).emit("time-sync", { remainingSeconds });
        if (remainingSeconds === 0) io.to(`room:${room.id}`).emit("time-up");
      }
    } catch (error) {
      const now = Date.now();
      if (now - lastTimerWarningAt > 30_000) {
        lastTimerWarningAt = now;
        console.warn("Bỏ qua đồng bộ thời gian phòng thi:", error instanceof Error ? error.message : error);
      }
    } finally {
      isSyncingRooms = false;
    }
  }, 5000);
};
