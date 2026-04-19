import { test, expect } from "@playwright/test";

test("backend root endpoint vrací running message", async ({ request }) => {
  // Action: zavolej root endpoint
  const response = await request.get("/");

  // Assertions
  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);

  // Body parse
  const body = await response.json();
  expect(body).toHaveProperty("message");
  expect(body.message).toContain("Moje App API is running!");
});
