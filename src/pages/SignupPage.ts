import { Page } from "@playwright/test";

export class SignupPage {
  constructor(private page: Page) {}

  async navigateToPage() {
    await this.page.goto("https://www.automationexercise.com");
    await this.page.getByRole("link", { name: " Signup / Login" }).click();
  }

  async enterSignUpDetails(email: string) {
    await this.page.getByRole("textbox", { name: "Name" }).click();
    await this.page.getByRole("textbox", { name: "Name" }).fill("dias");
    await this.page
      .locator("form")
      .filter({ hasText: "Signup" })
      .getByPlaceholder("Email Address")
      .click();
    await this.page
      .locator("form")
      .filter({ hasText: "Signup" })
      .getByPlaceholder("Email Address")
      .fill(email);
    await this.page.getByRole("button", { name: "Signup" }).click();
  }
}
