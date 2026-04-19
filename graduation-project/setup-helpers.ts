import { makeFakeCourier } from "../utils/factories";
import { PRAGUE_CENTER } from "../utils/test-locations";
import type { CouriersClient } from "../api/clients";
import type { Courier } from "../schemas/courier";

/**
 * Připraví plně operativního kurýra: vytvořený → GPS → status=available.
 * Vrací parsovaného kurýra po posledním setStatus volání (tj. včetně aktuálního statusu).
 *
 * Použij v testech, které potřebují rychle hotového kurýra bez boilerplate kroků.
 * Pro scénáře s více kurýry najednou preferuj `couriersTeam` fixture.
 */
export async function prepareAvailableCourier(
  couriers: CouriersClient,
  tags: string[]
): Promise<Courier> {
  const courier = await couriers.create(makeFakeCourier({ tags }));
  await couriers.setLocation(courier.id, PRAGUE_CENTER.lat, PRAGUE_CENTER.lng);
  return await couriers.setStatus(courier.id, "available");
}
