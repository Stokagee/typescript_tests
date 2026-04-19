import { test, expect } from "../fixtures/api-fixtures";
import { expectMatchesSchema } from "../utils/schema-matcher";
import { OrderSchema, OrderCreateSchema } from "../schemas/order";
import type { OrderCreate } from "../schemas/order";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

type FixtureOrder = {
  name: string;
  data: OrderCreate;
};

test.describe("Objednávky z JSON fixture dat", () => {
  const realisticOrders = JSON.parse(readFileSync(resolve(__dirname, "../test-data/realistic-order.json"), "utf-8")) as FixtureOrder[];
  realisticOrders.forEach(({ name, data }) => {
    test(`vytvoří: ${name}`, async ({ request, authToken }) => {
      // Validuj fixture data proti schématu - pojistka proti rotten test data
      const validBody = OrderCreateSchema.parse(data);

      const response = await request.post("/api/v1/orders/", {
        headers: { Authorization: `Bearer ${authToken}` },
        data: validBody,
      });

      expect(response.status()).toBe(201);

      const order = await expectMatchesSchema(response, OrderSchema);
      expect(order.customer_name).toBe(data.customer_name);
      expect(order.is_vip).toBe(data.is_vip);

      // Cleanup
      await request.delete(`/api/v1/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false,
      });
    });
  });
});