import { test, expect } from "../fixtures/api-fixtures";
import { makeFakeCourier, makeFakeOrder } from "../utils/factories";
import { CourierSchema } from "../schemas/courier";
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
    test(`dispatch: ${name}`, async ({ request, authToken }) => {
      let courierId: number | null = null;
      let orderId: number | null = null;

      try {
        // 1. Vytvoř kurýra
        const courierBody = makeFakeCourier(courierOverrides);
        const courierRes = await request.post("/api/v1/couriers/", {
          data: courierBody,
          failOnStatusCode: false,
        });
        expect(courierRes.status()).toBe(201);
        const courier = CourierSchema.parse(await courierRes.json());
        courierId = courier.id;

        // 2. Nastav GPS kurýrovi
        await request.patch(`/api/v1/couriers/${courierId}/location`, {
          data: { lat: 50.08, lng: 14.42 },
          failOnStatusCode: false,
        });

        // 3. Nastav status kurýra na available
        await request.patch(`/api/v1/couriers/${courierId}/status`, {
          data: { status: "available" },
          failOnStatusCode: false,
        });

        // 4. Vytvoř objednávku s pickup blízko kurýra
        const orderBody = makeFakeOrder({
          ...orderOverrides,
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

        // 5. Dispatch
        const dispatchRes = await request.post(
          `/api/v1/dispatch/auto/${orderId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
          }
        );
        if (dispatchRes.status() !== 200) {
          const errBody = await dispatchRes.text();
          console.log(`[DISPATCH DEBUG] status=${dispatchRes.status()} body=${errBody}`);
        }
        expect(dispatchRes.status()).toBe(200);
        const dispatchBody = await dispatchRes.json();
        expect(dispatchBody.success).toBe(true);
      } finally {
        if (orderId) {
          await request.post(`/api/v1/orders/${orderId}/cancel`, {
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
          });
        }
        if (courierId) {
          await request.patch(`/api/v1/couriers/${courierId}/status`, {
            data: { status: "offline" },
            failOnStatusCode: false,
          });
          await request.delete(`/api/v1/couriers/${courierId}`, {
            failOnStatusCode: false,
          });
        }
        if (orderId) {
          await request.delete(`/api/v1/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
            failOnStatusCode: false,
          });
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

      const dispatchRes = await request.post(
        `/api/v1/dispatch/auto/${orderId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
          failOnStatusCode: false,
        }
      );
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
