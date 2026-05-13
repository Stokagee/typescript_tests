import { test, expect } from "@playwright/test"

test("Tetsing - asserations", async ({page}) => {
    page.goto("https://stokagee.github.io/QACanvas/index.html")
    await expect(page).toHaveURL("https://stokagee.github.io/QACanvas/index.html");
    await expect(page).toHaveTitle("QACanvas — Home");

    await page.getByTestId('username-input').fill("admin");
    await page.getByTestId('password-input').fill("admin123");
    await page.getByTestId('login-btn').click();
    await expect(page.getByTestId("nav-link-inputs")).toBeVisible();
    await page.getByTestId("nav-link-inputs").click();
    expect (page.getByTestId("input-disabled")).not.toBeEditable

    await page.getByTestId("input-text").fill("Hello");


})