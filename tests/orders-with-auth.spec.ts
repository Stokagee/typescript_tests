import { test, expect } from "@playwright/test";

test("GET /orders/pending s Bearer tokenem vrací 200", async ({ request }) => {
  // ---------- 1) Získej token ----------
  const tokenResponse = await request.post("/api/v1/auth/test-token", {
    data: {
      username: "test_user",
      role: "user",
      user_id: 1,
      scopes: "orders:read",
    },
  });
  expect(tokenResponse.status()).toBe(200);

  const tokenBody = await tokenResponse.json();
  const accessToken: string = tokenBody.access_token;
  expect(accessToken).toBeTruthy();
  expect(accessToken.length).toBeGreaterThan(20);

  // ---------- 2) Použij token pro autentizovaný request ----------
  const ordersResponse = await request.get("/api/v1/orders/pending", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  expect(ordersResponse.status()).toBe(200);
  const orders = await ordersResponse.json();
  expect(Array.isArray(orders)).toBe(true);
});
