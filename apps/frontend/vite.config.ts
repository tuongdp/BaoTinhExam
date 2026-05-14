import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          socket: ["socket.io-client"],
          ui: [
            "lucide-react",
            "sonner",
            "class-variance-authority",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-select",
            "@radix-ui/react-slot"
          ]
        }
      }
    }
  }
});
