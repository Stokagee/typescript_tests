import { test, expect, Locator } from '@playwright/test'
import { text } from 'node:stream/consumers';

test("Testing extracting text", async ({page}) => {
    await page.goto("https://demowebshop.tricentis.com/")

    const productItem: Locator = page.locator(".product-item");

    // 1) innerText() vs textContent()

    // const itemForVerify: Locator = page.locator('[data-productid="2"]');
    // console.log(await itemForVerify.textContent());
    // console.log(await itemForVerify.innerText());
    // const countOfProduct: number = await productItem.count();
    // for(let i=0; i<countOfProduct; i++){
        // const productName:string = await productItem.nth(i).innerText();   // vrací vždy string a tím pádem, pokud nemá text element, tak spadne
        // console.log("This is:=====>", productName);
        // const productName:string | null = await productItem.nth(i).textContent();   // vrací vždy string a tím pádem, pokud nemá text element, tak spadne
        // console.log("This is:=====>", productName);
        // const productName:string | null = await productItem.nth(i).textContent();   // vrací vždy string a tím pádem, pokud nemá text element, tak spadne
        // console.log("This is:=====>", productName?.trim());
    // }



    // 2) allInerText() vs allTextContent()

    // const alltext:string[] = await productItem.allInnerTexts();
    // console.log("text====>", alltext)

    // const allText:string[] = await productItem.allTextContents();
    // console.log("All text ===>", allText);

    // const productNamesTrimmed: string[] = allText.map(text=>text.trim());
    // console.log("All Trimmed ====>", productNamesTrimmed);



    // 3) all () - konvertuje lokátory na array locátorů 

    const productsLocators: Locator[] = await productItem.all()
    // console.log(productsLocators)
    // console.log(await productsLocators[1].innerText());

    // for(let text of productsLocators)
    // {
    //     console.log(await text.innerText());
    // }

    // podle indexu za použití for "in"
    for(let text in productsLocators)
    {
        console.log(await productsLocators[text].innerText());
    }

})
