import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env, isAllowedOrigin } from "./config/env.js";
import { errorHandler } from "./middleware/error.js";
import { authRoutes } from "./routes/auth.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { examsRoutes } from "./routes/exams.routes.js";
import { questionsRoutes } from "./routes/questions.routes.js";
import { roomsRoutes } from "./routes/rooms.routes.js";
import { submissionsRoutes } from "./routes/submissions.routes.js";
import { usersRoutes } from "./routes/users.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(`/${env.UPLOAD_DIR}`, express.static(env.UPLOAD_DIR));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);
