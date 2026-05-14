import { Prisma, type Difficulty, type MediaType, type QuestionType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError, pageMeta } from "../utils/http.js";

const topicConnections = (topics: string[]) => ({
  set: [],
  connectOrCreate: topics.map((name) => ({
    where: { name },
    create: { name }
  }))
});

export const listQuestions = asyncHandler(async (req, res) => {
  const { page, limit, type, difficulty, topic, search } = req.query as unknown as {
    page: number;
    limit: number;
    type?: QuestionType;
    difficulty?: Difficulty;
    topic?: string;
    search?: string;
  };
  const where: Prisma.QuestionWhereInput = {
    ...(type ? { type } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(search ? { content: { contains: search } } : {}),
    ...(topic ? { topics: { some: { name: topic } } } : {})
  };
  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: { topics: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.question.count({ where })
  ]);
  res.json({ items, meta: pageMeta(page, limit, total) });
});

export const getQuestion = asyncHandler(async (req, res) => {
  const item = await prisma.question.findUnique({ where: { id: Number(req.params.id) }, include: { topics: true } });
  if (!item) throw new HttpError(404, "Question not found");
  res.json(item);
});

export const createQuestion = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const data = req.body as {
    type: QuestionType;
    content: string;
    mediaUrl?: string | null;
    mediaType?: MediaType | null;
    options?: Prisma.InputJsonValue;
    correctAnswer?: Prisma.InputJsonValue;
    explanation?: string | null;
    difficulty: Difficulty;
    points: number;
    topics: string[];
  };
  const item = await prisma.question.create({
    data: {
      type: data.type,
      content: data.content,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      difficulty: data.difficulty,
      points: data.points,
      createdById: req.user.id,
      topics: topicConnections(data.topics)
    },
    include: { topics: true }
  });
  res.status(201).json(item);
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const data = req.body as {
    type: QuestionType;
    content: string;
    mediaUrl?: string | null;
    mediaType?: MediaType | null;
    options?: Prisma.InputJsonValue;
    correctAnswer?: Prisma.InputJsonValue;
    explanation?: string | null;
    difficulty: Difficulty;
    points: number;
    topics: string[];
  };
  const item = await prisma.question.update({
    where: { id: Number(req.params.id) },
    data: {
      type: data.type,
      content: data.content,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      difficulty: data.difficulty,
      points: data.points,
      topics: topicConnections(data.topics)
    },
    include: { topics: true }
  });
  res.json(item);
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  await prisma.question.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export const listTopics = asyncHandler(async (_req, res) => {
  res.json(await prisma.topic.findMany({ orderBy: { name: "asc" } }));
});
