import { test, expect } from "../fixtures/api-fixtures";
import { makeFakeOrder } from "../utils/factories";
import { debugLogIfUnexpected } from "../utils/debug-log";
import { safeCleanup } from "../utils/cleanup";

test.describe("Admin operations — user vs admin", () => {
  test("DELETE objednávky: user dostane 403, admin úspěšně smaže", async ({
    orders,
    adminOrders,
  }) => {
    let orderId: number | null = null;

    try {
      orderId = await test.step("user vytvoří objednávku", async () => {
        const order = await orders.create(makeFakeOrder());
        return order.id;
      });

      await test.step("user dostane 403 při pokusu o delete", async () => {
        const res = await orders.deleteRaw(orderId!);
        await debugLogIfUnexpected(res, 403, "USER DELETE DEBUG");
        expect(res.status()).toBe(403);
      });

      await test.step("admin úspěšně smaže", async () => {
        const res = await adminOrders.deleteRaw(orderId!);
        await debugLogIfUnexpected(res, [200, 204], "ADMIN DELETE DEBUG");
        expect([200, 204]).toContain(res.status());
      });

      await test.step("verifikace - objednávka už neexistuje", async () => {
        const res = await adminOrders.getByIdRaw(orderId!);
        await debugLogIfUnexpected(res, 404, "VERIFY 404 DEBUG");
        expect(res.status()).toBe(404);
      });

      orderId = null; // úspěšně smazáno → necleanup
    } finally {
      await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
    }
  });

  test("admin může změnit status objednávky přes PATCH /status", async ({
    orders,
    adminOrders,
  }) => {
    let orderId: number | null = null;

    try {
      const order = await orders.create(makeFakeOrder());
      orderId = order.id;

      const updated = await adminOrders.setStatus(orderId, "CANCELLED");
      expect(updated.status).toBe("CANCELLED");
    } finally {
      await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
    }
  });
});
