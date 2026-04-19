import { test, expect } from "../fixtures/api-fixtures";
import { expectMatchesSchema } from "../utils/schema-matcher";
import { makeFakeOrder } from "../utils/factories";
import { OrderSchema } from "../schemas/order";
import type { OrderCreate } from "../schemas/order";

type Scenario = {
  name: string;
  overrides: Partial<OrderCreate>;
};

const scenarios: Scenario[] = [
  {
    name: "běžná objednávka bez tagů",
    overrides: {},
  },
  {
    name: "VIP objednávka",
    overrides: { is_vip: true },
  },
  {
    name: "objednávka vyžadující bike kurýra",
    overrides: { required_tags: ["bike"] },
  },
  {
    name: "VIP objednávka s fragile_ok tagem",
    overrides: { is_vip: true, required_tags: ["fragile_ok"] },
  },
];

test.describe("Parametrizované vytváření objednávek", () => {
  scenarios.forEach(({ name, overrides }) => {
    test(`lze vytvořit: ${name}`, async ({ request, authToken }) => {
      const body = makeFakeOrder(overrides);

      const response = await request.post("/api/v1/orders/", {
        headers: { Authorization: `Bearer ${authToken}` },
        data: body,
      });

      expect(response.status()).toBe(201);

      const order = await expectMatchesSchema(response, OrderSchema);
      expect(order.status).toBe("CREATED");
      expect(order.is_vip).toBe(body.is_vip);
      expect(order.required_tags).toEqual(body.required_tags);

      // Cleanup
      await request.delete(`/api/v1/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false,
      });
    });
  });
});