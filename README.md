# API Tests — Moje Kurýrní Aplikace

End-to-end API test suite postavená na Playwright + TypeScript. Pokrývá kurýry, objednávky a dispatch flow proti FastAPI backendu běžícímu v Dockeru.

## Stack

- **Node.js** 24 LTS
- **Playwright Test** 1.59
- **TypeScript** 6.0
- **pnpm** 10
- **Zod** 4 — runtime schema validation
- **Faker** — test data generation

## Quick start

```bash
# 1. Nainstaluj závislosti
pnpm install

# 2. Zkopíruj env template
cp .env.example .env

# 3. Spusť backend (v jiném terminálu)
docker compose up

# 4. Spusť testy
pnpm test
```

## Struktura projektu

\`\`\`
api/clients/ # API client abstrakce (OrdersClient, CouriersClient, ...)
config/ # env loader (Zod-validated)
fixtures/ # Playwright custom fixtures
helpers/ # general purpose helpers
schemas/ # Zod schémata pro requests + responses
tests/ # _.spec.ts a _.unauth.spec.ts soubory
test-data/ # JSON fixture data
utils/ # factories, matchers, debug helpers
playwright.config.ts
global-setup.ts # získání auth tokenů před testy
\`\`\`

## Spouštění

| Command                             | Popis                           |
| ----------------------------------- | ------------------------------- |
| `pnpm test`                         | Všechny testy (local env)       |
| `pnpm test:staging`                 | Proti staging environment       |
| `pnpm test:ui`                      | UI mode (interaktivní runner)   |
| `pnpm test:debug`                   | Debug mode s breakpointy        |
| `pnpm test -- --project=api`        | Jen autentizované testy         |
| `pnpm test -- --project=api-unauth` | Jen negative auth testy         |
| `pnpm test -- --grep dispatch`      | Jen testy obsahující "dispatch" |
| `pnpm report`                       | Otevře poslední HTML report     |

## Quality checks

\`\`\`bash
pnpm lint # ESLint
pnpm format # Prettier (write)
pnpm format:check # Prettier (check only)
pnpm type-check # tsc --noEmit
pnpm check-all # všechny tři pohromadě
\`\`\`

## Environments

Konfigurace přes `.env` soubory + `TEST_ENV` proměnnou:

- `.env` — local default (commit ignore)
- `.env.staging` — staging overrides (commit ignore)
- `.env.example` — template pro nové členy týmu

Spuštění proti staging:
\`\`\`bash
pnpm test:staging
\`\`\`

## Auth model

Backend vyžaduje JWT Bearer token. Auth se řeší automaticky v `global-setup.ts`:

1. Před testy se zavolá `/api/v1/auth/test-token`
2. Získané user a admin tokeny se uloží do `playwright/.auth/`
3. `playwright.config.ts` načte user token a přidá ho do `extraHTTPHeaders`
4. Pro admin operace: použij fixture `adminRequest` nebo `adminOrders`

## Přispívání

- Pro nové endpointy: přidej Zod schéma v `schemas/`, klient v `api/clients/`, pak teprve test
- Pro nový environment: vytvoř `.env.<name>` a přidej do `TEST_ENV` enum v `config/env.ts`
- Před PR: `pnpm check-all` musí projít

## Troubleshooting

- **Tests failing s 401**: backend není rozjetý, nebo `.env` má špatné credentials
- **`pnpm exec playwright test --ui` neotvírá nic**: zkontroluj, že máš VS Code Playwright extension nainstalovanou
- **CI fail na "token fetch failed"**: backend v CI workflow musí být rozjetý před `pnpm test`
