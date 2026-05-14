import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000", { autoConnect: false }), []);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
};
