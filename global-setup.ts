import { request, FullConfig } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

type TokenParams = {
  baseURL: string;
  username: string;
  role: "user" | "admin";
  userId: number;
  scopes: string;
  filePath: string;
};

async function fetchToken(params: TokenParams): Promise<void> {
  const context = await request.newContext({ baseURL: params.baseURL });

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

  console.log(
    `✓ Global setup: ${params.role} token uložen do ${params.filePath}`
  );

  await context.dispose();
}

async function globalSetup(_config: FullConfig) {
  const baseURL = "http://localhost:20300";

  await fetchToken({
    baseURL,
    username: "test_user",
    role: "user",
    userId: 1,
    scopes: "orders:read orders:write couriers:read couriers:write",
    filePath: "playwright/.auth/user.json",
  });

  await fetchToken({
    baseURL,
    username: "test_admin",
    role: "admin",
    userId: 2,
    scopes:
      "orders:read orders:write orders:admin couriers:read couriers:write",
    filePath: "playwright/.auth/admin.json",
  });
}

export default globalSetup;
