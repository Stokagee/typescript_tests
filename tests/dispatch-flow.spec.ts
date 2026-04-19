import { test, expect } from "@playwright/test";

test("dispatch flow: create courier, set GPS, set available, verify in available list, cleanup", async ({
  request,
}) => {
  let courierId: number | undefined;

  try {
    // 1) CREATE kurýra
    const createResponse = await request.post("/api/v1/couriers/", {
      data: {
        email: "dudu@jo.jo",
        name: "Available Test",
        phone: "+420777123456",
        tags: ["bike"],
      },
    });

    expect(createResponse.status()).toBe(201);

    const created = await createResponse.json();
    expect(created).toHaveProperty("id");
    courierId = created.id as number;

    // 2) Ověř, že NENÍ v available
    const availableBeforeResponse = await request.get("/api/v1/couriers/available");
    expect(availableBeforeResponse.status()).toBe(200);

    const availableBefore = (await availableBeforeResponse.json()) as Array<{
      id: number;
    }>;

    const isPresentBefore = availableBefore.some((c) => c.id === courierId);
    expect(isPresentBefore).toBe(false);

    // 3) PATCH location
    const locationResponse = await request.patch(`/api/v1/couriers/${courierId}/location`, {
      data: {
        lat: 50.08,
        lng: 14.42,
      },
    });
    expect(locationResponse.status()).toBe(200);

    // 4) PATCH status
    const statusResponse = await request.patch(`/api/v1/couriers/${courierId}/status`, {
      data: {
        status: "available",
      },
    });
    expect(statusResponse.status()).toBe(200);

    // 5) Ověř, že JE v available
    const availableAfterResponse = await request.get("/api/v1/couriers/available");
    expect(availableAfterResponse.status()).toBe(200);

    const availableAfter = (await availableAfterResponse.json()) as Array<{
      id: number;
    }>;

    const isPresentAfter = availableAfter.some((c) => c.id === courierId);
    expect(isPresentAfter).toBe(true);
  } finally {
    // 6) Cleanup
    if (courierId !== undefined) {
      // Bonus: před mazáním vrať status zpět na offline
      const offlineResponse = await request.patch(`/api/v1/couriers/${courierId}/status`, {
        data: {
          status: "offline",
        },
        failOnStatusCode: false,
      });

      expect([200, 404]).toContain(offlineResponse.status());

      const deleteResponse = await request.delete(`/api/v1/couriers/${courierId}`, {
        failOnStatusCode: false,
      });

      expect([200, 204]).toContain(deleteResponse.status());
    }
  }
});
