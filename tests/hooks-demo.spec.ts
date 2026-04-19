import { test, expect } from "@playwright/test";

test.describe("Demo hooks", () => {
  test.beforeAll(async () => {
    console.log("📦 beforeAll - 1× před všemi testy v tomto suite");
  });

  test.beforeEach(async ({}, testInfo) => {
    console.log(`▶️  Spouštím: ${testInfo.title}`);
  });

  test.afterEach(async ({}, testInfo) => {
    console.log(`⏹️  Skončilo: ${testInfo.title} - ${testInfo.status}`);
  });

  test.afterAll(async () => {
    console.log("📦 afterAll - 1× po všech testech");
  });

  test("první test", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
  });

  test("druhý test", async ({ request }) => {
    const res = await request.get("/openapi.json");
    expect(res.status()).toBe(200);
  });
});
