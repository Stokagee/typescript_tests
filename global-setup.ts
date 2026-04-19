import { request, FullConfig } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { env } from "./config/env";

type TokenParams = {
  username: string;
  role: "user" | "admin";
  userId: number;
  scopes: string;
  filePath: string;
};

async function fetchToken(params: TokenParams): Promise<void> {
  const context = await request.newContext({ baseURL: env.BASE_URL });

  const response = await context.post("/api/v1/auth/test-token", {
    data: {
      username: params.username,
      role: params.role,
      user_id: params.userId,
      scopes: params.scopes,
    },
  });

  if (!response.ok()) {
    const errBody = await response.text();
    throw new Error(
      `Global setup: ${params.role} token fetch failed: ${response.status()}\n${errBody}`
    );
  }

  const body = await response.json();
  const token: string = body.access_token;

  mkdirSync(dirname(params.filePath), { recursive: true });
  writeFileSync(params.filePath, JSON.stringify({ token }, null, 2));

  console.log(`✓ Global setup [${env.TEST_ENV}]: ${params.role} token uložen`);

  await context.dispose();
}

async function globalSetup(_config: FullConfig) {
  console.log(`🔧 Running global setup for TEST_ENV=${env.TEST_ENV}`);
  console.log(`🔧 BASE_URL=${env.BASE_URL}`);

  await fetchToken({
    username: env.TEST_USER_USERNAME,
    role: "user",
    userId: env.TEST_USER_ID,
    scopes: env.TEST_USER_SCOPES,
    filePath: "playwright/.auth/user.json",
  });

  await fetchToken({
    username: env.TEST_ADMIN_USERNAME,
    role: "admin",
    userId: env.TEST_ADMIN_ID,
    scopes: env.TEST_ADMIN_SCOPES,
    filePath: "playwright/.auth/admin.json",
  });
}

export default globalSetup;
