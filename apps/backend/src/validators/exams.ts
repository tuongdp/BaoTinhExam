import { ExamMode } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "./common.js";

const examItem = z.object({
  questionId: z.number().int().positive(),
  order: z.number().int().nonnegative(),
  points: z.number().positive()
});

export const listExamsSchema = z.object({
  query: paginationSchema.extend({
    search: z.string().optional(),
    isPublished: z.coerce.boolean().optional()
  })
});

export const examSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    thumbnail: z.string().url().optional().nullable(),
    subject: z.string().optional().nullable(),
    duration: z.number().int().positive(),
    openAt: z.coerce.date().optional().nullable(),
    closeAt: z.coerce.date().optional().nullable(),
    mode: z.nativeEnum(ExamMode).default(ExamMode.ALL_AT_ONCE),
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    showResultAfter: z.boolean().default(true),
    showAnswerAfter: z.boolean().default(false),
    passScore: z.number().nonnegative().optional().nullable(),
    maxAttempts: z.number().int().positive().default(1),
    timeLimitPerQ: z.number().int().positive().optional().nullable(),
    canGoBack: z.boolean().default(true),
    isPublished: z.boolean().default(false),
    items: z.array(examItem).default([])
  })
});

export const examItemsSchema = z.object({
  body: z.object({ items: z.array(examItem) })
});
