import { test, expect, Locator, Page } from "@playwright/test"

async function selectDate(
    targetYear: string, 
    targetMonthName: string,    // např. "June" — pro porovnání hlavičky
    targetMonthIndex: string,   // např. "5" — pro data-month atribut
    targetDate: string, 
    page: Page, 
    isFuture: boolean
) {
    const arrowSelector = isFuture 
        ? ".ui-datepicker-next.ui-corner-all" 
        : ".ui-datepicker-prev.ui-corner-all";

    while (true) {
        const currentMonth = await page.locator(".ui-datepicker-month").textContent();
        const currentYear = await page.locator(".ui-datepicker-year").textContent();

        if (currentMonth === targetMonthName && currentYear === targetYear) {
            break;
        }

        await page.locator(arrowSelector).click();
    }

    await page.locator(`#ui-datepicker-div td[data-month="${targetMonthIndex}"][data-year="${targetYear}"]`,
        { hasText: targetDate }).click();
}

test("Testing date pickers", async ({page}) => {
    await page.goto("https://testautomationpractice.blogspot.com/");
    const datePicker1Input: Locator = page.locator("#datepicker");

    await datePicker1Input.click();

    await selectDate("2029", "June", "5", "15", page, true);

    await expect(datePicker1Input).toHaveValue("06/15/2029")
});