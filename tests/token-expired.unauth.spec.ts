import { test, expect } from "@playwright/test";
import { createRequestContext } from "../helpers/request-factory";
import { debugLogIfUnexpected } from "../utils/debug-log";

test.describe("Invalid token — třetí auth state", () => {
  test("GET /api/v1/orders/pending s nevalidním tokenem vrací 401", async () => {
    const context = await createRequestContext({ token: "totaljunk" });

    try {
      const response = await context.get("/api/v1/orders/pending", {
        failOnStatusCode: false,
      });

      await debugLogIfUnexpected(response, 401, "INVALID TOKEN DEBUG");
      expect(response.status()).toBe(401);
    } finally {
      await context.dispose();
    }
  });
});
