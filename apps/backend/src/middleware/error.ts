import type { ErrorRequestHandler } from "express";
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

  console.error(error);
  res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
};
