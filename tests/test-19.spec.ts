import { test, expect, Locator, Page } from "@playwright/test"

async function selectDate(
    targetYear: string, 
    targetMonthName: string,    // např. "June" — pro porovnání hlavičky
    targetMonthIndex: string,   // např. "5" — pro data-month atribut
    targetDate: string, 
    page: Page, 
    isFuture: boolean
) {
    const arrowSelector: Locator = page.getByRole('button', { name: 'Next month' });

  

    while (true) {
        const currentMonthYear = await page.locator(".e7addce19e.af236b7586").nth(0).innerText();
        console.log("======>", currentMonthYear)
        const currentMonth = currentMonthYear.split(" ")[0];
        const currentYear = currentMonthYear.split(" ")[1];

        if (currentMonth === targetMonthName && currentYear === targetYear) {
            break;
        }

        await arrowSelector.click();
    }

    await page.locator(`[data-date="${targetYear}-${targetMonthIndex}-${targetDate}"]`,).click();
}

test("Testing date pickers jQuery", async ({page}) => {
    await page.goto("https://www.booking.com/");
    const datePicker1Input: Locator = page.getByTestId("searchbox-dates-container");
    const modal: Locator = page.getByRole('button', { name: 'Dismiss sign-in info.' })
    const cookies: Locator = page.getByRole('button', { name: 'Decline' })

    await modal.click();
    await cookies.click();
    await datePicker1Input.click();


    await selectDate("2027", "June", "06", "15", page, true);

    await expect(datePicker1Input).toContainText("Jun 15");
});