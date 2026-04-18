import { test, expect } from "@playwright/test";

test("plný CRUD cyklus na kurýrovi", async ({ request }) => {
  // ---------- 1) CREATE ----------
  const createResponse = await request.post("/api/v1/couriers/", {
    data: {
      name: "Test Kurýr",
      email: "dudu@je.de",
      phone: "+420777111222",
      tags: ["bike", "fast"],
    },
  });
  expect(createResponse.status()).toBe(201);
  const created = await createResponse.json();
  expect(created).toHaveProperty("id");
  expect(created.name).toBe("Test Kurýr");
  expect(created.status).toBe("offline");

  const courierId: number = created.id;

  // ---------- 2) READ - detail ----------
  const getResponse = await request.get(`/api/v1/couriers/${courierId}`);
  expect(getResponse.status()).toBe(200);
  const fetched = await getResponse.json();
  expect(fetched.id).toBe(courierId);
  expect(fetched.name).toBe("Test Kurýr");

  // ---------- 3) PATCH location ----------
  const locResponse = await request.patch(
    `/api/v1/couriers/${courierId}/location`,
    {
      data: { lat: 50.0875, lng: 14.4213 },
    }
  );
  expect(locResponse.status()).toBe(200);
  const located = await locResponse.json();
  expect(located.lat).toBeCloseTo(50.0875, 4);
  expect(located.lng).toBeCloseTo(14.4213, 4);

  // ---------- 4) PATCH status ----------
  const statusResponse = await request.patch(
    `/api/v1/couriers/${courierId}/status`,
    {
      data: { status: "available" },
    }
  );
  expect(statusResponse.status()).toBe(200);
  const statusUpdated = await statusResponse.json();
  expect(statusUpdated.status).toBe("available");

  // ---------- 5) PUT - update jména ----------
  const putResponse = await request.put(`/api/v1/couriers/${courierId}`, {
    data: {
      name: "Test Kurýr Updated",
      phone: "+420777111222",
      tags: ["bike", "fast", "vip"],
    },
  });
  expect(putResponse.status()).toBe(200);
  const updated = await putResponse.json();
  expect(updated.name).toBe("Test Kurýr Updated");
  expect(updated.tags).toContain("vip");

  // ---------- 6) DELETE ----------
  const deleteResponse = await request.delete(
    `/api/v1/couriers/${courierId}`
  );
  expect([200, 204]).toContain(deleteResponse.status());

  // ---------- 7) Ověř, že je opravdu pryč ----------
  const verifyResponse = await request.get(`/api/v1/couriers/${courierId}`, {
    failOnStatusCode: false,
  });
  expect(verifyResponse.status()).toBe(404);
});