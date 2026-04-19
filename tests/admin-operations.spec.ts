import { test, expect } from "../fixtures/api-fixtures";
import { makeFakeOrder } from "../utils/factories";
import { OrderSchema } from "../schemas/order";
import { debugLogIfUnexpected } from "../utils/debug-log";

test.describe("Admin operations — user vs admin", () => {
  test("DELETE objednávky: user dostane 403, admin úspěšně smaže", async ({
    request,
    adminRequest,
  }) => {
    let orderId: number | null = null;

    try {
      orderId = await test.step("user vytvoří objednávku", async () => {
        const body = makeFakeOrder();
        const createRes = await request.post("/api/v1/orders/", {
          data: body,
          failOnStatusCode: false,
        });
        await debugLogIfUnexpected(createRes, 201, "USER CREATE DEBUG");
        expect(createRes.status()).toBe(201);
        const order = OrderSchema.parse(await createRes.json());
        return order.id;
      });

      await test.step("user dostane 403 při pokusu o delete", async () => {
        const userDeleteRes = await request.delete(
          `/api/v1/orders/${orderId}`,
          { failOnStatusCode: false }
        );
        await debugLogIfUnexpected(userDeleteRes, 403, "USER DELETE DEBUG");
        expect(userDeleteRes.status()).toBe(403);
      });

      await test.step("admin úspěšně smaže", async () => {
        const adminDeleteRes = await adminRequest.delete(
          `/api/v1/orders/${orderId}`,
          { failOnStatusCode: false }
        );
        await debugLogIfUnexpected(
          adminDeleteRes,
          [200, 204],
          "ADMIN DELETE DEBUG"
        );
        expect([200, 204]).toContain(adminDeleteRes.status());
      });

      await test.step("verifikace - objednávka už neexistuje", async () => {
        const verifyRes = await adminRequest.get(`/api/v1/orders/${orderId}`, {
          failOnStatusCode: false,
        });
        await debugLogIfUnexpected(verifyRes, 404, "VERIFY 404 DEBUG");
        expect(verifyRes.status()).toBe(404);
      });

      orderId = null; // úspěšně smazáno → necleanup
    } finally {
      if (orderId !== null) {
        await adminRequest.delete(`/api/v1/orders/${orderId}`, {
          failOnStatusCode: false,
        });
      }
    }
  });

  test("admin může změnit status objednávky přes PATCH /status", async ({
    request,
    adminRequest,
  }) => {
    let orderId: number | null = null;

    try {
      const body = makeFakeOrder();
      const createRes = await request.post("/api/v1/orders/", {
        data: body,
        failOnStatusCode: false,
      });
      expect(createRes.status()).toBe(201);
      const order = OrderSchema.parse(await createRes.json());
      orderId = order.id;

      // Admin mění status — přechod CREATED → CANCELLED
      const patchRes = await adminRequest.patch(
        `/api/v1/orders/${orderId}/status`,
        {
          data: { status: "CANCELLED" },
          failOnStatusCode: false,
        }
      );
      await debugLogIfUnexpected(patchRes, 200, "ADMIN PATCH DEBUG");
      expect(patchRes.status()).toBe(200);

      const updated = OrderSchema.parse(await patchRes.json());
      expect(updated.status).toBe("CANCELLED");
    } finally {
      if (orderId !== null) {
        await adminRequest.delete(`/api/v1/orders/${orderId}`, {
          failOnStatusCode: false,
        });
      }
    }
  });
});
