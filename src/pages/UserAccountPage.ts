import { Locator, Page, expect } from "@playwright/test";

export class UserAccountPage {
  readonly page: Page;
  readonly accountCreatedText: Locator;
  readonly continueLink: Locator;
  readonly colSm4: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountCreatedText = page.locator("b");
    this.continueLink = page.getByRole("link", { name: "Continue" });
    this.colSm4 = page.locator(".col-sm-4");
  }

  async verifyAccountCreation() {
    await expect(this.accountCreatedText).toContainText("Account Created!");
    await expect(this.continueLink).toBeVisible();
    await expect(this.colSm4).toBeVisible();
    await this.continueLink.click();
  }
}
