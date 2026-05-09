import { test, expect, Locator } from '@playwright/test'
import { text } from 'node:stream/consumers';

test("Testing select by", async ({page}) => {
    await page.goto("https://testautomationpractice.blogspot.com/", {
        waitUntil: 'domcontentloaded'
    })

    // await page.locator("#country").selectOption('China');    // visible text
    // await page.locator("#country").selectOption({value: 'france'});    //  by value
    // await page.locator("#country").selectOption({label: 'usa'});    // by value attribute
    // await page.locator("#country").selectOption({index: 0});    // by index

    const dropdownOptions: Locator = page.locator("#country>option");
    await expect(dropdownOptions).toHaveCount(10);

    const optionsText: string[] = (await dropdownOptions.allTextContents()).map(text=>text.trim());         // vypíše jako pole
    console.log(optionsText);

    expect(optionsText).toContain('France');

    for(const option of optionsText) {                          // vypíše jako str po jednom
        console.log(option)
    };

    // await page.locator("#colors").selectOption(['Red', 'Green', 'Yellow']);   // multiple options for text and value
    // await page.locator("#colors").selectOption([{label: 'Red'}, {label: 'Green'}, {label: 'Yellow'}]);  // multiple options for label
    await page.locator("#colors").selectOption([{index: 0}, {index: 2}, {index: 4}]);             // using index

    const colorsDropdown: Locator = page.locator("#colors>option");
    await expect(colorsDropdown).toHaveCount(7);

    const optionsColorsText: string[] = (await colorsDropdown.allTextContents()).map(text=>text.trim());

    expect(optionsColorsText).toEqual(expect.arrayContaining(['Yellow', 'Red']));

    for(const colname of optionsColorsText)
    {
        console.log(colname);
    }
})