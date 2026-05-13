import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const proxyTargets = {
  auth: process.env.AUTH_SERVICE_URL ?? "http://localhost:8081",
  questionnaire: process.env.QUESTIONNAIRE_SERVICE_URL ?? "http://localhost:8082",
  board: process.env.BOARD_SERVICE_URL ?? "http://localhost:8083",
  ai: process.env.AI_TRIAGE_SERVICE_URL ?? "http://localhost:8084",
  hospital: process.env.HOSPITAL_RECOMMENDATION_SERVICE_URL ?? "http://localhost:8085"
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api/auth": proxyTargets.auth,
      "/api/users": proxyTargets.auth,
      "/api/consultations": proxyTargets.questionnaire,
      "/api/board": proxyTargets.board,
      "/api/ai": proxyTargets.ai,
      "/api/hospitals": proxyTargets.hospital
    }
  }
});
