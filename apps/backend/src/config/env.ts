import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(backendRoot, ".env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  CLIENT_URLS: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_DAYS: z.coerce.number().default(7),
  UPLOAD_DIR: z.string().default("uploads")
});

export const env = envSchema.parse(process.env);

export const clientOrigins = [
  env.CLIENT_URL,
  "https://bao-tinh-exam.vercel.app",
  "https://bao-tinh-exam-backend.vercel.app",
  ...(env.CLIENT_URLS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [])
];

export const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true;
  if (clientOrigins.includes(origin)) return true;
  return /^https:\/\/bao-tinh-exam-[a-z0-9-]+\.vercel\.app$/i.test(origin);
};
