import { test, expect, request as apiRequest } from "@playwright/test";

test.describe("Public non-auth endpoints", () => {
  test("GET / vrací 200 a obsahuje message a docs", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("docs");
  });

  test("GET /openapi.json vrací 200 a obsahuje paths", async ({ request }) => {
    const response = await request.get("/openapi.json");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toBeTruthy();
    expect(typeof body).toBe("object");
    expect(body).toHaveProperty("paths");

    expect(body.paths).toHaveProperty("/api/v1/orders/");
    expect(body.paths).toHaveProperty("/api/v1/dispatch/auto/{order_id}");
  });

  test("GET /api/v1/orders/pending vrací 401 bez autentizace", async () => {
    const context = await apiRequest.newContext({
      baseURL: "http://localhost:20300",
      extraHTTPHeaders: {},
    });
    const response = await context.get("/api/v1/orders/pending", {
      headers: { Authorization: "" },
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(401);
    await context.dispose();
  });

  test("POST /api/v1/auth/test-token funguje s validnim body", async ({ request }) => {
    const response = await request.post("/api/v1/auth/test-token", {
      data: {
        username: "test_user",
        role: "user",
        user_id: 1,
        scopes: "orders:read",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("access_token");
    expect(body).toHaveProperty("token_type");
    expect(body.token_type).toBe("bearer");
  });

  test("GET /api/v1/orders/by-status/CREATED vrací 401 bez autentizace", async () => {
    const context = await apiRequest.newContext({
      baseURL: "http://localhost:20300",
      extraHTTPHeaders: {},
    });
    const response = await context.get("/api/v1/orders/by-status/CREATED", {
      headers: { Authorization: "" },
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(401);
    await context.dispose();
  });
});
