import { test, expect } from "../fixtures/api-fixtures";
import { expectMatchesSchema } from "../utils/schema-matcher";
import { OrderListSchema, OrderSchema } from "../schemas/order";
import { makeFakeOrder } from "../utils/factories";

test.describe("Order schema contract tests", () => {
  test("GET pending orders vrací validní pole", async ({ request }) => {
    const response = await request.get("/api/v1/orders/pending");
    expect(response.status()).toBe(200);
    const orders = await expectMatchesSchema(response, OrderListSchema);
    expect(Array.isArray(orders)).toBe(true);
  });

  test("Vytvoření objednávky vrací validní Order", async ({ request }) => {
    const orderBody = makeFakeOrder();

    const createResponse = await request.post("/api/v1/orders/", {
      data: orderBody,
    });
    expect(createResponse.status()).toBe(201);

    const createdOrder = await expectMatchesSchema(createResponse, OrderSchema);
    expect(createdOrder.status).toBe("CREATED");

    await request.delete(`/api/v1/orders/${createdOrder.id}`, {
      failOnStatusCode: false,
    });
  });

  test("Schema detekuje contract break", () => {
    const fakeBadResponse = {
      id: 1,
      customer_name: "X",
      customer_phone: "+420123456789",
      pickup_address: "A",
      pickup_lat: 50.08,
      pickup_lng: 14.42,
      delivery_address: "B",
      delivery_lat: 50.1,
      delivery_lng: 14.5,
      is_vip: false,
      required_tags: [],
      status: "WEIRD_STATUS",
      created_at: "2026-04-18T10:00:00Z",
    };

    const result = OrderSchema.safeParse(fakeBadResponse);
    expect(result.success).toBe(false);
  });
});
