import { test, expect,Locator } from "@playwright/test";
import { faker, Faker } from "@faker-js/faker";


/*  page.getByAltText() to locate an element, usually image, by its text alternative.
    Používá se pro vyhledávání obrázků
*/
test("Testing first UI",async ({ page }) => {
  await page.goto("https://demo.nopcommerce.com/");
  const logo:Locator = page.getByAltText("nopCommerce demo store")
  await expect(logo).toBeVisible();
  await logo.click();
});


// 2. page.getByText() – Najde element podle textu, který obsahuje.
// Můžeš porovnávat podle části textu nebo přesné shody.
// Lokátor podle viditelného textu
// Použij tento lokátor pro neinteraktivní elementy jako div, span, p atd.
// Pro interaktivní elementy jako button, a, input atd. použij role lokátory.
/*
<p>Seznam<p>
<div>Seznam<p>
*/
test("Test Ui by text", async ({page}) => {
  await page.goto("/");
  await expect(page.getByText("Sezn")).toBeVisible();
});

/* 3. page.getByRole() to locate by explicit and implicit accessibility attributes.
- není atribut
Role lokátory zahrnují tlačítka, checkboxy, nadpisy, odkazy, seznamy, tabulky
a mnoho dalšího a řídí se W3C specifikacemi pro ARIA role.
Preferováno pro interaktivní prvky jako tlačítka, checkboxy, odkazy, seznamy, nadpisy, tabulky atd.
*/

test("Test podle role", async ({page}) => {
  await page.goto("/");
  // await page.getByRole("link",{name:'Register'}).click();
  await expect(page.getByRole("heading",{name:'Menu'})).toBeVisible();
})

//  page.getByLabel() to locate a form control by associated label's text.

test("Testing by label",async ({page}) => {
  await page.goto("/");
  await page.getByLabel(/Zadejte jméno/i).fill(faker.person.firstName());
  await page.getByLabel(/Zadejte email/).fill(faker.internet.email());
  await page.getByLabel(/Zadejte telefon/).fill(faker.phone.number());
})

//  page.getByPlaceholder() to locate an input by placeholder.
test("Testing by placeholder",async ({page}) => {
  await page.goto("/")
  await page.getByPlaceholder('Zadejte telefon').fill(faker.phone.number());
  await page.getByPlaceholder('Zadejte email').fill(faker.internet.email());
  await page.getByPlaceholder('Napiš doplňující instrukce…').fill(faker.word.words.toString())
})

//  page.getByTitle() to locate an element by its title attribute.
test("Testing by element",async ({page}) => {
  await page.goto("/");
})


//  page.getByTestId() to locate an element based on its data-testid attribute (other attributes can be configured).
test("Testing by ID",async ({page}) => {
  await page.goto("/");
  await page.getByTestId("firstName-input").fill(faker.person.firstName());
  await page.getByTestId("email-input").fill(faker.internet.email());
  const lastName = faker.person.lastName();
  await page.locator("#lastName").fill(lastName);
  await expect(page.locator("#lastName")).toHaveValue(lastName);
})