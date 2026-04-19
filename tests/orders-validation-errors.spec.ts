import { test, expect } from "../fixtures/api-fixtures";
import { makeFakeOrder } from "../utils/factories";
import type { OrderCreate } from "../schemas/order";

type ValidationCase = {
  name: string;
  // invalid override - úmyslně špatná data (musíme obejít Zod parse ve factory)
  invalidPatch: Record<string, unknown>;
  expectedStatus: number;
};

const validationCases: ValidationCase[] = [
  {
    name: "chybí customer_name",
    invalidPatch: { customer_name: undefined },
    expectedStatus: 422,
  },
  {
    name: "pickup_lat mimo rozsah (200)",
    invalidPatch: { pickup_lat: 200 },
    expectedStatus: 422,
  },
  {
    name: "pickup_lng mimo rozsah (-500)",
    invalidPatch: { pickup_lng: -500 },
    expectedStatus: 422,
  },
  {
    name: "customer_phone příliš krátký",
    invalidPatch: { customer_phone: "+1" },
    expectedStatus: 422,
  },
  {
    name: "customer_name prázdný string",
    invalidPatch: { customer_name: "" },
    expectedStatus: 422,
  },
];

test.describe("Validace vstupu - API musí odmítnout", () => {
  validationCases.forEach(({ name, invalidPatch, expectedStatus }) => {
    test(`odmítne: ${name}`, async ({ request, authToken }) => {
      // Vygeneruj validní body, pak přepíšeme invalid patch
      // POZOR: obcházíme Zod parsing pomocí as unknown
      const validBody = makeFakeOrder();
      const invalidBody = { ...validBody, ...invalidPatch } as unknown;

      const response = await request.post("/api/v1/orders/", {
        headers: { Authorization: `Bearer ${authToken}` },
        data: invalidBody,
        failOnStatusCode: false,
      });

      expect(response.status()).toBe(expectedStatus);
    });
  });
});