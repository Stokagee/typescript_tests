import { test, expect, Locator } from '@playwright/test'

test("Filter the table by a search term and verify", async ({page}) => {
    await page.goto("https://datatables.net/");

    const dataTable = page.locator("#example_wrapper");
    const searchInput: Locator = dataTable.locator("input[type='search']")
    const searchInputByRole: Locator = dataTable.getByRole("searchbox")
    const infoText: Locator = dataTable.locator("#example_info");
    const rows =await dataTable.locator("tbody tr").all();
    
    await searchInput.fill("Paul Byrd");

    if(rows.length>=1)
    {   
        let matchFound = false;
        for(let row of rows)
        {
            const text = await row.innerText();
            if(text.includes("Paul Byrd"))
            {   
                console.log("Record exist - found")
                matchFound = true;
                break;
            }
        }
        expect(matchFound).toBe(true);
        expect(matchFound).toBeTruthy();
        
    }
    else{
        console.log("No rows found with search text")
    }
})