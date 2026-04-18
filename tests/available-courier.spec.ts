import { test, expect } from "../fixtures/api-fixtures";

test.describe("availableCourier fixture", () => {
  test("availableCourier je v /couriers/available", async ({
    request,
    availableCourier,
  }) => {
    const response = await request.get("/api/v1/couriers/available");
    expect(response.status()).toBe(200);

    const available = (await response.json()) as Array<{ id: number }>;
    const isPresent = available.some((c) => c.id === availableCourier.id);

    expect(isPresent).toBe(true);
  });

  test("po změně statusu na offline už není v /couriers/available", async ({
    request,
    availableCourier,
  }) => {
    const statusResponse = await request.patch(
      `/api/v1/couriers/${availableCourier.id}/status`,
      {
        data: { status: "offline" },
      }
    );

    expect(statusResponse.status()).toBe(200);

    const response = await request.get("/api/v1/couriers/available");
    expect(response.status()).toBe(200);

    const available = (await response.json()) as Array<{ id: number }>;
    const isPresent = available.some((c) => c.id === availableCourier.id);

    expect(isPresent).toBe(false);
  });
});