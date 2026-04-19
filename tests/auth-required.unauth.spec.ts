import { test, expect } from "@playwright/test";
import { makeFakeOrder } from "../utils/factories";

// Tyto testy běží v projektu "api-unauth" bez tokenu v extraHTTPHeaders.
// Ověřují, že chráněné endpointy bez autentizace vrací 401.

test.describe("Auth-required endpointy bez tokenu vrací 401", () => {
  test("GET /api/v1/orders/pending vrací 401 bez tokenu", async ({ request }) => {
    const response = await request.get("/api/v1/orders/pending", {
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/v1/orders/ vrací 401 bez tokenu", async ({ request }) => {
    const body = makeFakeOrder();
    const response = await request.post("/api/v1/orders/", {
      data: body,
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(401);
  });

  test("GET /api/v1/orders/by-status/CREATED vrací 401 bez tokenu", async ({ request }) => {
    const response = await request.get("/api/v1/orders/by-status/CREATED", {
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(401);
  });
});
