import { test, expect, Locator } from '@playwright/test'

test("Filter the rows and check the rows count", async ({page}) => {
    await page.goto("https://datatables.net/");

    const dropdown: Locator = page.locator("#dt-length-0");
    await dropdown.selectOption({label: '25'});

    const rows = await page.locator("#example_wrapper tbody tr").all();
    expect(rows.length).toBe(25);
    const rows2 = page.locator("#example_wrapper tbody tr")
    expect(rows2).toHaveCount(25);
})