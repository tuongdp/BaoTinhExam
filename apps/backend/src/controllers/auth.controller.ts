import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http.js";
import { refreshExpiry, signAccessToken, signRefreshToken } from "../utils/tokens.js";

export const register = asyncHandler(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (existing) throw new HttpError(409, "Email already exists");

  const password = await bcrypt.hash(req.body.password, 12);
  const user = await prisma.user.create({
    data: { email: req.body.email, name: req.body.name, password }
  });

  res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

export const login = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user?.password || !user.isActive) throw new HttpError(401, "Invalid credentials");

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) throw new HttpError(401, "Invalid credentials");

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiry() }
  });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: req.body.refreshToken },
    include: { user: true }
  });
  if (!stored || stored.expiresAt < new Date() || !stored.user.isActive) {
    throw new HttpError(401, "Invalid refresh token");
  }

  try {
    jwt.verify(req.body.refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new HttpError(401, "Invalid refresh token");
  }

  res.json({ accessToken: signAccessToken(stored.user) });
});

export const logout = asyncHandler(async (req, res) => {
  const token = String(req.body.refreshToken ?? "");
  if (token) await prisma.refreshToken.deleteMany({ where: { token } });
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, "Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, avatar: true, role: true, isActive: true }
  });
  res.json(user);
});
