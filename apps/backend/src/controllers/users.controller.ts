import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError, pageMeta } from "../utils/http.js";

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role, isActive } = req.query as unknown as {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    isActive?: boolean;
  };
  const where = {
    ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] } : {}),
    ...(role ? { role } : {}),
    ...(typeof isActive === "boolean" ? { isActive } : {})
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, avatar: true, role: true, isActive: true, createdAt: true }
    }),
    prisma.user.count({ where })
  ]);
  res.json({ items, meta: pageMeta(page, limit, total) });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      isActive: true,
      submissions: { include: { room: { include: { exam: true } } }, orderBy: { startedAt: "desc" } }
    }
  });
  if (!user) throw new HttpError(404, "User not found");
  res.json(user);
});

export const createUser = asyncHandler(async (req, res) => {
  const password = req.body.password ? await bcrypt.hash(req.body.password, 12) : undefined;
  const user = await prisma.user.create({ data: { ...req.body, password } });
  res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

export const updateUser = asyncHandler(async (req, res) => {
  const password = req.body.password ? await bcrypt.hash(req.body.password, 12) : undefined;
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { ...req.body, ...(password ? { password } : {}) }
  });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, isActive: user.isActive });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export const toggleUser = asyncHandler(async (req, res) => {
  const current = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!current) throw new HttpError(404, "User not found");
  const user = await prisma.user.update({ where: { id: current.id }, data: { isActive: !current.isActive } });
  res.json({ id: user.id, isActive: user.isActive });
});
