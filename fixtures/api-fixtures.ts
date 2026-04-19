import { test as base, request as apiRequest } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { CourierSchema } from "../schemas/courier";
import type { Courier } from "../schemas/courier";

type ApiFixtures = {
  authToken: string;
  testCourier: Courier;
  availableCourier: Courier;
};

function makeFakeCourierData() {
  const uniqueSuffix = `${Date.now()}-${faker.string.numeric(4)}`;

  return {
    name: `${faker.person.fullName()} ${uniqueSuffix}`,
    phone: `+420${faker.string.numeric(9)}`,
    email: `test-${uniqueSuffix}@example.com`,
    tags: [faker.helpers.arrayElement(["bike", "car", "vip", "fast"])],
  };
}

export const test = base.extend<ApiFixtures>({
  authToken: async ({}, use) => {
    const context = await apiRequest.newContext({
      baseURL: "http://localhost:20300",
    });
    const response = await context.post("/api/v1/auth/test-token", {
      data: {
        username: "test_user",
        role: "user",
        user_id: 1,
        scopes: "orders:read orders:write",
      },
    });
    if (!response.ok()) {
      throw new Error(`Token fetch failed: ${response.status()}`);
    }
    const body = await response.json();
    await use(body.access_token);
    await context.dispose();
  },

  testCourier: async ({ request }, use) => {
    const fake = makeFakeCourierData();

    const createResponse = await request.post("/api/v1/couriers/", {
      data: {
        name: fake.name,
        phone: fake.phone,
        email: fake.email,
        tags: fake.tags,
      },
      failOnStatusCode: false,
    });

    if (createResponse.status() !== 201) {
      const errBody = await createResponse.text();
      throw new Error(
        `Failed to create test courier: ${createResponse.status()}\n${errBody}`
      );
    }

    const courier = CourierSchema.parse(await createResponse.json());

    await use(courier);

    await request.delete(`/api/v1/couriers/${courier.id}`, {
      failOnStatusCode: false,
    });
  },

  availableCourier: async ({ request }, use) => {
    const fake = makeFakeCourierData();

    const createResponse = await request.post("/api/v1/couriers/", {
      data: {
        name: fake.name,
        phone: fake.phone,
        email: fake.email,
        tags: fake.tags,
      },
      failOnStatusCode: false,
    });

    if (createResponse.status() !== 201) {
      const errBody = await createResponse.text();
      throw new Error(
        `Failed to create available courier: ${createResponse.status()}\n${errBody}`
      );
    }

    const createdCourier = (await createResponse.json()) as Courier;
    const courierId = createdCourier.id;

    const locationResponse = await request.patch(
      `/api/v1/couriers/${courierId}/location`,
      {
        data: {
          lat: 50.08,
          lng: 14.42,
        },
        failOnStatusCode: false,
      }
    );

    if (locationResponse.status() !== 200) {
      const errBody = await locationResponse.text();
      throw new Error(
        `Failed to set courier location: ${locationResponse.status()}\n${errBody}`
      );
    }

    const statusResponse = await request.patch(
      `/api/v1/couriers/${courierId}/status`,
      {
        data: {
          status: "available",
        },
        failOnStatusCode: false,
      }
    );

    if (statusResponse.status() !== 200) {
      const errBody = await statusResponse.text();
      throw new Error(
        `Failed to set courier status: ${statusResponse.status()}\n${errBody}`
      );
    }

    const courier = (await statusResponse.json()) as Courier;

    await use(courier);

    await request.patch(`/api/v1/couriers/${courier.id}/status`, {
      data: { status: "offline" },
      failOnStatusCode: false,
    });

    await request.delete(`/api/v1/couriers/${courier.id}`, {
      failOnStatusCode: false,
    });
  },
});

export { expect } from "@playwright/test";