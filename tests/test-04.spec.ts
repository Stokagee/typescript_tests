import {test, expect, Locator} from "@playwright/test"
import { Faker } from "@faker-js/faker"


test("Xpath testing", async ({page})=>{
    await page.goto("/");

    // 1. Absolute xpath
    const absoluteXpath: Locator = page.locator("//html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]/div[2]/input[1]");
    await expect(absoluteXpath).toBeVisible();

    // 2. Relative xpath
    const relativeXpath: Locator = page.locator("//input[@placeholder='Zadejte jméno']");
    await expect(relativeXpath).toBeVisible();

    // 3. contains() 

    const containsXpath: Locator = page.locator("//div[contains(@class,'css-text')]")
    const inputCounts: Number = await containsXpath.count();
    expect(inputCounts).toBeGreaterThan(2);
    console.log("There is ",inputCounts,": inputs");
    // console.log(await containsXpath.textContent());    // Error: strict mode violation:
    console.log(await containsXpath.nth(4).textContent())
    console.log(await containsXpath.last().textContent())
    console.log(await containsXpath.nth(2).textContent())

    let allTextFromXpath: string [] = await containsXpath.allTextContents();

    for(let pt of allTextFromXpath)
    {
        console.log(pt);
    }

    // 4. start-with()

    const startWithTextXpath: Locator = page.locator("//div[starts-with(@role,'menu')]")  // Returned multiple elements
    const count: Number = await startWithTextXpath.count();
    expect(count).toBeGreaterThan(3);

    // 5. text()

    const formText: Locator = page.locator("//div[text()='Seznam']");
    await expect(formText).toBeVisible();
    await formText.click();

    // 6. last()

    const lastFunction: Locator = page.locator("(//div[starts-with(@aria-label,'Seznam položek')]//div[contains(@class,'css-text')])[last()]")
    await expect(lastFunction).toBeVisible();
    console.log("tohle je koš", await formText.textContent());
})

test("Testing dynamic button", async ({page}) => {
        await page.goto("https://testautomationpractice.blogspot.com/")


        for(let i = 1; i <= 5; i++) {
            let dynamicButton: Locator = page.locator("//button[text()='START' or text()='STOP' ]");
            await dynamicButton.click();
            await page.waitForTimeout(2000);
        }

    })