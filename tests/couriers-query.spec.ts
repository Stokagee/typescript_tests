import { test, expect } from "@playwright/test";

test.describe("Query a path parametry", () => {
  test("paging přes skip a limit", async ({ request }) => {
    const response = await request.get("/api/v1/couriers/", {
      params: {
        skip: 0,
        limit: 5,
      },
    });
    expect(response.status()).toBe(200);
    const body = (await response.json()) as unknown[];
    expect(body.length).toBeLessThanOrEqual(5);
  });

  test("path parametr - neexistující ID vrací 404", async ({ request }) => {
    const response = await request.get("/api/v1/couriers/999999999", {
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(404);
  });

  test("dostupní kurýři - prázdné pole je validní výsledek", async ({
    request, }) =>
  {
    const response = await request.get("/api/v1/couriers/available");
    expect(response.status()).toBe(200);
    const body = (await response.json()) as unknown[];
    // Neočekáváme konkrétní počet, jen že to je pole
    expect(Array.isArray(body)).toBe(true);
  });
});