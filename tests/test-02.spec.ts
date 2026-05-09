import { test, expect } from "@playwright/test";

test("Testing the UI", () => {

    // test step 1
    // test step 2
    // test step 3
});

// fixture - global variabel : page.

test("Verify page title",async ({page})=>{
  await page.goto("http://localhost:20301/");

  let url:string=await page.url();
      console.log("Url:",url);

  await expect(page).toHaveURL(/20301/);



})