import { test, expect, Locator } from "@playwright/test"
import { text } from "node:stream/consumers";

test("Testing sorting of dropdown list", async ({page})=> {
    await page.goto("https://testautomationpractice.blogspot.com/")

    const list: Locator = page.locator("#colors>option");
    
    const Text: string[] = (await list.allTextContents()).map(text=>text.trim());

    const myset = new Set<string>();
    const duplicates: string[] = []

    for(const te of Text)
    {
        if(myset.has(te))
        {
            duplicates.push(te);
        }
        else{
            myset.add(te)
        }
    }

    console.log("Duplicates:=====>", duplicates)
})