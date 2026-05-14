import { z } from "zod";
import { paginationSchema } from "./common.js";

export const listRoomsSchema = z.object({
  query: paginationSchema.extend({ search: z.string().optional() })
});

export const createRoomSchema = z.object({
  body: z.object({
    examId: z.number().int().positive(),
    name: z.string().min(1),
    isPrivate: z.boolean().default(false)
  })
});

export const joinRoomSchema = z.object({
  body: z.object({ code: z.string().min(6).max(6) })
});
