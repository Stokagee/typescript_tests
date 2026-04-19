import { test as base, request as apiRequest, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "node:fs";
import { faker } from "@faker-js/faker";
import { CourierSchema } from "../schemas/courier";
import type { Courier } from "../schemas/courier";
import { env } from "../config/env";
import { OrdersClient, CouriersClient, DispatchClient } from "../api/clients";
import { PRAGUE_CENTER } from "../utils/test-locations";

type ApiFixtures = {
  authToken: string;
  testCourier: Courier;
  availableCourier: Courier;
  adminRequest: APIRequestContext;
  // API clients
  orders: OrdersClient;
  couriers: CouriersClient;
  dispatch: DispatchClient;
  adminOrders: OrdersClient;
  // Team fixture — 3 available couriers s různými tag sadami (graduation bonus B2)
  couriersTeam: Courier[];
  // Composition fixture — named tuple 2 available kurýrů s bike tagy.
  // Určeno pro testy typu "přiřadím první, druhý chci paralelně pro další pokus".
  pairOfAvailableCouriers: [Courier, Courier];
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
  // eslint-disable-next-line no-empty-pattern
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

  // eslint-disable-next-line no-empty-pattern
  adminRequest: async ({}, use) => {
    const { token } = JSON.parse(readFileSync("playwright/.auth/admin.json", "utf-8"));
    const context = await apiRequest.newContext({
      baseURL: env.BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    await use(context);
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
      throw new Error(`Failed to create test courier: ${createResponse.status()}\n${errBody}`);
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
      throw new Error(`Failed to create available courier: ${createResponse.status()}\n${errBody}`);
    }

    const createdCourier = (await createResponse.json()) as Courier;
    const courierId = createdCourier.id;

    const locationResponse = await request.patch(`/api/v1/couriers/${courierId}/location`, {
      data: {
        lat: PRAGUE_CENTER.lat,
        lng: PRAGUE_CENTER.lng,
      },
      failOnStatusCode: false,
    });

    if (locationResponse.status() !== 200) {
      const errBody = await locationResponse.text();
      throw new Error(`Failed to set courier location: ${locationResponse.status()}\n${errBody}`);
    }

    const statusResponse = await request.patch(`/api/v1/couriers/${courierId}/status`, {
      data: {
        status: "available",
      },
      failOnStatusCode: false,
    });

    if (statusResponse.status() !== 200) {
      const errBody = await statusResponse.text();
      throw new Error(`Failed to set courier status: ${statusResponse.status()}\n${errBody}`);
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

  // API clients jako fixtures — snižují boilerplate v testech
  orders: async ({ request }, use) => {
    await use(new OrdersClient(request));
  },

  couriers: async ({ request }, use) => {
    await use(new CouriersClient(request));
  },

  dispatch: async ({ request }, use) => {
    await use(new DispatchClient(request));
  },

  adminOrders: async ({ adminRequest }, use) => {
    // admin-scope OrdersClient — používej pro DELETE/admin operace
    await use(new OrdersClient(adminRequest));
  },

  couriersTeam: async ({ request }, use) => {
    // 3 kurýři s různými tag sadami — pokrývá běžné dispatch scénáře.
    // Všichni už mají GPS i status=available, takže test může rovnou dispatchovat.
    const client = new CouriersClient(request);
    const tagSets: string[][] = [["bike"], ["fragile_ok", "car"], ["vip", "bike"]];
    const created: Courier[] = [];

    for (const tags of tagSets) {
      const base = makeFakeCourierData();
      const courier = await client.create({ ...base, tags });
      await client.setLocation(courier.id, PRAGUE_CENTER.lat, PRAGUE_CENTER.lng);
      const ready = await client.setStatus(courier.id, "available");
      created.push(ready);
    }

    await use(created);

    // Cleanup: offline → delete pro každého (tolerujeme partial fail přes failOnStatusCode)
    for (const c of created) {
      await request.patch(`/api/v1/couriers/${c.id}/status`, {
        data: { status: "offline" },
        failOnStatusCode: false,
      });
      await request.delete(`/api/v1/couriers/${c.id}`, {
        failOnStatusCode: false,
      });
    }
  },

  pairOfAvailableCouriers: async ({ request }, use) => {
    // Composition nad CouriersClient — každý kurýr prochází: create → GPS → available.
    // Oba dostávají stejný tag set ["bike"]; pokud test potřebuje asymetrické tagy,
    // použij raději inline `prepareAvailableCourier` nebo `couriersTeam`.
    const client = new CouriersClient(request);
    const mkReady = async (): Promise<Courier> => {
      const courier = await client.create({ ...makeFakeCourierData(), tags: ["bike"] });
      await client.setLocation(courier.id, PRAGUE_CENTER.lat, PRAGUE_CENTER.lng);
      return await client.setStatus(courier.id, "available");
    };

    // Paralelní setup — úspora ~150–300ms oproti sériovému řetězci.
    const pair = (await Promise.all([mkReady(), mkReady()])) as [Courier, Courier];

    await use(pair);

    for (const c of pair) {
      await request.patch(`/api/v1/couriers/${c.id}/status`, {
        data: { status: "offline" },
        failOnStatusCode: false,
      });
      await request.delete(`/api/v1/couriers/${c.id}`, {
        failOnStatusCode: false,
      });
    }
  },
});

export { expect } from "@playwright/test";
