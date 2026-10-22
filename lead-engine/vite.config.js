import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import apiPlugin from "./dev/api-plugin.js";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "GEMINI_API_KEY",
    "GEMINI_MODEL",
    "APP_ACCESS_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "CRON_SECRET",
  ]) {
    if (!process.env[key] && env[key]) process.env[key] = env[key];
  }
  return { plugins: [react(), apiPlugin()], server: { host: "0.0.0.0" } };
});
