import { ExamMode, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError, pageMeta } from "../utils/http.js";

type ExamItemInput = { questionId: number; order: number; points: number };
type ExamBody = {
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  subject?: string | null;
  duration: number;
  openAt?: Date | null;
  closeAt?: Date | null;
  mode: ExamMode;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultAfter: boolean;
  showAnswerAfter: boolean;
  passScore?: number | null;
  maxAttempts: number;
  timeLimitPerQ?: number | null;
  canGoBack: boolean;
  isPublished: boolean;
  items: ExamItemInput[];
};

export const listExams = asyncHandler(async (req, res) => {
  const { page, limit, search, isPublished } = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
    isPublished?: boolean;
  };
  const where: Prisma.ExamWhereInput = {
    ...(search ? { title: { contains: search } } : {}),
    ...(typeof isPublished === "boolean" ? { isPublished } : {})
  };
  const [items, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      include: { examItems: true, rooms: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.exam.count({ where })
  ]);
  res.json({ items, meta: pageMeta(page, limit, total) });
});

export const getExam = asyncHandler(async (req, res) => {
  const item = await prisma.exam.findUnique({
    where: { id: Number(req.params.id) },
    include: { examItems: { include: { question: { include: { topics: true } } }, orderBy: { order: "asc" } } }
  });
  if (!item) throw new HttpError(404, "Exam not found");
  res.json(item);
});

export const createExam = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const data = req.body as ExamBody;
  const exam = await prisma.exam.create({
    data: {
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      subject: data.subject,
      duration: data.duration,
      openAt: data.openAt,
      closeAt: data.closeAt,
      mode: data.mode,
      shuffleQuestions: data.shuffleQuestions,
      shuffleOptions: data.shuffleOptions,
      showResultAfter: data.showResultAfter,
      showAnswerAfter: data.showAnswerAfter,
      passScore: data.passScore,
      maxAttempts: data.maxAttempts,
      timeLimitPerQ: data.timeLimitPerQ,
      canGoBack: data.canGoBack,
      isPublished: data.isPublished,
      createdById: req.user.id,
      examItems: { create: data.items }
    },
    include: { examItems: true }
  });
  res.status(201).json(exam);
});

export const updateExam = asyncHandler(async (req, res) => {
  const data = req.body as ExamBody;
  const examId = Number(req.params.id);
  const exam = await prisma.$transaction(async (tx) => {
    await tx.examItem.deleteMany({ where: { examId } });
    return tx.exam.update({
      where: { id: examId },
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        subject: data.subject,
        duration: data.duration,
        openAt: data.openAt,
        closeAt: data.closeAt,
        mode: data.mode,
        shuffleQuestions: data.shuffleQuestions,
        shuffleOptions: data.shuffleOptions,
        showResultAfter: data.showResultAfter,
        showAnswerAfter: data.showAnswerAfter,
        passScore: data.passScore,
        maxAttempts: data.maxAttempts,
        timeLimitPerQ: data.timeLimitPerQ,
        canGoBack: data.canGoBack,
        isPublished: data.isPublished,
        examItems: { create: data.items }
      },
      include: { examItems: true }
    });
  });
  res.json(exam);
});

export const deleteExam = asyncHandler(async (req, res) => {
  await prisma.exam.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export const publishExam = asyncHandler(async (req, res) => {
  const exam = await prisma.exam.update({ where: { id: Number(req.params.id) }, data: { isPublished: true } });
  res.json(exam);
});

export const replaceExamItems = asyncHandler(async (req, res) => {
  const examId = Number(req.params.id);
  const { items } = req.body as { items: ExamItemInput[] };
  await prisma.$transaction([
    prisma.examItem.deleteMany({ where: { examId } }),
    prisma.examItem.createMany({ data: items.map((item) => ({ ...item, examId })) })
  ]);
  res.json(await prisma.examItem.findMany({ where: { examId }, orderBy: { order: "asc" } }));
});
