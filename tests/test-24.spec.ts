import { test, expect, } from "@playwright/test"

test("Testing authentication popup", async ({browser}) => {

    const context = await browser.newContext({httpCredentials: {username: 'admin', password: 'admin'}});
    const page = await context.newPage();
    // await page.goto("https://admin:admin@the-internet.herokuapp.com/basic_auth")

    await page.goto("https://the-internet.herokuapp.com/basic_auth")

    await page.waitForLoadState();

    expect(page).toHaveTitle('The Internet')
    
})

