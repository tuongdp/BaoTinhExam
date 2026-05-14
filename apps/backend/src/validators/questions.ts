import { Difficulty, MediaType, QuestionType } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "./common.js";

export const listQuestionsSchema = z.object({
  query: paginationSchema.extend({
    type: z.nativeEnum(QuestionType).optional(),
    difficulty: z.nativeEnum(Difficulty).optional(),
    topic: z.string().optional(),
    search: z.string().optional()
  })
});

export const questionSchema = z.object({
  body: z.object({
    type: z.nativeEnum(QuestionType),
    content: z.string().min(1),
    mediaUrl: z.string().url().optional().nullable(),
    mediaType: z.nativeEnum(MediaType).optional().nullable(),
    options: z.unknown().optional(),
    correctAnswer: z.unknown().optional(),
    explanation: z.string().optional().nullable(),
    difficulty: z.nativeEnum(Difficulty).default(Difficulty.MEDIUM),
    points: z.number().positive().default(1),
    topics: z.array(z.string().min(1)).default([])
  })
});
