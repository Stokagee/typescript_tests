import { test, expect } from "../fixtures/api-fixtures";
import { makeFakeOrder } from "../utils/factories";
import { safeCleanup } from "../utils/cleanup";
import { debugLogIfUnexpected } from "../utils/debug-log";
import { PRAGUE_CENTER } from "../utils/test-locations";
import { prepareAvailableCourier } from "./setup-helpers";
import type { CourierCreate } from "../schemas/courier";
import type { OrderCreate } from "../schemas/order";

// ID mimo realistický range — backend vrací 200 + success:false + "Courier not found".
const NONEXISTENT_COURIER_ID = 999_999;

// ---------- Happy-path scénáře (parametrizované) ----------
type HappyScenario = {
  name: string;
  orderOverrides: Partial<OrderCreate>;
  courierTags: CourierCreate["tags"];
};

const happyScenarios: HappyScenario[] = [
  {
    name: "běžná objednávka + bike kurýr",
    orderOverrides: { required_tags: [] },
    courierTags: ["bike"],
  },
  {
    name: "fragile objednávka + kurýr s fragile_ok",
    orderOverrides: { required_tags: ["fragile_ok"] },
    courierTags: ["fragile_ok", "car"],
  },
  {
    name: "VIP objednávka + VIP kurýr",
    orderOverrides: { is_vip: true, required_tags: ["vip"] },
    courierTags: ["vip", "bike"],
  },
];

// Konvence test.step v této suite:
//   - Given: setup dat (kurýr, order). Jeden step = jedna vytvořená entita.
//   - When:  volání testovaného endpointu (dispatch.manual / manualRaw).
//   - Then:  verifikace response + side-effectů (DB status, /available, logs).
// Pokud setup prochází přes fixture, Given step odpadá (fixture už bežel).

test.describe("Manual dispatch — happy path", () => {
  happyScenarios.forEach(({ name, orderOverrides, courierTags }) => {
    test(`${name}`, async ({ orders, couriers, dispatch, adminOrders }) => {
      let courierId: number | null = null;
      let orderId: number | null = null;

      try {
        courierId = await test.step("Given: available kurýr", async () => {
          const courier = await prepareAvailableCourier(couriers, courierTags);
          expect(courier.status).toBe("available");
          return courier.id;
        });

        orderId = await test.step("Given: nová objednávka", async () => {
          const order = await orders.create(
            makeFakeOrder({
              ...orderOverrides,
              pickup_lat: PRAGUE_CENTER.lat,
              pickup_lng: PRAGUE_CENTER.lng,
            })
          );
          expect(order.status).toBe("CREATED");
          return order.id;
        });

        await test.step("When: manuální dispatch → 200 + success:true", async () => {
          const result = await dispatch.manual(orderId!, courierId!);
          expect(result.success, `dispatch result: ${JSON.stringify(result)}`).toBe(true);
        });

        await test.step("Then: order je ASSIGNED a kurýr je busy", async () => {
          const updatedOrder = await orders.getById(orderId!);
          expect(updatedOrder.status).toBe("ASSIGNED");
          const updatedCourier = await couriers.getById(courierId!);
          expect(updatedCourier.status).toBe("busy");
        });
      } finally {
        await safeCleanup(orderId, (id) => orders.cancel(id));
        await safeCleanup(courierId, (id) => couriers.setStatus(id, "offline"));
        await safeCleanup(courierId, (id) => couriers.tryDelete(id));
        await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
      }
    });
  });
});

