import { defineConfig } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { env } from "./config/env";

function loadAuthHeaders(): Record<string, string> {
  const authFile = "playwright/.auth/user.json";
  if (!existsSync(authFile)) return {};
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
  
  // Fail-fast retries lokálně, velkorysé v CI
  retries: process.env.CI ? 2 : 0,
  
  // Paralelismus - CI často má omezené cores
  workers: process.env.CI ? 2 : undefined,
  
  // Timeout per test (default 30s je OK, ale ukážu override)
  timeout: 30_000,
  
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    // JUnit pro CI - přidáme v Phase 11
    ...(process.env.CI ? [["junit", { outputFile: "test-results/junit.xml" }] as const] : []),
  ],

  projects: [
    {
      name: "api",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.unauth\.spec\.ts/,
      use: {
        baseURL: env.BASE_URL,
        extraHTTPHeaders: loadAuthHeaders(),
      },
    },
    {
      name: "api-unauth",
      testMatch: /.*\.unauth\.spec\.ts/,
      use: {
        baseURL: env.BASE_URL,
      },
    },
  ],
});