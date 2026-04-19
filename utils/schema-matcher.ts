import * as z from "zod";
import { expect } from "@playwright/test";
import type { APIResponse } from "@playwright/test";

/**
 * Validuje response body proti Zod schématu.
 * Vrací typovaný objekt pro další použití v testu.
 *
 * @param response Playwright APIResponse
 * @param schema Zod schéma očekávané struktury
 * @returns Typovaná, validovaná data
 */
export async function expectMatchesSchema<T extends z.ZodType>(
  response: APIResponse,
  schema: T
): Promise<z.infer<T>> {
  const body = await response.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    const prettyError = z.prettifyError(result.error);
    expect(
      result.success,
      `Response neodpovídá schématu:\n${prettyError}\n\nResponse body:\n${JSON.stringify(body, null, 2)}`
    ).toBe(true);
  }

  return result.data!;
}
