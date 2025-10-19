import { Locator, Page } from "@playwright/test";

export class RegistrationPage {
  readonly page: Page;
  readonly mrRadio: Locator;
  readonly passwordTextbox: Locator;
  readonly daysDropdown: Locator;
  readonly monthsDropdown: Locator;
  readonly yearsDropdown: Locator;
  readonly newsletterCheckbox: Locator;
  readonly firstNameTextbox: Locator;
  readonly lastNameTextbox: Locator;
  readonly companyTextbox: Locator;
  readonly addressTextbox: Locator;
  readonly countryDropdown: Locator;
  readonly stateTextbox: Locator;
  readonly cityZipcodeTextbox: Locator;
  readonly zipcodeTextbox: Locator;
  readonly mobileTextbox: Locator;
  readonly createAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mrRadio = page.getByRole("radio", { name: "Mr." });
    this.passwordTextbox = page.getByRole("textbox", { name: "Password *" });
    this.daysDropdown = page.locator("#days");
    this.monthsDropdown = page.locator("#months");
    this.yearsDropdown = page.locator("#years");
    this.newsletterCheckbox = page.getByRole("checkbox", {
      name: "Sign up for our newsletter!",
    });
    this.firstNameTextbox = page.getByRole("textbox", { name: "First name *" });
    this.lastNameTextbox = page.getByRole("textbox", { name: "Last name *" });
    this.companyTextbox = page.getByRole("textbox", {
      name: "Company",
      exact: true,
    });
    this.addressTextbox = page.getByRole("textbox", {
      name: "Address * (Street address, P.",
    });
    this.countryDropdown = page.getByLabel("Country *");
    this.stateTextbox = page.getByRole("textbox", { name: "State *" });
    this.cityZipcodeTextbox = page.getByRole("textbox", {
      name: "City * Zipcode *",
    });
    this.zipcodeTextbox = page.locator("#zipcode");
    this.mobileTextbox = page.getByRole("textbox", { name: "Mobile Number *" });
    this.createAccountButton = page.getByRole("button", {
      name: "Create Account",
    });
  }

  async fillRegistrationDetails(data: any) {
    await this.mrRadio.check();
    await this.passwordTextbox.fill(data.password);
    await this.daysDropdown.selectOption(data.day);
    await this.monthsDropdown.selectOption(data.month);
    await this.yearsDropdown.selectOption(data.year);
    await this.newsletterCheckbox.check();
    await this.firstNameTextbox.fill(data.firstName);
    await this.lastNameTextbox.fill(data.lastName);
    await this.companyTextbox.fill(data.company);
    await this.addressTextbox.fill(data.address);
    await this.countryDropdown.selectOption(data.country);
    await this.stateTextbox.fill(data.state);
    await this.cityZipcodeTextbox.fill(data.city);
    await this.zipcodeTextbox.fill(data.zipcode);
    await this.mobileTextbox.fill(data.mobile);
    await this.createAccountButton.click();
  }
}
