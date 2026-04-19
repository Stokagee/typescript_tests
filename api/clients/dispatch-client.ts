import type { APIRequestContext, APIResponse } from "@playwright/test";
import { expect } from "@playwright/test";
import { DispatchResultSchema } from "../../schemas/dispatch";
import type { DispatchResult } from "../../schemas/dispatch";
import { DispatchLogListSchema } from "../../schemas/dispatch-log";
import type { DispatchLog } from "../../schemas/dispatch-log";

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
   * Manuální přiřazení kurýra k objednávce — happy-path varianta.
   * Throws když status není v [200, 400, 404, 422] nebo když response neodpovídá DispatchResult schématu.
   * Pro negative testy, kde chceš jen raw response bez parsování, použij `manualRaw`.
   */
  async manual(orderId: number, courierId: number): Promise<DispatchResult> {
    const res = await this.request.post(`${this.basePath}/manual`, {
      data: { order_id: orderId, courier_id: courierId },
      failOnStatusCode: false,
    });
    expect([200, 400, 404, 422]).toContain(res.status());
    return DispatchResultSchema.parse(await res.json());
  }

  /**
   * Raw varianta manual dispatchu — žádná asserce statusu, žádný Zod parse.
   * Použij pro negative testy, kde chceš status-codes zkoumat sám (403/404/409/422, ...).
   */
  async manualRaw(orderId: number, courierId: number): Promise<APIResponse> {
    return await this.request.post(`${this.basePath}/manual`, {
      data: { order_id: orderId, courier_id: courierId },
      failOnStatusCode: false,
    });
  }

  /**
   * Načte dispatch log pro konkrétní objednávku.
   * Throws při non-200 nebo když tvar response neodpovídá schématu.
   */
  async getLogsForOrder(orderId: number): Promise<DispatchLog[]> {
    const res = await this.request.get(`${this.basePath}/logs/order/${orderId}`);
    expect(
      res.status(),
      `DispatchClient.getLogsForOrder(${orderId}): očekáváno 200, dostáno ${res.status()}`
    ).toBe(200);
    return DispatchLogListSchema.parse(await res.json());
  }
}
