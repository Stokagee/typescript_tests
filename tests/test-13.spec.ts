import { test, expect, Locator } from '@playwright/test'
import { text } from 'node:stream/consumers';

test("Testing with static table", async ({page}) => {
    await page.goto("https://testautomationpractice.blogspot.com/")

    const table: Locator = page.locator("table[name='BookTable']>tbody");
    await expect(table).toBeVisible();

    // 1) count number of rows in a table

    const rows: Locator = table.locator(">tr")
    await expect(rows).toHaveCount(7);

    const rowCount: number = await rows.count();
    console.log("Poet řádků v tabulce=>", rowCount);
    expect(rowCount).toBe(7)

    // 2) count number of columns

    const columns: Locator = rows.locator(">th")
    await expect(columns).toHaveCount(4);

    const columnsCount: number = await columns.count();
    console.log("Počet sloupců v tabulce", columnsCount)
    expect(columnsCount).toBe(4);

    // 3) Read all data from 2nd row (index 2 means 3rd row including header)

    const secondRowsCells: Locator = rows.nth(2).locator('td')
    const secondRowText: string[] = await secondRowsCells.allInnerTexts();
    console.log("Tohle je druhý řádek", secondRowText);

    await expect(secondRowsCells).toHaveText(['Learn Java', 'Mukesh', 'Java', '500'])

    for(let text of secondRowText)
    {
        console.log(text);
    }

    // Read all data from table (excluding header)

    const rowsAllData = await rows.all();

    for(let row of rowsAllData)
    {
        const cols = await row.locator('td').allInnerTexts();
        console.log(cols.join('\t'));
    }




})