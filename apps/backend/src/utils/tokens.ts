import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";

export const signAccessToken = (user: { id: number; email: string; role: Role }) =>
  jwt.sign({ email: user.email, role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: String(user.id),
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"]
  } satisfies SignOptions);

export const signRefreshToken = (userId: number) =>
  jwt.sign({}, env.JWT_REFRESH_SECRET, {
    subject: String(userId),
    expiresIn: `${env.REFRESH_TOKEN_DAYS}d` as SignOptions["expiresIn"]
  } satisfies SignOptions);

export const refreshExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_DAYS);
  return expiresAt;
};
