import { test, expect, Locator } from "@playwright/test"

test("Testing a variables of drop down", async ({page}) => {
    await page.goto("https://www.flipkart.com/");
    await page.waitForTimeout(3000)
    const modalExit: Locator = page.getByRole('button', { name: '✕' })
    modalExit.click();
    const inputSearch: Locator = page.getByRole('textbox', { name: 'Search for Products, Brands' })
    await page.waitForTimeout(3000)
    await inputSearch.fill("phone");
    await page.waitForTimeout(3000)
    const options: Locator = page.locator("ul>li");
    const count: number = await options.count();
    console.log("=====>", count)

    for(let i = 0; i<count; i++) {
        // console.log("option===>", await options.nth(i).innerText());
        console.log("option===>", await options.nth(i).textContent());
    }

    let found = false;

    for(let i = 0; i<count; i++) {
        // console.log("option===>", await options.nth(i).innerText());
        const text = await options.nth(i).textContent();
        if(text==='phone under 20000')
        {
            await options.nth(i).click();
            found = true;
            break;
        }
        if (!found) {
            console.log("==== Nothing! ====")
        }
    }
    
})