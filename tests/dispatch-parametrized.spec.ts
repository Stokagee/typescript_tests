import { test, expect } from "../fixtures/api-fixtures";
import { makeFakeCourier, makeFakeOrder } from "../utils/factories";
import { OrderSchema } from "../schemas/order";
import type { CourierCreate } from "../schemas/courier";
import type { OrderCreate } from "../schemas/order";

type DispatchScenario = {
  name: string;
  orderOverrides: Partial<OrderCreate>;
  courierOverrides: Partial<CourierCreate>;
};

const successScenarios: DispatchScenario[] = [
  {
    name: "běžná objednávka + běžný kurýr (bike)",
    orderOverrides: { required_tags: [] },
    courierOverrides: { tags: ["bike"] },
  },
  {
    name: "VIP objednávka + VIP kurýr",
    orderOverrides: { is_vip: true, required_tags: ["vip"] },
    courierOverrides: { tags: ["vip", "bike"] },
  },
  {
    name: "fragile objednávka + kurýr s fragile_ok",
    orderOverrides: { required_tags: ["fragile_ok"] },
    courierOverrides: { tags: ["fragile_ok", "car"] },
  },
];

test.describe("Dispatch — úspěšné scénáře", () => {
  successScenarios.forEach(({ name, orderOverrides, courierOverrides }) => {
    test(`dispatch: ${name}`, async ({ orders, couriers, dispatch, adminOrders }) => {
      let courierId: number | null = null;
      let orderId: number | null = null;

      try {
        courierId = await test.step("vytvoř kurýra", async () => {
          const courier = await couriers.create(makeFakeCourier(courierOverrides));
          return courier.id;
        });

        await test.step("nastav GPS kurýrovi", async () => {
          await couriers.setLocation(courierId!, 50.08, 14.42);
        });

        await test.step("nastav status kurýra na available", async () => {
          await couriers.setStatus(courierId!, "available");
        });

        orderId = await test.step("vytvoř objednávku", async () => {
          const order = await orders.create(
            makeFakeOrder({
              ...orderOverrides,
              pickup_lat: 50.08,
              pickup_lng: 14.42,
            })
          );
          return order.id;
        });

        await test.step("dispatch objednávky", async () => {
          const result = await dispatch.auto(orderId!);
          expect(result.success).toBe(true);
        });
      } finally {
        if (orderId !== null) {
          await orders.cancel(orderId).catch(() => {});
        }
        if (courierId !== null) {
          await couriers.setStatus(courierId, "offline").catch(() => {});
          await couriers.tryDelete(courierId);
        }
        if (orderId !== null) {
          await adminOrders.tryDelete(orderId);
        }
      }
    });
  });
});

test.describe("Dispatch — failing scénáře", () => {
  test("objednávka vyžaduje fragile_ok, ale žádný kurýr ho nemá", async ({
    request,
    authToken,
  }) => {
    let orderId: number | null = null;

    try {
      const orderBody = makeFakeOrder({
        required_tags: ["fragile_ok"],
        pickup_lat: 50.08,
        pickup_lng: 14.42,
      });
      const orderRes = await request.post("/api/v1/orders/", {
        headers: { Authorization: `Bearer ${authToken}` },
        data: orderBody,
        failOnStatusCode: false,
      });
      expect(orderRes.status()).toBe(201);
      const order = OrderSchema.parse(await orderRes.json());
      orderId = order.id;

      const dispatchRes = await request.post(`/api/v1/dispatch/auto/${orderId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false,
      });
      const dispatchBody = await dispatchRes.json();
      // API vrátí success: false nebo error status — obojí je správná odpověď
      const isFailure =
        dispatchBody.success === false ||
        dispatchRes.status() === 404 ||
        dispatchRes.status() === 422;
      expect(isFailure).toBe(true);
    } finally {
      if (orderId) {
        await request.post(`/api/v1/orders/${orderId}/cancel`, {
          headers: { Authorization: `Bearer ${authToken}` },
          failOnStatusCode: false,
        });
        await request.delete(`/api/v1/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
          failOnStatusCode: false,
        });
      }
    }
  });
});
