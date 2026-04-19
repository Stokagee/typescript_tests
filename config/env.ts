import { config as loadDotenv } from "dotenv";
import { resolve } from "node:path";
import * as z from "zod";

// 1. Načti .env, pak overrides podle TEST_ENV
const testEnv = process.env["TEST_ENV"] ?? "local";

loadDotenv({
  path: resolve(process.cwd(), ".env"),
  quiet: true, // <-- tohle
});

if (testEnv !== "local") {
  loadDotenv({
    path: resolve(process.cwd(), `.env.${testEnv}`),
    override: true,
    quiet: true, // <-- a tohle
  });
}

// 2. Schéma env variables
const EnvSchema = z.object({
  BASE_URL: z.url(),
  TEST_ENV: z.enum(["local", "staging", "production"]),
  TEST_USER_USERNAME: z.string().min(1),
  TEST_USER_ID: z.coerce.number().int().positive(),
  TEST_USER_SCOPES: z.string().min(1),
  TEST_ADMIN_USERNAME: z.string().min(1),
  TEST_ADMIN_ID: z.coerce.number().int().positive(),
  TEST_ADMIN_SCOPES: z.string().min(1),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
