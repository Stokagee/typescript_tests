# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-schema.spec.ts >> Order schema contract tests >> Vytvoření objednávky vrací validní Order
- Location: tests\orders-schema.spec.ts:27:7

# Error details

```
ZodError: [
  {
    "code": "invalid_value",
    "values": [
      "fragile_ok",
      "fast",
      "bike",
      "car"
    ],
    "path": [
      "required_tags",
      0
    ],
    "message": "Invalid option: expected one of \"fragile_ok\"|\"fast\"|\"bike\"|\"car\""
  }
]
```

# Test source

```ts
  1  | import { faker } from "@faker-js/faker";
  2  | import { test, expect } from "../fixtures/api-fixtures";
  3  | import { expectMatchesSchema } from "../utils/schema-matcher";
  4  | import {
  5  |   OrderCreateSchema,
  6  |   OrderListSchema,
  7  |   OrderSchema,
  8  | } from "../schemas/order";
  9  | 
  10 | test.describe("Order schema contract tests", () => {
  11 |   test("GET pending orders s tokenem vrací validní pole", async ({
  12 |     request,
  13 |     authToken,
  14 |   }) => {
  15 |     const response = await request.get("/api/v1/orders/pending", {
  16 |       headers: {
  17 |         Authorization: `Bearer ${authToken}`,
  18 |       },
  19 |     });
  20 | 
  21 |     expect(response.status()).toBe(200);
  22 | 
  23 |     const orders = await expectMatchesSchema(response, OrderListSchema);
  24 |     expect(Array.isArray(orders)).toBe(true);
  25 |   });
  26 | 
  27 |   test("Vytvoření objednávky vrací validní Order", async ({
  28 |     request,
  29 |     authToken,
  30 |   }) => {
  31 |     const rawOrder = {
  32 |       customer_name: faker.person.fullName(),
  33 |       customer_phone: `+420${faker.string.numeric(9)}`,
  34 |       pickup_address: `Pickup ${Date.now()} ${faker.location.streetAddress()}`,
  35 |       pickup_lat: 50.08,
  36 |       pickup_lng: 14.42,
  37 |       delivery_address: `Delivery ${Date.now()} ${faker.location.streetAddress()}`,
  38 |       delivery_lat: 50.10,
  39 |       delivery_lng: 14.50,
  40 |       is_vip: faker.datatype.boolean(),
  41 |       required_tags: ["fragile"],
  42 |     };
  43 | 
> 44 |     const orderBody = OrderCreateSchema.parse(rawOrder);
     |                                         ^ ZodError: [
  45 | 
  46 |     const createResponse = await request.post("/api/v1/orders/", {
  47 |       headers: {
  48 |         Authorization: `Bearer ${authToken}`,
  49 |       },
  50 |       data: orderBody,
  51 |       failOnStatusCode: false,
  52 |     });
  53 | 
  54 |     expect(createResponse.status()).toBe(201);
  55 | 
  56 |     const createdOrder = await expectMatchesSchema(createResponse, OrderSchema);
  57 |     expect(createdOrder.status).toBe("CREATED");
  58 |     expect(createdOrder.id).toBeDefined();
  59 | 
  60 |     const deleteResponse = await request.delete(
  61 |       `/api/v1/orders/${createdOrder.id}`,
  62 |       {
  63 |         headers: {
  64 |           Authorization: `Bearer ${authToken}`,
  65 |         },
  66 |         failOnStatusCode: false,
  67 |       }
  68 |     );
  69 | 
  70 |     expect([200, 204, 403]).toContain(deleteResponse.status());
  71 |   });
  72 | 
  73 |   test("Schema detekuje contract break", () => {
  74 |     const fakeBadResponse = {
  75 |       id: 1,
  76 |       customer_name: "X",
  77 |       customer_phone: "+420123456789",
  78 |       pickup_address: "A",
  79 |       pickup_lat: 50.08,
  80 |       pickup_lng: 14.42,
  81 |       delivery_address: "B",
  82 |       delivery_lat: 50.1,
  83 |       delivery_lng: 14.5,
  84 |       is_vip: false,
  85 |       required_tags: [],
  86 |       status: "WEIRD_STATUS",
  87 |       created_at: "2026-04-18T10:00:00Z",
  88 |     };
  89 | 
  90 |     const result = OrderSchema.safeParse(fakeBadResponse);
  91 |     expect(result.success).toBe(false);
  92 |   });
  93 | });
```