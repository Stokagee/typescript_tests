import { test, expect, Locator } from '@playwright/test'
import { faker } from '@faker-js/faker'

test("E2E flow foe form", async ({page}) => {
    const firstName: string = faker.person.firstName();
    const lastName: string = faker.person.lastName();
    const phone: string = faker.string.numeric(9);
    const email: string = faker.internet.email();
    const genders = ['male', 'female', 'other'] as const
    const genderLabel = { male: 'Muž', female: 'Žena', other: 'Jiné'} as const
    const chosenGender = faker.helpers.arrayElement(genders);
    const chosenGenderLabel = genderLabel[chosenGender];
    const instructions: string = faker.lorem.sentences(3);

    const inputFirstName: Locator = page.getByTestId("firstName-input");
    const inputLastName: Locator = page.getByTestId("lastName-input")
    const inputPhoneNumber: Locator = page.getByTestId("phone-input");
    const inputEmail: Locator = page.getByTestId("email-input");
    const buttonGender: Locator = page.getByTestId("genderPicker")
    const inputInstructions: Locator = page.getByTestId("instructions-textarea");
    const buttonSubmit: Locator = page.getByTestId("submitButton");
    const gendersList: Locator = page.getByTestId("genderPicker-options-list");
    const genderModal: Locator = page.getByTestId(`gender-option-${chosenGender}`);
    const listAfterPick: Locator = page.getByTestId("genderPicker-text");

    await page.goto("/")
    await expect(inputFirstName).toBeVisible();
    await expect(inputFirstName).toBeEnabled();
    await inputFirstName.fill(firstName);
    await expect(inputFirstName).toHaveValue(firstName);

    await expect(inputLastName).toBeVisible();
    await expect(inputLastName).toBeEditable();
    await inputLastName.fill(lastName);
    await expect(inputLastName).toHaveValue(lastName);

    await expect(inputPhoneNumber).toBeVisible();
    await expect(inputPhoneNumber).toBeEditable();
    await inputPhoneNumber.fill(phone);
    await expect(inputPhoneNumber).toHaveValue(phone);

    await expect(inputEmail).toBeVisible();
    await expect(inputEmail).toBeEditable();
    await inputEmail.fill(email);
    await expect(inputEmail).toHaveValue(email);

    await expect(buttonGender).toBeVisible()
    await buttonGender.click();
    await expect(gendersList).toBeVisible();
    await expect(genderModal).toBeVisible();
    await genderModal.click();
    await expect(listAfterPick).toHaveText(chosenGenderLabel);

    await expect(inputInstructions).toBeEditable();
    await inputInstructions.fill(instructions);
    await expect(inputInstructions).toHaveValue(instructions);

    await buttonSubmit.click();

})