# Graduation project — Manual dispatch test suite

Kompletní test suite pro `POST /api/v1/dispatch/manual` endpoint, napsaná podle best practices projektu. Určena jako **showcase** pro nový projekt.

## Struktura

```
graduation-project/
├── manual-dispatch.spec.ts   # 9 testů (3 happy + 4 negative + 2 side-effect)
├── setup-helpers.ts          # prepareAvailableCourier() helper
└── README.md                 # tento dokument
```

Infrastruktura ve sdílených cestách:

- `api/clients/dispatch-client.ts` — rozšířeno o `manualRaw()` a `getLogsForOrder()`
- `schemas/dispatch-log.ts` — Zod schéma pro log entries
- `schemas/dispatch.ts` — Zod schéma pro dispatch result (podporuje `courier_id: null` při failure)
- `fixtures/api-fixtures.ts` — fixture `couriersTeam` (B2) a `pairOfAvailableCouriers` (B2b)
- `utils/test-locations.ts` — sdílená konstanta `PRAGUE_CENTER`

## Chování backendu (zjištěné discovery runem)

Endpoint `/dispatch/manual` vrací **`200 OK` pro všechny business failures** s `success: false` a popisnou `message`. HTTP 4xx status se nepoužívá pro business-level chyby.

| Scénář              | Response                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| Úspěšný dispatch    | `200 {"success": true, "courier_id": N, "order_id": M}`                  |
| Busy kurýr          | `200 {"success": false, "message": "Courier is not available ...busy)"}` |
| Order už ASSIGNED   | `200 {"success": false, "message": "Order cannot be dispatched ...)"}`   |
| Neexistující kurýr  | `200 {"success": false, "message": "Courier not found"}`                 |
| Kurýr bez req. tagů | `200 {"success": false, "message": ... }` (přesná formulace variabilní)  |

`/dispatch/logs/order/{id}` aktuálně **nevystavuje** field `type` — test #8 filtruje jen podle `order_id` + `courier_id`.

## Test matrix

| #   | Kategorie   | Název testu                                                      | Kontrakt                                         |
| --- | ----------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| 1   | happy       | běžná objednávka + bike kurýr                                    | 200 success:true; order=ASSIGNED, kurýr=busy     |
| 2   | happy       | fragile objednávka + kurýr s fragile_ok                          | 200 success:true; order=ASSIGNED, kurýr=busy     |
| 3   | happy       | VIP objednávka + VIP kurýr                                       | 200 success:true; order=ASSIGNED, kurýr=busy     |
| 4   | negative    | busy kurýr → success:false s message 'busy'                      | 200 success:false; message /busy\|not available/ |
| 5   | negative    | kurýr bez required tags → success:false                          | 200 success:false; message truthy                |
| 6   | negative    | ASSIGNED order → druhý dispatch vrací success:false s 'ASSIGNED' | 200 success:false; message /ASSIGNED/            |
| 7   | negative    | neexistující courier_id → success:false s 'not found'            | 200 success:false; message /not found/           |
| 8   | side-effect | úspěšný dispatch zapíše záznam do dispatch logu                  | `getLogsForOrder()` má matching entry            |
| 9   | side-effect | úspěšný dispatch odstraní kurýra z /couriers/available           | kurýr není v `listAvailable()`                   |

Happy-path sdílí tělo přes parametrizaci (`forEach` nad `happyScenarios`) — přidání scénáře = 1 objekt v poli.

## Použité patterny

### Core patterny z projektu

- **API Client fixtures** (`orders`, `couriers`, `dispatch`, `adminOrders`) — eliminují boilerplate; encapsulace URL, status assert + Zod parse.
- **Zod schémata** parsují response ve všech client metodách — test nikdy nepracuje s `any`.
- **Faker factories** (`makeFakeOrder`, `makeFakeCourier`) — každý test má vlastní unikátní data.
- **`safeCleanup`** v `finally` — best-effort cleanup i když asserce selže; obchází ESLint `no-conditional-in-test`.
- **`debugLogIfUnexpected`** u každého negative testu — při neočekávaném statusu spadne body do konzole.
- **`manualRaw`** pro negative scénáře — přístup k raw `APIResponse`, test řídí asserce sám.

