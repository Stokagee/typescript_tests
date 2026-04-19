import type { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";
import { DispatchResultSchema } from "../../schemas/dispatch";
import type { DispatchResult } from "../../schemas/dispatch";

export class DispatchClient {
  private readonly basePath = "/api/v1/dispatch";

  constructor(private readonly request: APIRequestContext) {}

  /**
   * Auto-dispatch objednávky.
   * Vrací výsledek včetně success flagu - non-fail-on-error.
   */
  async auto(orderId: number): Promise<DispatchResult> {
    const res = await this.request.post(`${this.basePath}/auto/${orderId}`, {
      failOnStatusCode: false,
    });
    expect([200, 404, 422]).toContain(res.status());
    return DispatchResultSchema.parse(await res.json());
  }

  /**
   * Manuální přiřazení kurýra k objednávce.
   */
  async manual(orderId: number, courierId: number): Promise<DispatchResult> {
    const res = await this.request.post(`${this.basePath}/manual`, {
      data: { order_id: orderId, courier_id: courierId },
      failOnStatusCode: false,
    });
    expect([200, 400, 404, 422]).toContain(res.status());
    return DispatchResultSchema.parse(await res.json());
  }
}
