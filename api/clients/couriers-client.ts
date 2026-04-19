import type { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";
import { CourierSchema, CourierListSchema } from "../../schemas/courier";
import type { Courier, CourierCreate } from "../../schemas/courier";

type CourierStatus = "offline" | "available" | "busy";

export class CouriersClient {
  private readonly basePath = "/api/v1/couriers";

  constructor(private readonly request: APIRequestContext) {}

  async create(body: CourierCreate): Promise<Courier> {
    const res = await this.request.post(`${this.basePath}/`, { data: body });
    expect(res.status(), `CouriersClient.create: ${res.status()}`).toBe(201);
    return CourierSchema.parse(await res.json());
  }

  async getById(id: number): Promise<Courier> {
    const res = await this.request.get(`${this.basePath}/${id}`);
    expect(res.status()).toBe(200);
    return CourierSchema.parse(await res.json());
  }

  async list(params?: { skip?: number; limit?: number }): Promise<Courier[]> {
    const res = await this.request.get(`${this.basePath}/`, params ? { params } : undefined);
    expect(res.status()).toBe(200);
    return CourierListSchema.parse(await res.json());
  }

  async listAvailable(): Promise<Courier[]> {
    const res = await this.request.get(`${this.basePath}/available`);
    expect(res.status()).toBe(200);
    return CourierListSchema.parse(await res.json());
  }

  async setLocation(id: number, lat: number, lng: number): Promise<Courier> {
    const res = await this.request.patch(`${this.basePath}/${id}/location`, {
      data: { lat, lng },
    });
    expect(res.status()).toBe(200);
    return CourierSchema.parse(await res.json());
  }

  async setStatus(id: number, status: CourierStatus): Promise<Courier> {
    const res = await this.request.patch(`${this.basePath}/${id}/status`, {
      data: { status },
    });
    expect(res.status()).toBe(200);
    return CourierSchema.parse(await res.json());
  }

  async tryDelete(id: number): Promise<void> {
    await this.request.delete(`${this.basePath}/${id}`, {
      failOnStatusCode: false,
    });
  }
}