### Konvence `test.step` v této suite

Sjednocený Given/When/Then pattern napříč všemi 9 testy:

- `Given: ...` — setup jedné entity (kurýr, order). Jeden step per vytvořenou entitu.
- `When: ...` — volání testovaného endpointu.
- `Then: ...` — verifikace response + side-effectů (DB status, /available, logs).

V trace vieweru každý test vypadá strukturně identicky — reviewer se rychle zorientuje.

### Sdílené konstanty

- `PRAGUE_CENTER` (`utils/test-locations.ts`) — GPS `{lat: 50.08, lng: 14.42}` jako `as const`. Jedno místo pro změnu, jméno místo magického čísla.
- `NONEXISTENT_COURIER_ID = 999_999` (modul-level v `manual-dispatch.spec.ts`) — drží se lokálně, protože je použitá jen v jednom testu.

## Bonusy

### B1 — `manualRaw` varianta (✅ implementováno)

Přidáno do `DispatchClient`. Rationale: `manual()` assertuje status v `[200, 400, 404, 422]` a Zod-parsuje body. Pro negative testy, kde chci čisté `APIResponse` bez client-side asercí, je `manualRaw()` nutné.

### B2 — `couriersTeam` fixture (✅ implementováno, nevyužito v této suite)

Fixture, který vytvoří 3 kurýry s různými tag sadami (`["bike"]`, `["fragile_ok", "car"]`, `["vip", "bike"]`), všem nastaví GPS + status=available a uklidí.

**Použití:** v této suite není použit — žádný test nepotřebuje 3 kurýry zároveň. Fixture zůstává pro budoucí scénáře typu "best match z kandidátů" nebo load tests.

### B2b — `pairOfAvailableCouriers` composition fixture (✅ implementováno)

Named-tuple fixture `[Courier, Courier]` — dva available kurýři s tagem `["bike"]`. Použit v testu #6 (ASSIGNED order).

**Proč tuple místo `couriersTeam[0..1]`?** TypeScript. Tuple `[Courier, Courier]` dá static proof, že oba prvky existují. Array indexace `Courier[]` pod `noUncheckedIndexedAccess` vrací `Courier | undefined` a test by musel ruční non-null.

**Effect na test #6:**

| Metrika                                    | Před   | Po     |
| ------------------------------------------ | ------ | ------ |
| `let courierNId: number \| null` deklarací | 2      | 0      |
| Inline `prepareAvailableCourier` volání    | 2      | 0      |
| `safeCleanup` řádků pro kurýry             | 4      | 0      |
| Setup čas (Promise.all vs. sequential)     | ~300ms | ~150ms |

**Kdy tento pattern použít:**

- 2+ testy potřebují stejnou N-kurýrovou konfiguraci → extract fixture.
- Setup kroky (2+ async volání) zastíní test logiku → composition fixture.
- Jeden test, triviální setup → inline helper (neover-abstraktovat).

### B3 — `test.describe.serial` (rozhodnutí: ❌ nepoužívat)

Playwright projekt je API test s **default workers (CPU cores) lokálně** a `workers: 2` v CI. Otázka: potřebují testy v suite běžet sériově?

**Analýza:** Každý test si vytváří vlastní kurýry (factories s `Date.now()` + random suffix) a vlastní objednávky. Nedochází ke sdílení stavu mezi testy. Dispatch endpoint pracuje per-order, paralelní dispatch dvou různých objednávek se neovlivní.

Test #9 volá `listAvailable()` a filtruje `c.id === courierId` — ostatní paralelně vytvoření kurýři jiných testů odpověď neovlivní.

**Závěr:** Paralelismus je bezpečný. `test.describe.serial` by jen zpomalil běh. _Validated judgment call_, ne opomenutí.

## Běh

```bash
# Všechny tests
pnpm test

# Jen graduation suite
pnpm test graduation-project

# Jeden scénář (filtr dle názvu)
pnpm test -g "busy kurýr"

# UI mode
pnpm test:ui
```

## Verifikace kvality

- `pnpm check-all` — type-check + lint + format:check — musí projít čistě.
