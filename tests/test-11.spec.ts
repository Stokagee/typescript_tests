import { test, expect, Locator } from "@playwright/test"

test("Testing hidden dropdown", async ({page}) => {
    await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login");
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();

    await page.locator('input[name="username"]').fill("Admin");
    await page.locator('input[name="password"]').fill("admin123");
    await page.locator('button[type="submit"]').click();

    const pageForClick: Locator = page.getByText("PIM")
    await pageForClick.click();

    await page.locator("form i").nth(2).click();

    // capture all the options from dropdown

    const allValueFromList: Locator = page.locator("div[role='listbox'] span");
    await page.waitForTimeout(2000)
    const fullCount: number =  await allValueFromList.count();
    console.log("This is count of list ===>", fullCount);

    // Print all the options

    for(let i=0; i <fullCount; i++){
        // console.log(await allValueFromList.nth(i).innerText());
        console.log(await allValueFromList.nth(i).textContent());
    }

    // Select/clcik on option/dropdown

    await page.getByText("QA Engineer").click();

    for(let i=0; i<fullCount; i++){
        const text = await allValueFromList.nth(i).innerText();
        if(text==='QA Engineer')
        {
            await allValueFromList.nth(i).click();
            break;
        }
    }
})