import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError } from "../utils/http.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(422).json({ message: "Dữ liệu không hợp lệ", issues: error.flatten() });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message, details: error.details });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error(error);
    res.status(503).json({ message: "Không kết nối được cơ sở dữ liệu" });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(error);
    if (["P1000", "P1001", "P1017"].includes(error.code)) {
      res.status(503).json({ message: "Không kết nối được cơ sở dữ liệu" });
      return;
    }
    if (["P2021", "P2022"].includes(error.code)) {
      res.status(503).json({ message: "Cơ sở dữ liệu chưa được đồng bộ schema" });
      return;
    }
  }

  console.error(error);
  res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
};
