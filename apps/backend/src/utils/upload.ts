import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";

fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mp3", ".wav", ".csv", ".xlsx"];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});
