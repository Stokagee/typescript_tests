## 📋 Cheat sheet

Rychlá reference klíčových patternů. Pro hlubší vysvětlení viz zdrojový kód v `api/`, `fixtures/`, `schemas/`.

### Setup nového testu

```ts
// tests/my-feature.spec.ts
import { test, expect } from "../fixtures/api-fixtures";  // VŽDY z fixtures, ne @playwright/test
import { makeFakeOrder } from "../utils/factories";
import { safeCleanup } from "../utils/cleanup";

test.describe("Můj feature", () => {
  test("popis behaviour, ne implementace", async ({ orders, couriers }) => {
    // ...
  });
});
```

**Výjimka:** unauth testy (`*.unauth.spec.ts`) importují přímo z `@playwright/test`.

### HTTP requesty přes API client (preferred)

```ts
// Vytvoření resource
const order = await orders.create(makeFakeOrder({ is_vip: true }));

// Read
const fetched = await orders.getById(order.id);

// Update (přes specifickou metodu, ne raw PATCH)
await couriers.setLocation(courier.id, 50.08, 14.42);
await couriers.setStatus(courier.id, "available");

// Cleanup (silent, never throws)
await orders.tryDelete(order.id);

// Raw varianta pro negative testy
const res = await orders.deleteRaw(order.id);
expect(res.status()).toBe(403);
```

### Asserce s kontextem

```ts
// Custom message u expect, kde fail message není self-explanatory
expect(result.success, `dispatch result: ${JSON.stringify(result)}`).toBe(true);

// Range tolerance pro fluctuating values
expect([200, 204]).toContain(response.status());

// Float comparison
expect(courier.lat).toBeCloseTo(50.08, 4);

// Schema validation (uvnitř API client metod automaticky, jinak ručně)
const parsed = await expectMatchesSchema(response, OrderSchema);
```

### Cleanup pattern

```ts
test("...", async ({ orders, couriers, adminOrders }) => {
  let courierId: number | null = null;
  let orderId: number | null = null;

  try {
    courierId = (await couriers.create(...)).id;
    orderId = (await orders.create(...)).id;
    // ... test logic
  } finally {
    // Pořadí MATTERS - cancel order PŘED delete kurýra
    await safeCleanup(orderId, (id) => orders.cancel(id));
    await safeCleanup(courierId, (id) => couriers.setStatus(id, "offline"));
    await safeCleanup(courierId, (id) => couriers.tryDelete(id));
    await safeCleanup(orderId, (id) => adminOrders.tryDelete(id));
  }
});
```

### Custom fixture (resource s automatickým cleanupem)

```ts
// fixtures/api-fixtures.ts
type ApiFixtures = {
  myResource: MyType;
};

export const test = base.extend<ApiFixtures>({
  myResource: async ({ request }, use) => {
    // SETUP
    const created = await /* create */;

    // PŘEDEJ TESTU
    await use(created);

    // TEARDOWN (běží i při fail, automaticky)
    await /* cleanup */;
  },
});
```

### Data factory s override

```ts
// utils/factories.ts
export function makeFakeOrder(overrides?: Partial<OrderCreate>): OrderCreate {
  const defaults: OrderCreate = { /* faker generated */ };
  return OrderCreateSchema.parse({ ...defaults, ...overrides });
}

// V testu:
const vipOrder = makeFakeOrder({ is_vip: true });
const fragile = makeFakeOrder({ required_tags: ["fragile_ok"] });
```

### Parametrizace (no `test.each` — neexistuje!)

```ts
const scenarios = [
  { name: "case A", input: { x: 1 }, expected: 200 },
  { name: "case B", input: { x: 2 }, expected: 422 },
];

scenarios.forEach(({ name, input, expected }) => {
  test(`scénář: ${name}`, async ({ orders }) => {
    // ...
  });
});
```

### Zod schéma (jeden zdroj pravdy: schéma + TS typ)

```ts
// schemas/order.ts
import * as z from "zod";

export const OrderSchema = z.object({
  id: z.number().int().positive(),
  email: z.email(),
  status: z.enum(["CREATED", "ASSIGNED", "DELIVERED"]),
  lat: z.number().min(-90).max(90).nullable(),
  created_at: z.iso.datetime(),
});

// TS typ se odvodí ze schématu — žádná duplicita
export type Order = z.infer<typeof OrderSchema>;

// Pro PATCH (částečná data): .partial() dá vše optional
export const OrderUpdateSchema = OrderSchema.partial();

// Pro extend create → response:
export const OrderResponseSchema = OrderCreateSchema.extend({
  id: z.number().int().positive(),
  status: OrderStatusSchema,
});
```

### `parse` vs `safeParse`

```ts
// parse — throws ZodError, použij v testech (chceš fail s detailem)
const order = OrderSchema.parse(await res.json());

// safeParse — vrací result object, použij v helpers
const result = OrderSchema.safeParse(data);
if (!result.success) {
  console.log(z.prettifyError(result.error));
}
```

### Konfigurace přes .env + Zod

```ts
// config/env.ts
const EnvSchema = z.object({
  BASE_URL: z.url(),
  TEST_ENV: z.enum(["local", "staging", "production"]),
  TEST_USER_ID: z.coerce.number().int().positive(),  // env vars jsou stringy
});

export const env = EnvSchema.parse(process.env);  // FAIL FAST při missing
```

### Auth pattern (zero boilerplate v testech)

