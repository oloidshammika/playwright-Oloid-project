import { Locator, Page } from "@playwright/test";
import { config } from "dotenv";
config(); // Load .env variables

export class LandingPage {
  readonly page: Page;
  readonly signupLoginLink: Locator;
  readonly nameTextbox: Locator;
  readonly emailTextbox: Locator;
  readonly signupButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signupLoginLink = page.getByRole("link", { name: " Signup / Login" });
    this.nameTextbox = page.getByRole("textbox", { name: "Name" });
    this.emailTextbox = page
      .locator("form")
      .filter({ hasText: "Signup" })
      .getByPlaceholder("Email Address");
    this.signupButton = page.getByRole("button", { name: "Signup" });
  }

  async goTo() {
    //await this.page.goto(process.env.BASE_URL);
    await this.page.goto(
      process.env.BASE_URL || "https://www.automationexercise.com/"
    );
  }

  async performSignup(name: string, email: string) {
    await this.signupLoginLink.click();
    await this.nameTextbox.fill(name);
    await this.emailTextbox.fill(email);
    await this.signupButton.click();
  }
}
