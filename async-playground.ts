// async-playground.ts

// ---------- Teorie v kódu ----------
// async funkce VŽDY vrací Promise.
// Promise je "slib" hodnoty, která přijde později (asynchronně).
// await "rozbalí" Promise a počká na výsledek.

async function getCourierCount(): Promise<number> {
  // fetch je built-in v Node 24 - žádný import netřeba
  const response = await fetch("http://localhost:20300/api/v1/couriers/");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as unknown[]; // zatím bezpečný default typ
  return data.length;
}

// ---------- Main ----------
async function main() {
  console.log("Volám API...");

  try {
    const count = await getCourierCount();
    console.log(`Počet kurýrů v DB: ${count}`);
  } catch (error) {
    console.error("Něco se pokazilo:", error);
  }
}

// Spuštění (top-level await by taky šel, ale takhle je to explicitnější)
main();
