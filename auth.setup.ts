import { defineConfig } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";

function getAuthHeaders(): Record<string, string> {
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
  reporter: [["list"], ["html", { open: "never" }]],

  projects: [
    {
      name: "api",
      testMatch: /.*\.spec\.ts/,
      use: {
        baseURL: "http://localhost:20300",
        // Funkce se vyhodnotí LATE, při skutečném startu projectu,
        // kdy už globalSetup doběhl
        extraHTTPHeaders: getAuthHeaders(),
      },
    },
  ],
});
