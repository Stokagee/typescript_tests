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

test("Testing JS alerts - Confirmation alert", async ({page}) => {
    await page.goto("https://testautomationpractice.blogspot.com/");

    page.on('dialog', (dialog) => {
        console.log("Dialog type", dialog.type());
        expect(dialog.type()).toContain("confirm");
        console.log("Dialog text", dialog.message());
        expect(dialog.message()).toContain("Press a button!");
        dialog.accept();
    });

    await page.locator("#confirmBtn").click()
    const msgText: Locator = page.locator("#demo");
    await expect(msgText).toContainText("You pressed OK!")


})

test.only("Testing JS alerts - Prompt alert", async ({page}) => {
    await page.goto("https://testautomationpractice.blogspot.com/");

    page.on('dialog', (dialog) => {
        console.log("Dialog type", dialog.type());
        expect(dialog.type()).toContain("prompt");
        console.log("Dialog text", dialog.message());
        expect(dialog.message()).toContain("Please enter your name:");
        expect(dialog.defaultValue()).toContain("Harry Potter");

        dialog.accept("John");
    });

    await page.locator("#promptBtn").click()
    const msgText: Locator = page.locator("#demo");
    await expect(msgText).toContainText("John")


})
