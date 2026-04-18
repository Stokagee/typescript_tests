import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:20300",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  projects: [
    {
      name: "api",
      testMatch: /.*\.spec\.ts/,
    },
  ],
});