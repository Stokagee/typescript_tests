import { test, expect, Locator } from '@playwright/test'
import { faker, } from '@faker-js/faker'

test("Tetsing with playwright action", async ({page}) => {
    const name: string = faker.person.firstName();
    const lastName: string = faker.person.lastName();
    const email: string = faker.internet.email();
    const phone: string = faker.phone.number();
    await page.goto("/");
    const inputName: Locator = page.locator('[data-testid="firstName-input"]');
    await expect(inputName).toBeVisible();
    await expect(inputName).toBeEnabled();
    await inputName.fill(name);
    await expect(inputName).toHaveValue(name);
    const rows: string | null = await inputName.getAttribute('rows');
    expect(rows).toBe('1');
    const inputValueForVerify: string = await inputName.inputValue();
    expect(inputValueForVerify).toBe(name);
});

test("Tetsing with playwright checking", async ({page}) => {
    const name: string = faker.person.firstName();
    const lastName: string = faker.person.lastName();
    const email: string = faker.internet.email();
    const phone: string = faker.phone.number();
    await page.goto("/");
    const seznamPage: Locator = page.getByTestId('menu-item-Page2');
    await seznamPage.click();
    const check: Locator = page.getByTestId('list-item-1-checkbox');

    await expect(check).toBeVisible();
    await expect(check).toBeEnabled();
    expect(await check.isChecked()).toBe(false);
    await check.check();
    expect(await check.isChecked()).toBe(true);   // better 
    await expect(check).toBeChecked();
});

test("Testing chechking all check", async ({page}) => {
    page.goto("/");
    const seznamPage: Locator = page.getByTestId('menu-item-Page2');
    await seznamPage.click();
    const che: Locator[] = await page.getByRole('checkbox').all();
    for(const checkbox of che) {
        await expect(checkbox).toBeVisible();
        await expect(checkbox).toBeEnabled();
        await expect(checkbox).not.toBeChecked();
        await checkbox.check();
        await expect(checkbox).toBeChecked();
    };

});

test("Testing random chose checkboxes", async ({page}) => {
    page.goto("/");
    
    const seznamPage: Locator = page.getByTestId('menu-item-Page2');
    await seznamPage.click();

    const allcheckboxes: Locator = page.getByRole('checkbox')
    const randomChekboxes: number[] = [2, 4, 7]

    for(const index of randomChekboxes) {
        await allcheckboxes.nth(index).check();
    }
})