```ts
// global-setup.ts — získá token, uloží do souboru
await fetchToken({ role: "user", filePath: "playwright/.auth/user.json" });

// playwright.config.ts — načte token, pošle v každém requestu
use: {
  baseURL: env.BASE_URL,
  extraHTTPHeaders: loadAuthHeaders(),  // čte .auth/user.json
},

// V testu — auth se NEvšímáš, je tam vždy
test("...", async ({ request }) => {
  await request.get("/api/v1/orders/");  // token automaticky
});

// Pro admin operace — adminOrders/adminRequest fixture
test("admin", async ({ adminOrders }) => {
  await adminOrders.deleteRaw(orderId);  // jiný token
});
```

### Negative auth testy (samostatný project)

```ts
// playwright.config.ts
projects: [
  { name: "api", testIgnore: /.*\.unauth\.spec\.ts/, use: { extraHTTPHeaders: loadAuthHeaders() } },
  { name: "api-unauth", testMatch: /.*\.unauth\.spec\.ts/, use: { /* žádný token */ } },
]

// tests/auth.unauth.spec.ts
test("endpoint vyžaduje auth", async ({ request }) => {
  const res = await request.get("/api/v1/orders/", { failOnStatusCode: false });
  expect(res.status()).toBe(401);
});
```

### `test.step` pro strukturované testy

```ts
test("dispatch flow", async ({ orders, couriers, dispatch }) => {
  const courierId = await test.step("připrav kurýra", async () => {
    const c = await couriers.create(makeFakeCourier());
    return c.id;
  });

  await test.step("dispatch", async () => {
    const result = await dispatch.manual(orderId, courierId);
    expect(result.success).toBe(true);
  });
});
```

V HTML reportu uvidíš každý step zvlášť s vlastním timing.

### Debug & troubleshooting

```ts
// Conditional debug log (no noise když všechno OK)
await debugLogIfUnexpected(response, [200, 204], "MY_OPERATION");

// Trace viewer pro failed test
// playwright.config.ts: use: { trace: "retain-on-failure" }
// Pak po failu: pnpm exec playwright show-trace test-results/.../trace.zip

// UI mode pro vývoj nového testu (interaktivní)
pnpm exec playwright test --ui

// VS Code debugger (Playwright extension) — Testing panel → Debug ikona
// Breakpointy fungují normálně
```

### CLI cheat sheet

```bash
# Spuštění
pnpm test                              # vše
pnpm test:staging                      # proti staging env
pnpm test -- --project=api             # jen autentizované
pnpm test -- --project=api-unauth      # jen negative auth
pnpm test -- --grep dispatch           # jen testy obsahující "dispatch"
pnpm test -- couriers-crud.spec.ts     # jeden konkrétní soubor

# Debug
pnpm test:ui                           # UI mode (interaktivní)
pnpm test:debug                        # debug mode s breakpointy
pnpm exec playwright show-report       # otevři poslední HTML report
pnpm exec playwright show-trace ZIP    # otevři trace soubor

# Quality
pnpm type-check                        # TypeScript bez emit
pnpm lint                              # ESLint
pnpm format                            # Prettier write
pnpm format:check                      # Prettier check only
pnpm check-all                         # vše dohromady (CI gate)
```

### Robot Framework → Playwright Rosetta Stone

| Robot Framework | Playwright + TS |
|---|---|
| `Library RequestsLibrary` | `import { test } from "../fixtures/api-fixtures"` |
| `Create Session` | `baseURL` v config |
| `GET On Session ${session} ${url}` | `await request.get("/path")` |
| `${response}=  POST  json=${body}` | `await request.post("/path", { data: body })` |
| `Status Should Be 200` | `expect(res.status()).toBe(200)` |
| `Should Be Equal` | `expect(actual).toBe(expected)` |
| `Should Contain` | `expect(string).toContain(substring)` |
| `${var}=  Set Variable` | `const var = ...` |
| `*** Variables ***` | `process.env.X` (z `.env`) |
| `Suite Setup` | `test.beforeAll()` (per spec) |
| `Suite Teardown` | `test.afterAll()` |
| `Test Setup` | `test.beforeEach()` |
| `Test Teardown` | `test.afterEach()` |
| Variable files | Custom fixtures nebo JSON v `test-data/` |
| `*** Keywords ***` | Funkce nebo metoda v API clientu |
| `Resource` souboru | `import` z `utils/` nebo `helpers/` |
| Tags | `test("name", { tag: ["@smoke"] }, ...)` + `--grep @smoke` |
| `[Template]` / DataDriver | `forEach` přes pole scenarios + `test()` |
| `pabot` (parallel) | Defaultně paralelní, řízeno `workers:` v config |
| `output.xml` | `test-results/junit.xml` reporter |
| `report.html` / `log.html` | `playwright-report/index.html` |
| Listeners | Custom reporter |
| `--variablefile env.py` | `TEST_ENV=staging` env var |

### Pravidla, která drží projekt zdravý

1. **Vždy importuj `test` z `fixtures/api-fixtures`** (kromě unauth testů). Auth a custom fixtures budou tam.
2. **Žádné hardcoded URL v testech** — `request.get("/path")` bere `baseURL` z configu.
3. **Žádné `Authorization` headery v testech** — config to dělá automaticky.
4. **Cleanup vždy v `try/finally` přes `safeCleanup()`** — nikdy neopouštěj resource v DB.
5. **Schémata v `schemas/`, klienti v `api/clients/`, faktories v `utils/factories.ts`** — žádné inline definice v testech.
6. **`as Type` je smell** — použij Zod parse místo nedůvěryhodného castingu.
7. **Pre-commit kontrola: `pnpm check-all`** musí projít před push.
8. **Strict cleanup pořadí** pro provázané resources: nejdřív cancel objednávku, pak offline kurýra, pak delete obojí.
9. **Negative test = test sám o sobě** — neasertuj „A passed" + „B failed" v jednom testu.
10. **Test name = behaviour, ne implementace** — `"VIP order assigns to VIP courier"`, ne `"testCase17_dispatch"`.
