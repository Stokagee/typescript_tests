import { test, expect } from "@playwright/test";
import { CourierSchema, CourierListSchema } from "../schemas/courier";

test("GET /couriers/ vrací validní pole kurýrů podle schématu", async ({
  request,
}) => {
  const response = await request.get("/api/v1/couriers/");
  expect(response.status()).toBe(200);

  const body = await response.json();
  
  // Tady se děje to kouzlo — pokud cokoli neodpovídá schématu, parse vyhodí ZodError
  const couriers = CourierListSchema.parse(body);
  
  // couriers má teď typ Courier[] - autocomplete v IDE funguje
  console.log(`Validovali jsme ${couriers.length} kurýrů`);
});

test("vytvořený kurýr odpovídá CourierSchema", async ({ request }) => {
  const response = await request.post("/api/v1/couriers/", {
    data: {
      name: "Schema Test",
      phone: "+420777000000",
      email: `schema-${Date.now()}@example.com`,
      tags: ["bike"],
    },
  });
  expect(response.status()).toBe(201);

  // Validace celé response struktury jedním řádkem
  const courier = CourierSchema.parse(await response.json());
  
  // Teď můžeš dělat business asserce s plnou type safety
  expect(courier.status).toBe("offline");
  expect(courier.lat).toBeNull();
  expect(courier.lng).toBeNull();

  // Cleanup
  await request.delete(`/api/v1/couriers/${courier.id}`, {
    failOnStatusCode: false,
  });
});