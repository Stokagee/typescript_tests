import { test, expect } from "../fixtures/api-fixtures";

test("dispatch flow refactored: použití testCourier fixture", async ({ request, testCourier }) => {
  // Žádné CREATE — fixture to udělala
  // Žádné try/finally — fixture uklidí

  // 1) Ověř, že NENÍ v available (po vytvoření je offline bez GPS)
  const beforeRes = await request.get("/api/v1/couriers/available");
  expect(beforeRes.status()).toBe(200);
  const before = (await beforeRes.json()) as Array<{ id: number }>;
  expect(before.some((c) => c.id === testCourier.id)).toBe(false);

  // 2) Nastav GPS
  const locRes = await request.patch(`/api/v1/couriers/${testCourier.id}/location`, {
    data: { lat: 50.08, lng: 14.42 },
  });
  expect(locRes.status()).toBe(200);

  // 3) Změň status
  const statusRes = await request.patch(`/api/v1/couriers/${testCourier.id}/status`, {
    data: { status: "available" },
  });
  expect(statusRes.status()).toBe(200);

  // 4) Ověř že JE v available
  const afterRes = await request.get("/api/v1/couriers/available");
  const after = (await afterRes.json()) as Array<{ id: number }>;
  expect(after.some((c) => c.id === testCourier.id)).toBe(true);

  // ŽÁDNÝ CLEANUP — fixture to udělá automaticky
});
