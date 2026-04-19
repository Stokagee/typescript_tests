// types-playground.ts

// ---------- 1) Primitivní typy ----------
const courierId: number = 42;
const courierName: string = "Jan Novák";
const isOnline: boolean = true;

// ---------- 2) Pole a objekty ----------
const tags: string[] = ["bike", "fast", "vip"];
const coordinates: [number, number] = [50.0755, 14.4378]; // tuple - pevná délka

console.log({ courierName, isOnline, tags, coordinates });

// ---------- 3) Interface - tvar objektu ----------
interface Courier {
  id: number;
  name: string;
  phone: string;
  status: "offline" | "available" | "busy"; // union type - jen tyhle 3 hodnoty
  tags: string[];
  lat?: number; // ? = optional, může chybět
  lng?: number;
}

const courier: Courier = {
  id: 1,
  name: "Jan Novák",
  phone: "+420123456789",
  status: "available",
  tags: ["bike", "fast"],
  lat: 50.0755,
  lng: 14.4378,
};

console.log(`Kurýr ${courier.name} je ${courier.status}`);

// ---------- 4) Funkce s typy ----------
function formatCourier(c: Courier): string {
  const hasGps = c.lat !== undefined && c.lng !== undefined;
  return `[${c.id}] ${c.name} (${c.status}) - GPS: ${hasGps ? "ano" : "ne"}`;
}

console.log(formatCourier(courier));

// ---------- 5) Arrow function (to budeš v Playwrightu vidět všude) ----------
const doubleId = (id: number): number => id * 2;
console.log(`Double ID: ${doubleId(courierId)}`);

// ---------- 6) Práce s polem ----------
const couriers: Courier[] = [
  courier,
  { id: 2, name: "Eva Malá", phone: "+420987654321", status: "busy", tags: ["car"] },
  { id: 3, name: "Petr Nový", phone: "+420555555555", status: "offline", tags: ["bike", "vip"] },
];

// filter (RF: Get Matches From List)
const availableCouriers = couriers.filter((c) => c.status === "available");
console.log(`Dostupní kurýři: ${availableCouriers.length}`);

// map (RF: Evaluate list comprehension, nebo custom keyword)
const names = couriers.map((c) => c.name);
console.log(`Jména: ${names.join(", ")}`);

// find (RF: Get From List + podmínka)
const vip = couriers.find((c) => c.tags.includes("vip"));
console.log(`VIP kurýr: ${vip?.name ?? "žádný"}`);
