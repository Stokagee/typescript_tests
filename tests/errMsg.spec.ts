import { test, expect, Locator } from "@playwright/test"
import { faker } from "@faker-js/faker"
import path from "path"

test("Chathing err msg from inputs", async ({page}) => {
    page.goto("/");

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
    const buttonForUploadFile: Locator = page.getByTestId("file-uploader-input");
    const modalForAction: Locator = page.getByTestId("formValidationModal-box");
    const modalOKButton: Locator = page.getByTestId("formValidationModal-primary")
    const modalContinueButton: Locator = page.getByTestId("formSuccessModal-primary");
    const modalSuccess: Locator = page.getByTestId("formSuccessModal-box");

    const errMsgFirstName: Locator = page.getByTestId("firstName-input-error");
    const errMsgLastName: Locator = page.getByTestId("lastName-input-error");
    const errMsgPhone: Locator = page.getByTestId("phone-input-error");
    const errMsgEmail: Locator = page.getByTestId("email-input-error");
    const errMsgGender: Locator = page.getByTestId("genderPicker-error");
    const errMsgInstructions: Locator = page.getByTestId("instructions-textarea-error");
    const errMsgFile: Locator = page.getByTestId("selected-file-text");

    buttonSubmit.click();
    await expect(modalForAction).toBeVisible();
    await expect(modalForAction).toContainText("Musíš vyplnit všechna pole");
    await modalOKButton.click();

    inputFirstName.click();
    await expect(errMsgFirstName).toBeVisible();
    await expect(errMsgFirstName).toHaveText("Uveďte své křestní jméno");
    inputFirstName.fill(firstName);
    await expect(errMsgFirstName).toBeHidden();

    inputLastName.click();
    await expect(errMsgLastName).toBeVisible();
    await expect(errMsgLastName).toHaveText("Uveďte své příjmení");
    inputLastName.fill(lastName);
    await expect(errMsgLastName).toBeHidden();

    inputPhoneNumber.click();
    await expect(errMsgPhone).toBeVisible();
    await expect(errMsgPhone).toHaveText("Vyplňtě telefonní číslo");
    inputPhoneNumber.fill(phone);
    await expect(errMsgPhone).toBeHidden();

    inputEmail.click();
    await expect(errMsgEmail).toBeVisible();
    await expect(errMsgEmail).toHaveText("Vyplňte email");
    inputEmail.fill("a");
    await expect(errMsgEmail).toHaveText("Zadejte platnou emailovou adresu");
    inputEmail.fill(email);
    await expect(errMsgEmail).toBeHidden();

    buttonGender.click();
    await page.waitForTimeout(500);
    await page.mouse.click(100, 100);
    await expect(errMsgGender).toBeVisible();
    await expect(errMsgGender).toHaveText("Vyberte pohlaví");
    buttonGender.click();
    await expect(gendersList).toBeVisible();
    await genderModal.click();
    await expect(listAfterPick).toHaveText(chosenGenderLabel);
    await expect(errMsgGender).toBeHidden();

    await buttonForUploadFile.setInputFiles(path.join(__dirname, "test.txt"));
    await expect(errMsgFile).toHaveText("Vybráno: test.txt");

    inputInstructions.fill(instructions);
    await expect(inputInstructions).toHaveText(instructions);

    buttonSubmit.click();
    await expect(modalSuccess).toBeVisible();
    await expect(modalSuccess).toContainText("Formulář byl úspěšně odeslán.");
    modalContinueButton.click();

})