import { chromium, request, FullConfig } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

async function globalSetup(config: FullConfig) {
  const baseURL = "http://localhost:20300";
  const authFile = "playwright/.auth/user.json";

  const context = await request.newContext({ baseURL });

  const response = await context.post("/api/v1/auth/test-token", {
    data: {
      username: "test_user",
      role: "user",
      user_id: 1,
      scopes: "orders:read orders:write couriers:read couriers:write",
    },
  });

  if (!response.ok()) {
    throw new Error(`Global setup: token fetch failed: ${response.status()}`);
  }

  const body = await response.json();
  const token: string = body.access_token;

  mkdirSync(dirname(authFile), { recursive: true });
  writeFileSync(authFile, JSON.stringify({ token }, null, 2));

  console.log(`✓ Global setup: token získán, uložen do ${authFile}`);

  await context.dispose();
}

export default globalSetup;