import { test, expect, Locator } from "@playwright/test"
import { text } from "node:stream/consumers";

test("Testing sorting of dropdown list", async ({page})=> {
    await page.goto("https://testautomationpractice.blogspot.com/")

    const list: Locator = page.locator("#colors>option");
    
    const clearText: string[] = (await list.allTextContents()).map(text=>text.trim());

    const originalText: string[] = [...clearText];
    const sortedText: string[] = [...clearText].sort();

    console.log("Original text:", originalText);
    console.log("sorted text", sortedText);

    expect(originalText).toEqual(sortedText)
})