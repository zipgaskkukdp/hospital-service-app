import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/auth": "http://localhost:8081",
      "/api/users": "http://localhost:8081",
      "/api/consultations": "http://localhost:8082",
      "/api/board": "http://localhost:8083",
      "/api/ai": "http://localhost:8084",
      "/api/hospitals": "http://localhost:8085"
    }
  }
});
