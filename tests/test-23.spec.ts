import { test,expect, Locator,} from "@playwright/test"

test("Testing - work with pop up windows", async ({browser}) =>{

    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("https://testautomationpractice.blogspot.com/")

    // Multiple pop ups windows

    // await page.waitForEvent('popup');
    // await page.locator("#PopUp").click();

    await Promise.all([page.waitForEvent('popup'), await page.locator("#PopUp").click()])
    await Promise.all([page.waitForEvent('popup'), await page.locator("#PopUp").click()])

    const allPopupWindows = context.pages();
    console.log("Number of sindows", allPopupWindows.length);

    console.log(allPopupWindows[0].url());
    console.log(allPopupWindows[1].url());
    console.log(allPopupWindows[2].url());

    for(const pw of allPopupWindows){
        const title = await pw.title();
        if(title.includes('Playwright')){
            await pw.locator(".getStarted_Sjon").click();
            await pw.close();
        }
    }

});