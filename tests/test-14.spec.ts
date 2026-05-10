import { test, expect, Locator } from '@playwright/test'
import { log } from 'node:console';

test("Testing with dynamic table", async ({page}) => {
    await page.goto("https://practice.expandtesting.com/dynamic-table");

    const table: Locator = page.locator("table.table tbody");
    await expect(table).toBeVisible();

    // 1) For Chrome process get value of CPU load.



    const headers: Locator = page.locator("table.table thead");
    const headersText: string[] = await headers.locator("th").allTextContents();
    const cpuIndex: number = headersText.indexOf("CPU");
    expect(cpuIndex).toBeGreaterThanOrEqual(0);

    const chromeRow: Locator = table.locator("tr").filter({hasText: "Chrome"});
    const cpuCell: Locator = chromeRow.locator("td").nth(cpuIndex);
    const cpu: string | null = await cpuCell.textContent();
    console.log(cpu);

    expect(cpu).not.toBeNull();
    await expect(page.locator("#chrome-cpu")).toContainText(cpu as string);
    


})