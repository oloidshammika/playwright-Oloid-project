import { Locator, Page, expect } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly loggedInAsText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loggedInAsText = page.locator("#header");
  }

  async verifyLogin() {
    await expect(this.loggedInAsText).toContainText("Logged in as Shammika");
    await this.page.close;
  }
}
