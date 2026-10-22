import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  fullyParallel: true,
  workers: 2,
  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "/workspace/artifacts/prospect/playwright-report",
        open: "never",
      },
    ],
  ],
  outputDir: "/workspace/artifacts/prospect/test-results",
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
    reducedMotion: "reduce",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 375, height: 844 } } },
  ],
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://127.0.0.1:5173/api/status",
    reuseExistingServer: !process.env.CI,
  },
});
