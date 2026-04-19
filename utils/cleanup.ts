/**
 * Tichý cleanup helper pro finally bloky v testech.
 *
 * Důvod existence: ESLint `playwright/no-conditional-in-test` hlásí `if (id !== null)` v testech.
 * Přesunutím podmíněné logiky sem má každý test jednoduchý finally bez větvení,
 * a ESLint pravidlo zůstane zapnuté pro skutečné anti-patterny v těle testu.
 */
export async function safeCleanup<T>(
  id: T | null | undefined,
  cleanupFn: (id: T) => Promise<unknown>
): Promise<void> {
  if (id === null || id === undefined) return;
  try {
    await cleanupFn(id);
  } catch {
    // ignore — cleanup je best-effort
  }
}
