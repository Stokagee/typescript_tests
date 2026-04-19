import { faker } from "@faker-js/faker";
import type { OrderCreate } from "../schemas/order";
import { OrderCreateSchema } from "../schemas/order";
import type { CourierCreate } from "../schemas/courier";
import { CourierCreateSchema } from "../schemas/courier";

/**
 * Vyrobí náhodný, validní body pro vytvoření objednávky.
 * Všechny fieldy lze přebít přes overrides.
 *
 * @param overrides částečný objekt, jehož fieldy nahradí defaults
 * @returns validovaný OrderCreate
 */
export function makeFakeOrder(
  overrides?: Partial<OrderCreate>
): OrderCreate {
  const defaults: OrderCreate = {
    customer_name: faker.person.fullName(),
    customer_phone: `+420${faker.string.numeric(9)}`,
    pickup_address: `${faker.location.streetAddress()} ${Date.now()}`,
    pickup_lat: Number(faker.location.latitude({ min: 49.5, max: 50.5 })),
    pickup_lng: Number(faker.location.longitude({ min: 14, max: 15 })),
    delivery_address: `${faker.location.streetAddress()} ${Date.now()}`,
    delivery_lat: Number(faker.location.latitude({ min: 49.5, max: 50.5 })),
    delivery_lng: Number(faker.location.longitude({ min: 14, max: 15 })),
    is_vip: false,
    required_tags: [],
  };

  // Validace přes Zod — chytí, pokud bys do overrides dal neplatnou hodnotu
  return OrderCreateSchema.parse({ ...defaults, ...overrides });
}

export function makeFakeCourier(overrides?: Partial<CourierCreate>): CourierCreate {
  const uniqueSuffix = `${Date.now()}-${faker.string.numeric(4)}`;
  const defaults: CourierCreate = {
    name: faker.person.fullName(),
    phone: `+420${faker.string.numeric(9)}`,
    email: `test-${uniqueSuffix}@example.com`,
    tags: [],
  };
  return CourierCreateSchema.parse({ ...defaults, ...overrides });
}