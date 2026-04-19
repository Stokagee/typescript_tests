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

  reporter: [
  ["list"],
  ["html", { open: "never" }],
  ["allure-playwright", { detail: true, outputFolder: "allure-results" }],
  ...(process.env.CI ? [["junit", { outputFile: "test-results/junit.xml" }] as const] : []),
],

  projects: [
    {
      name: "api",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.unauth\.spec\.ts/,
      timeout: 30_000,
      use: {
        baseURL: env.BASE_URL,
        extraHTTPHeaders: loadAuthHeaders(),
        trace: "retain-on-failure",   // Pro CI "on-first-retry".
      },
    },
    {
      name: "api-unauth",
      testMatch: /.*\.unauth\.spec\.ts/,
      timeout: 5_000,
      use: {
        baseURL: env.BASE_URL,
      },
    },
  ],
});