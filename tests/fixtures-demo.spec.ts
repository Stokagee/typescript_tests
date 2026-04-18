import { test, expect } from "../fixtures/api-fixtures";

test("kurýr je k dispozici v testu, po testu zmizí", async ({
  request,
  testCourier,
}) => {
  // Test dostane už hotového kurýra
  expect(testCourier.id).toBeDefined();
  expect(testCourier.status).toBe("offline");

  // Můžu s ním pracovat
  const detailResponse = await request.get(`/api/v1/couriers/${testCourier.id}`);
  expect(detailResponse.status()).toBe(200);
  const detail = await detailResponse.json();
  expect(detail.email).toContain("@example.com");
});

test("druhý test - dostane vlastního kurýra (nezávislého)", async ({
  testCourier,
}) => {
  // Tohle je jiný kurýr s jiným ID
  expect(testCourier.id).toBeDefined();
});