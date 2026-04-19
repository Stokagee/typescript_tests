import type { APIRequestContext, APIResponse } from "@playwright/test";
import { expect } from "@playwright/test";
import { OrderSchema, OrderListSchema } from "../../schemas/order";
import type { Order, OrderCreate, OrderStatus } from "../../schemas/order";

/**
 * Klient pro práci s /api/v1/orders endpointem.
 * Zapouzdřuje URL, asserce statusů a parsování responses.
 */
export class OrdersClient {
  private readonly basePath = "/api/v1/orders";

  constructor(private readonly request: APIRequestContext) {}

  /**
   * Vytvoří objednávku a vrátí ji parsovanou.
   * Throws při non-201 statusu.
   */
  async create(body: OrderCreate): Promise<Order> {
    const res = await this.request.post(`${this.basePath}/`, { data: body });
    expect(res.status(), `OrdersClient.create: očekáváno 201, dostáno ${res.status()}`).toBe(201);
    return OrderSchema.parse(await res.json());
  }

  /**
   * Načte objednávku podle ID.
   */
  async getById(id: number): Promise<Order> {
    const res = await this.request.get(`${this.basePath}/${id}`);
    expect(
      res.status(),
      `OrdersClient.getById(${id}): očekáváno 200, dostáno ${res.status()}`
    ).toBe(200);
    return OrderSchema.parse(await res.json());
  }

  /**
   * GET varianta bez asserce statusu. Použij pro existence checks (404 verifikace apod.).
   */
  async getByIdRaw(id: number): Promise<APIResponse> {
    return await this.request.get(`${this.basePath}/${id}`, {
      failOnStatusCode: false,
    });
  }

  /**
   * Načte všechny pending objednávky.
   */
  async listPending(): Promise<Order[]> {
    const res = await this.request.get(`${this.basePath}/pending`);
    expect(res.status()).toBe(200);
    return OrderListSchema.parse(await res.json());
  }

  /**
   * Načte objednávky filtrované podle stavu.
   */
  async listByStatus(status: OrderStatus): Promise<Order[]> {
    const res = await this.request.get(`${this.basePath}/by-status/${status}`);
    expect(res.status()).toBe(200);
    return OrderListSchema.parse(await res.json());
  }

  /**
   * Zruší objednávku (CREATED/SEARCHING/ASSIGNED → CANCELLED).
   */
  async cancel(id: number): Promise<void> {
    const res = await this.request.post(`${this.basePath}/${id}/cancel`);
    expect(res.status()).toBe(200);
  }

  /**
   * Admin operace — změna stavu objednávky přes PATCH /status.
   * Vyžaduje admin-scope context (jinak 403).
   */
  async setStatus(id: number, status: OrderStatus): Promise<Order> {
    const res = await this.request.patch(`${this.basePath}/${id}/status`, {
      data: { status },
    });
    expect(res.status()).toBe(200);
    return OrderSchema.parse(await res.json());
  }

  /**
   * Smaže objednávku (admin operation - obvykle vyžaduje admin context).
   * Vrací raw response, ať si volající ověří status (200 vs 204).
   */
  async deleteRaw(id: number): Promise<APIResponse> {
    return await this.request.delete(`${this.basePath}/${id}`, {
      failOnStatusCode: false,
    });
  }

  /**
   * Tichý cleanup helper - smaže objednávku bez asserce, ignoruje chyby.
   * Použij v finally blocích testů.
   */
  async tryDelete(id: number): Promise<void> {
    await this.request.delete(`${this.basePath}/${id}`, {
      failOnStatusCode: false,
    });
  }
}
