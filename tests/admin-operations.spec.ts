import { test, expect } from "../fixtures/api-fixtures";
import { makeFakeOrder } from "../utils/factories";
import { OrderSchema } from "../schemas/order";

test.describe("Admin operations — user vs admin", () => {
  test("DELETE objednávky: user dostane 403, admin úspěšně smaže", async ({
    request,
    adminRequest,
  }) => {
    let orderId: number | null = null;

    try {
      // 1. User vytvoří objednávku (auth přes extraHTTPHeaders)
      const body = makeFakeOrder();
      const createRes = await request.post("/api/v1/orders/", {
        data: body,
        failOnStatusCode: false,
      });
      expect(createRes.status()).toBe(201);
      const order = OrderSchema.parse(await createRes.json());
      orderId = order.id;

      // 2. User se pokusí smazat → admin-only endpoint vrátí 403
      const userDeleteRes = await request.delete(`/api/v1/orders/${orderId}`, {
        failOnStatusCode: false,
      });
      if (userDeleteRes.status() !== 403) {
        const errBody = await userDeleteRes.text();
        console.log(
          `[USER DELETE DEBUG] status=${userDeleteRes.status()} body=${errBody}`
        );
      }
      expect(userDeleteRes.status()).toBe(403);

      // 3. Admin úspěšně smaže
      const adminDeleteRes = await adminRequest.delete(
        `/api/v1/orders/${orderId}`,
        { failOnStatusCode: false }
      );
      if (![200, 204].includes(adminDeleteRes.status())) {
        const errBody = await adminDeleteRes.text();
        console.log(
          `[ADMIN DELETE DEBUG] status=${adminDeleteRes.status()} body=${errBody}`
        );
      }
      expect([200, 204]).toContain(adminDeleteRes.status());
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
      if (patchRes.status() !== 200) {
        const errBody = await patchRes.text();
        console.log(
          `[ADMIN PATCH DEBUG] status=${patchRes.status()} body=${errBody}`
        );
      }
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
