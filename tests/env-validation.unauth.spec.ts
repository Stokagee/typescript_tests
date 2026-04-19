import { test, expect } from "@playwright/test";
import { env } from "../config/env";

test.describe("Env validace — fail-fast kontrola prostředí", () => {
  test("BASE_URL ukazuje na živý API server (GET / vrací message)", async ({
    request,
  }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("message");
  });

  test("TEST_ENV je v povoleném rozsahu", () => {
    expect(["local", "staging", "production"]).toContain(env.TEST_ENV);
  });
});
