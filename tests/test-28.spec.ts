import { test, expect, locator } from "@playwright/test"

test("Testing - flaky test", async ({page}) => {
    await page.goto("https://stokagee.github.io/QACanvas/index.html")

})