import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  webServer: {
    command:
      "NODE_ENV=test DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/enneagram USE_IN_MEMORY_ASSESSMENT_DRAFTS=true USE_IN_MEMORY_ASSESSMENT_RESULTS=true npm run dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
});
