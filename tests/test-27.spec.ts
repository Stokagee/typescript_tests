import { test, expect, Locator } from "@playwright/test"

test("Testing - tracing demo", async ({page, context}) => {
    context.tracing.start({screenshots: true, snapshots: true});
    await page.goto("https://stokagee.github.io/QACanvas/index.html")
    await expect(page).toHaveURL("https://stokagee.github.io/QACanvas/login.html");

    await page.getByTestId('username-input').fill("admin");
    await page.getByTestId('password-input').fill("admin123");
    await page.getByTestId('login-btn').click();
    await expect.soft(page.getByTestId("nav-link-inputs")).toBeVisible();

    context.tracing.stop({path:'trace.zip'})

    // Page screenshot
    const timeStamp = Date.now();
    // await page.screenshot({path: "screenshots/"+"homepage"+timeStamp+".png"});

    // Full page screenshot
    // await page.screenshot({path: "screenshots/"+"homepage"+timeStamp+".png", fullPage: true})

    // Element screenshot
    // const inputLogo = page.getByTestId("nav-card-inputs")
    // await inputLogo.screenshot({path: "screenshots/"+"homepage"+timeStamp+".png"});

    // const tableLogo = page.getByTestId("home-grid");
    // await tableLogo.screenshot({path: "screenshots/"+"homepage"+timeStamp+".png"});

});