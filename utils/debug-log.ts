import type { APIResponse } from "@playwright/test";

/**
 * Pokud response status neodpovídá očekávanému, zaloguje debug info.
 * Jinak je tiche — pokračuje bez noise.
 */
export async function debugLogIfUnexpected(
  response: APIResponse,
  expectedStatus: number | number[],
  label = "UNEXPECTED"
): Promise<void> {
  const actual = response.status();
  const expectedArr = Array.isArray(expectedStatus)
    ? expectedStatus
    : [expectedStatus];
  if (!expectedArr.includes(actual)) {
    const body = await response.text();
    console.log(
      `[${label}] expected=${expectedArr.join("|")} actual=${actual} body=${body}`
    );
  }
}