// ---------- Negative scénáře ----------
// Všechny vrací 200 + success:false + smysluplnou message (business failure, ne HTTP error).
test.describe("Manual dispatch — negative scenarios", () => {
  test("busy kurýr → success:false s message 'busy'", async ({
    orders,
    couriers,
    dispatch,
    adminOrders,
  }) => {
    let courierId: number | null = null;
    let orderId: number | null = null;

    try {
      courierId = await test.step("Given: kurýr ve stavu busy", async () => {
        const courier = await prepareAvailableCourier(couriers, ["bike"]);
        const busy = await couriers.setStatus(courier.id, "busy");
        expect(busy.status).toBe("busy");
        return courier.id;
      });

      orderId = await test.step("Given: nová objednávka", async () => {
        const order = await orders.create(
          makeFakeOrder({ pickup_lat: PRAGUE_CENTER.lat, pickup_lng: PRAGUE_CENTER.lng })
        );
        return order.id;
      });

      await test.step("When+Then: dispatch vrací 200 + success:false + 'busy'", async () => {
        const res = await dispatch.manualRaw(orderId!, courierId!);
        await debugLogIfUnexpected(res, 200, "busy-courier-dispatch");
        expect(res.status()).toBe(200);
        const body = (await res.json()) as { success?: boolean; message?: string };
        expect(body.success).toBe(false);
        expect(body.message ?? "").toMatch(/busy|not available/i);
      });
    } finally {
      await safeCleanup(orderId, (id) => orders.cancel(id));
      await safeCleanup(courierId, (id) => couriers.setStatus(id, "offline"));
      await safeCleanup(courierId, (id) => couriers.tryDelete(id));
      await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
    }
  });

  test("kurýr bez required tags → success:false", async ({
    orders,
    couriers,
    dispatch,
    adminOrders,
  }) => {
    let courierId: number | null = null;
    let orderId: number | null = null;

    try {
      courierId = await test.step("Given: kurýr jen s tagem 'bike'", async () => {
        const courier = await prepareAvailableCourier(couriers, ["bike"]);
        return courier.id;
      });

      orderId = await test.step("Given: order vyžadující 'fragile_ok'", async () => {
        const order = await orders.create(
          makeFakeOrder({
            required_tags: ["fragile_ok"],
            pickup_lat: PRAGUE_CENTER.lat,
            pickup_lng: PRAGUE_CENTER.lng,
          })
        );
        return order.id;
      });

      await test.step("When+Then: dispatch vrací 200 + success:false", async () => {
        const res = await dispatch.manualRaw(orderId!, courierId!);
        await debugLogIfUnexpected(res, 200, "missing-tags");
        expect(res.status()).toBe(200);
        const body = (await res.json()) as { success?: boolean; message?: string };
        expect(body.success).toBe(false);
        // Message content necháme volnější — formulace pro tag mismatch není stabilní API kontrakt.
        expect(body.message).toBeTruthy();
      });
    } finally {
      await safeCleanup(orderId, (id) => orders.cancel(id));
      await safeCleanup(courierId, (id) => couriers.setStatus(id, "offline"));
      await safeCleanup(courierId, (id) => couriers.tryDelete(id));
      await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
    }
  });

  test("ASSIGNED order → druhý dispatch vrací success:false s 'ASSIGNED'", async ({
    orders,
    dispatch,
    adminOrders,
    pairOfAvailableCouriers,
  }) => {
    // Composition fixture: pair je připravený před testem (paralelně),
    // cleanup obou kurýrů je vlastní fixture — test se stará jen o order.
    const [c1, c2] = pairOfAvailableCouriers;
    let orderId: number | null = null;

    try {
      orderId = await test.step("Given: nová objednávka", async () => {
        const order = await orders.create(
          makeFakeOrder({ pickup_lat: PRAGUE_CENTER.lat, pickup_lng: PRAGUE_CENTER.lng })
        );
        return order.id;
      });

      await test.step("When: první dispatch projde (order → ASSIGNED)", async () => {
        const first = await dispatch.manual(orderId!, c1.id);
        expect(first.success).toBe(true);
      });

      await test.step("When+Then: druhý dispatch na ASSIGNED vrací success:false", async () => {
        const res = await dispatch.manualRaw(orderId!, c2.id);
        await debugLogIfUnexpected(res, 200, "already-assigned");
        expect(res.status()).toBe(200);
        const body = (await res.json()) as { success?: boolean; message?: string };
        expect(body.success).toBe(false);
        expect(body.message ?? "").toMatch(/ASSIGNED|cannot be dispatched/i);
      });
    } finally {
      await safeCleanup(orderId, (id) => orders.cancel(id));
      await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
    }
  });

  test("neexistující courier_id → success:false s 'not found'", async ({
    orders,
    dispatch,
    adminOrders,
  }) => {
    let orderId: number | null = null;

    try {
      orderId = await test.step("Given: nová objednávka", async () => {
        const order = await orders.create(
          makeFakeOrder({ pickup_lat: PRAGUE_CENTER.lat, pickup_lng: PRAGUE_CENTER.lng })
        );
        return order.id;
      });

      await test.step("When+Then: dispatch vrací 200 + success:false + 'not found'", async () => {
        const res = await dispatch.manualRaw(orderId!, NONEXISTENT_COURIER_ID);
        await debugLogIfUnexpected(res, 200, "nonexistent-courier");
        expect(res.status()).toBe(200);
        const body = (await res.json()) as { success?: boolean; message?: string };
        expect(body.success).toBe(false);
        expect(body.message ?? "").toMatch(/not found/i);
      });
    } finally {
      await safeCleanup(orderId, (id) => orders.cancel(id));
      await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
    }
  });
});

