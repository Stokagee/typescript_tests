import {test, expect, Locator} from "@playwright/test"
import { faker, Faker } from "@faker-js/faker";
test("Tetsing css", async ({page}) => {
    await page.goto("/")
    const searchbox: Locator = page.locator("input#firstName");
    const name: string = faker.person.firstName()
    await searchbox.fill(name);
    await expect(searchbox).toHaveValue(name);

    const lastname: string = faker.person.lastName();
    const taginput: Locator = page.locator("input[aria-placeholder='Zadejte jméno']");

    await taginput.fill(lastname);

    const multiclass: Locator = page.locator("input.css-textinput-11aywtz[aria-label='Zadejte jméno']");
    await multiclass.fill(name);

})