import { Role } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "./common.js";

export const listUsersSchema = z.object({
  query: paginationSchema.extend({
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.coerce.boolean().optional()
  })
});

export const upsertUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(8).optional(),
    role: z.nativeEnum(Role).default(Role.USER),
    isActive: z.boolean().default(true)
  })
});
