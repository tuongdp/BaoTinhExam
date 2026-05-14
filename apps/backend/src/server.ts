import http from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { env, isAllowedOrigin } from "./config/env.js";
import { registerSocketHandlers } from "./socket/index.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true
  }
});

app.set("io", io);
registerSocketHandlers(io);

server.listen(env.PORT, () => {
  console.log(`API ExamHub đang chạy tại cổng ${env.PORT}`);
});