// ---------- Side-effect verification ----------
test.describe("Manual dispatch — side effects", () => {
  test("úspěšný dispatch zapíše záznam do dispatch logu", async ({
    orders,
    couriers,
    dispatch,
    adminOrders,
  }) => {
    let courierId: number | null = null;
    let orderId: number | null = null;

    try {
      courierId = await test.step("Given: available kurýr", async () => {
        const courier = await prepareAvailableCourier(couriers, ["bike"]);
        return courier.id;
      });

      orderId = await test.step("Given: nová objednávka", async () => {
        const order = await orders.create(
          makeFakeOrder({ pickup_lat: PRAGUE_CENTER.lat, pickup_lng: PRAGUE_CENTER.lng })
        );
        return order.id;
      });

      await test.step("When: manuální dispatch", async () => {
        const result = await dispatch.manual(orderId!, courierId!);
        expect(result.success).toBe(true);
      });

      await test.step("Then: log obsahuje záznam s order_id + courier_id", async () => {
        const logs = await dispatch.getLogsForOrder(orderId!);
        expect(logs.length).toBeGreaterThan(0);
        // Discovery run (2026-04-19): endpoint /dispatch/logs/order/{id} aktuálně
        // nevystavuje `type` field — vrací jen {id, order_id, courier_id, created_at}.
        // Jakmile backend začne type posílat, přepnout na striktní asserci:
        //   expect(matching.some((l) => l.type === "manual_assigned")).toBe(true)
        const matching = logs.filter((l) => l.order_id === orderId && l.courier_id === courierId);
        expect(
          matching.length,
          `logs pro order ${orderId}: ${JSON.stringify(logs)}`
        ).toBeGreaterThan(0);
      });
    } finally {
      await safeCleanup(orderId, (id) => orders.cancel(id));
      await safeCleanup(courierId, (id) => couriers.setStatus(id, "offline"));
      await safeCleanup(courierId, (id) => couriers.tryDelete(id));
      await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
    }
  });

  test("úspěšný dispatch odstraní kurýra z /couriers/available", async ({
    orders,
    couriers,
    dispatch,
    adminOrders,
  }) => {
    let courierId: number | null = null;
    let orderId: number | null = null;

    try {
      courierId = await test.step("Given: available kurýr je v /available", async () => {
        const courier = await prepareAvailableCourier(couriers, ["bike"]);
        const available = await couriers.listAvailable();
        expect(available.some((c) => c.id === courier.id)).toBe(true);
        return courier.id;
      });

      orderId = await test.step("Given: nová objednávka", async () => {
        const order = await orders.create(
          makeFakeOrder({ pickup_lat: PRAGUE_CENTER.lat, pickup_lng: PRAGUE_CENTER.lng })
        );
        return order.id;
      });

      await test.step("When: manuální dispatch", async () => {
        const result = await dispatch.manual(orderId!, courierId!);
        expect(result.success).toBe(true);
      });

      await test.step("Then: kurýr už není v /available", async () => {
        const available = await couriers.listAvailable();
        expect(available.some((c) => c.id === courierId)).toBe(false);
      });
    } finally {
      await safeCleanup(orderId, (id) => orders.cancel(id));
      await safeCleanup(courierId, (id) => couriers.setStatus(id, "offline"));
      await safeCleanup(courierId, (id) => couriers.tryDelete(id));
      await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
    }
  });
});
