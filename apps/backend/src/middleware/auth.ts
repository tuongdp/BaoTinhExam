import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http.js";

interface AccessPayload {
  sub: number;
  email: string;
  role: Role;
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw new HttpError(401, "Missing access token");

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessPayload;
    req.user = { id: Number(payload.sub), email: payload.email, role: payload.role };
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired access token");
  }
};

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, "Unauthorized");
    if (!roles.includes(req.user.role)) throw new HttpError(403, "Forbidden");
    next();
  };
