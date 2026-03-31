import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  webServer: {
    command:
      "rm -rf .next && NODE_ENV=test DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/enneagram ADMIN_PASSWORD='correct horse battery staple' ADMIN_SESSION_SECRET='admin-session-secret-with-at-least-32' USE_IN_MEMORY_ASSESSMENT_DRAFTS=true USE_IN_MEMORY_ASSESSMENT_RESULTS=true npm run build && NODE_ENV=test DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/enneagram ADMIN_PASSWORD='correct horse battery staple' ADMIN_SESSION_SECRET='admin-session-secret-with-at-least-32' USE_IN_MEMORY_ASSESSMENT_DRAFTS=true USE_IN_MEMORY_ASSESSMENT_RESULTS=true PORT=3000 HOSTNAME=127.0.0.1 node .next/standalone/server.js",
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
