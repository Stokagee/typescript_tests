import { faker } from "@faker-js/faker";
import { test, expect } from "../fixtures/api-fixtures";
import { expectMatchesSchema } from "../utils/schema-matcher";
import {
  OrderCreateSchema,
  OrderListSchema,
  OrderSchema,
} from "../schemas/order";
import { makeFakeOrder } from "../utils/factories";

test.describe("Order schema contract tests", () => {
  test("GET pending orders s tokenem vrací validní pole", async ({
    request,
    authToken,
  }) => {
    const response = await request.get("/api/v1/orders/pending", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const orders = await expectMatchesSchema(response, OrderListSchema);
    expect(Array.isArray(orders)).toBe(true);
  });

  test("Vytvoření objednávky vrací validní Order", async ({
    request,
    authToken,
  }) => {
    const rawOrder = {
      customer_name: faker.person.fullName(),
      customer_phone: `+420${faker.string.numeric(9)}`,
      pickup_address: `Pickup ${Date.now()} ${faker.location.streetAddress()}`,
      pickup_lat: 50.08,
      pickup_lng: 14.42,
      delivery_address: `Delivery ${Date.now()} ${faker.location.streetAddress()}`,
      delivery_lat: 50.10,
      delivery_lng: 14.50,
      is_vip: faker.datatype.boolean(),
      required_tags: ["fragile"],
    };

    const orderBody = makeFakeOrder();

    const createResponse = await request.post("/api/v1/orders/", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: orderBody,
      failOnStatusCode: false,
    });

    expect(createResponse.status()).toBe(201);

    const createdOrder = await expectMatchesSchema(createResponse, OrderSchema);
    expect(createdOrder.status).toBe("CREATED");
    expect(createdOrder.id).toBeDefined();

    const deleteResponse = await request.delete(
      `/api/v1/orders/${createdOrder.id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        failOnStatusCode: false,
      }
    );

    expect([200, 204, 403]).toContain(deleteResponse.status());
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