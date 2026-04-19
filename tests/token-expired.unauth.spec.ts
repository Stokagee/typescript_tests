import { test, expect } from "@playwright/test";
import { createRequestContext } from "../helpers/request-factory";

test.describe("Invalid token — třetí auth state", () => {
  test("GET /api/v1/orders/pending s nevalidním tokenem vrací 401", async () => {
    const context = await createRequestContext({ token: "totaljunk" });

    try {
      const response = await context.get("/api/v1/orders/pending", {
        failOnStatusCode: false,
      });

      if (response.status() !== 401) {
        const errBody = await response.text();
        console.log(`[INVALID TOKEN DEBUG] status=${response.status()} body=${errBody}`);
      }

      expect(response.status()).toBe(401);
    } finally {
      await context.dispose();
    }
  });
});
