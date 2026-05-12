import { test,expect, Locator, chromium } from "@playwright/test"

test("Testing multiple context", async () =>{
    const browser = await chromium.launch();
    const context = browser.newContext();
    const parentPage = (await context).newPage();

    (await parentPage).goto("https://testautomationpractice.blogspot.com/");

    const [childPage] = await Promise.all([(await context).waitForEvent('page'), (await parentPage).locator("button:has-text('New Tab')").click()]);

    const pages = (await context).pages();

    console.log("Number of pages created", pages.length)

    // 1) for more when 2 pages

    console.log("Title of the parent page:", await pages[0].title());
    console.log("Title of the child  page", await pages[1].title());

    //  2) alternative approach

    console.log("Title of the parent page:",await (await parentPage).title());
    console.log("Title of the child page:", await childPage.title());


})