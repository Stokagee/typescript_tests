import { defineConfig } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";

function loadAuthHeaders(): Record<string, string> {
  const authFile = "playwright/.auth/user.json";
  if (!existsSync(authFile)) {
    return {};
  }
  try {
    const { token } = JSON.parse(readFileSync(authFile, "utf-8"));
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.ts",
  reporter: [["list"], ["html", { open: "never" }]],

  projects: [
    {
      name: "api",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.unauth\.spec\.ts/,
      use: {
        baseURL: "http://localhost:20300",
        extraHTTPHeaders: loadAuthHeaders(),
      },
    },
    {
      name: "api-unauth",
      testMatch: /.*\.unauth\.spec\.ts/,
      use: {
        baseURL: "http://localhost:20300",
      },
    },
  ],
});