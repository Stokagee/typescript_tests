import { test, expect, Locator } from "@playwright/test"

test("Testing JS alerts - Simple alert", async ({page}) => {
    await page.goto("https://testautomationpractice.blogspot.com/");

    page.on('dialog', (dialog) => {
        console.log("Dialog type", dialog.type());
        expect(dialog.type()).toContain("alert");
        console.log("Dialog text", dialog.message());
        expect(dialog.message()).toContain("I am an alert box!");
        dialog.accept();
    });

    const simpleAlert = await page.locator("#alertBtn").click()


})
