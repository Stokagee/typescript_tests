interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  status:
    | "CREATED"
    | "SEARCHING"
    | "ASSIGNED"
    | "PICKED"
    | "DELIVERED"
    | "CANCELLED";
  pickup_address: string;
  delivery_address: string;
  is_vip: boolean;
  required_tags: string[];
}

async function fetchPendingOrders(): Promise<Order[]> {
  const response = await fetch("http://localhost:20300/api/v1/orders/pending");

  if (!response.ok) {
    throw new Error(`HTTP chyba: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as Order[];
  return data;
}

async function main(): Promise<void> {
  try {
    const orders = await fetchPendingOrders();

    console.log(`Počet pending objednávek: ${orders.length}`);

    const vipOrders = orders.filter((o) => o.is_vip);
    console.log(`Počet VIP objednávek: ${vipOrders.length}`);

    const uniqueCustomerNames = [...new Set(orders.map((o) => o.customer_name))];
    console.log("Unikátní customer_name:");
    console.log(uniqueCustomerNames);
  } catch (error) {
    console.error("Chyba při načítání objednávek:", error);
  }
}

main();