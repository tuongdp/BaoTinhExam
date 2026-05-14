import { z } from "zod";

export const startSubmissionSchema = z.object({
  body: z.object({ roomId: z.number().int().positive() })
});

export const saveSubmissionSchema = z.object({
  body: z.object({ answers: z.record(z.unknown()) })
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        questionId: z.number().int().positive(),
        score: z.number().nonnegative(),
        feedback: z.string().optional()
      })
    )
  })
});
