import { test, expect, Locator } from '@playwright/test'

test("Testing with pagination table", async ({page}) => {
    await page.goto("https://datatables.net/");

    // 1) Locatory — naše kotvy
    const dataTable: Locator = page.locator("#example_wrapper");
    const rows: Locator = dataTable.locator("tbody tr");
    const nextButton: Locator = dataTable.locator(".dt-paging-button.next");

    // 2) Akumulátor — sem rosteme data
    const allData: string[][] = [];

    // 3) Smyčka přes všechny stránky
    while (true) {
        // 3a) Přečti aktuální stránku → pole polí
        const pageData: string[][] = [];
        const rowCount = await rows.count();
        
        for (let i = 0; i < rowCount; i++) {
            const cells = await rows.nth(i).locator("td").allTextContents();
            pageData.push(cells);
        }
        
        // 3b) Přidej stránku do akumulátoru
        allData.push(...pageData);
        
        // 3c) Detekce konce
        const isDisabled = await nextButton.getAttribute("aria-disabled");
        if (isDisabled === "true") {
            break;  // konec smyčky, jsme na poslední stránce
        }
        
        // 3d) Zapamatuj si první buňku PŘED kliknutím
        const firstCellBefore = await rows.first().locator("td").first().textContent();
        
        // 3e) Klikni Next
        await nextButton.click();
        
        // 3f) Počkej, až se DOM přerendruje (první buňka už není ta stará)
        await expect(rows.first().locator("td").first()).not.toHaveText(firstCellBefore ?? "");
    }
    
    console.log(`Total rows: ${allData.length}`);
    console.log(allData);
});





    // 2) Filtering lines and verify count from table
    // 3) Search specific name from table and verify

