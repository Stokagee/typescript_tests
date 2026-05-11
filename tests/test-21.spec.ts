import { test, expect, Locator, Frame } from "@playwright/test"

test("Testing frames", async ({page}) => {
    await page.goto("https://ui.vision/demo/webtest/frames/");

    //  Total number of frames
    const frames = page.frames();
    console.log("Number of frames", frames.length);

    // ========  Approach: 1) using page.frame() ========
    const frame = page.frame({ url:"https://ui.vision/demo/webtest/frames/frame_1.html"});

        if(frame)
        {
            // await frame.locator('[name="mytext1"]').fill("Hello");
            await frame.fill('[name="mytext1"]', "Hello John");
        }
        else{
            console.log("Frame is not available");
        }

    // ========  Approach: 2) using.frameLocator() ========

});

test("Testing inner frame", async ({page}) => {
    await page.goto("https://ui.vision/demo/webtest/frames/");

    const firstFrame = page.frameLocator('[src="frame_1.html"]').locator('[name="mytext1"]');
    await firstFrame.fill("Junior kouří trávu");
    await expect(firstFrame).toHaveValue("Junior kouří trávu");

});

test("inner/child frames demo", async ({page}) => {
    await page.goto("https://ui.vision/demo/webtest/frames/");

    const frame3 = page.frame({url: "https://ui.vision/demo/webtest/frames/frame_3.html"});
    
    if(frame3){
        await frame3.locator('[name="mytext3"]').fill("Welcome");
        const childFrames = frame3.childFrames();
        console.log("Child frame inside frame3", childFrames.length);
        const radio = childFrames[0].getByLabel("I am a human");
        await radio.check();
        await expect(radio).toBeChecked();

    }

    else{
        console.log("Frame is not found");
    }



})