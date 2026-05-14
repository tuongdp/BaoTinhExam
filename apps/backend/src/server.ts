import http from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { clientOrigins, env } from "./config/env.js";
import { registerSocketHandlers } from "./socket/index.js";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: clientOrigins, credentials: true } });

app.set("io", io);
registerSocketHandlers(io);

server.listen(env.PORT, () => {
  console.log(`ExamHub API listening on http://localhost:${env.PORT}`);
});
