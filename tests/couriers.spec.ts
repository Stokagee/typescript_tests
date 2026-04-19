import { test, expect } from "@playwright/test";

test("GET /couriers vrací pole", async ({ request }) => {
  const response = await request.get("/api/v1/couriers/");

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
});

test("GET /couriers podporuje paging přes limit", async ({ request }) => {
  const response = await request.get("/api/v1/couriers/", {
    params: { limit: 2 },
  });

  expect(response.status()).toBe(200);

  const body = (await response.json()) as unknown[];
  expect(body.length).toBeLessThanOrEqual(2);
});
