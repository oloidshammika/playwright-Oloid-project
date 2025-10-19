import { test as base } from "@playwright/test";
import { LandingPage } from "../pages/LandingPage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { UserAccountPage } from "../pages/UserAccountPage";
import { HomePage } from "../pages/HomePage";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { config } from "dotenv";
config(); // Load .env variables

/**
 * Author: Shammika Dahanayaka
 */
export const test = base.extend<{
  landingPage: LandingPage;
  registrationPage: RegistrationPage;
  userAccountPage: UserAccountPage;
  homePage: HomePage;
  testData: any[];
}>({
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await use(landingPage);
  },
  registrationPage: async ({ page }, use) => {
    const registrationPage = new RegistrationPage(page);
    await use(registrationPage);
  },
  userAccountPage: async ({ page }, use) => {
    const userAccountPage = new UserAccountPage(page);
    await use(userAccountPage);
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  testData: async ({}, use) => {
    const csvData = fs.readFileSync(
      path.join(__dirname, "../../test-data/qa/testdata.csv"),
      "utf-8"
    );
    const records = parse(csvData, {
      columns: true,
      skipEmptyLines: true,
    }) as any[];
    await use(records);
  },
});

export { expect } from "@playwright/test";
