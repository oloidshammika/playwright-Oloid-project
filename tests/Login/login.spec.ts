import { test, expect, Browser } from "@playwright/test";

const BASE_URL =
  "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com";

const MAX_RETRIES = 2;
test.setTimeout(60000);

async function performLogin(page, username: string, password: string) {
  await page.getByPlaceholder("Username").fill(username);
  await page.getByPlaceholder("Password").fill(password);

  await Promise.all([
    // page.waitForNavigation({ waitUntil: "networkidle", timeout: 30000 }),
    page.waitForTimeout(30000),
    page.getByRole("button", { name: "Login" }).click(),
  ]);
}

test.describe("Login Functionality Tests", () => {
  let browser: Browser;

  test.beforeAll(async ({ browser: playwrightBrowser }) => {
    browser = playwrightBrowser;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
  });

  test.afterAll(async () => {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error("Error closing browser:", error);
      }
    }
  });

  test("Successful login with valid credentials", async ({ page }) => {
    await performLogin(page, "admin", "admin@123");

    await page
      .getByRole("listitem")
      .filter({ hasText: "Welcome , adminLogout" })
      .getByRole("button")
      .click();
    await expect(page.getByRole("heading")).toContainText("Welcome , admin");

    await page.getByRole("link", { name: "Logout" }).click();
    await expect(page.getByRole("heading")).toContainText("Login");
  });

  test("Login with incorrect password", async ({ page }) => {
    await performLogin(page, "admin", "user@123");
    await expect(page.getByTestId("error-message")).toContainText(
      "User unauthorized."
    );
    await expect(page).toHaveURL(/.*login/);
  });

  test.skip("Login with empty username", async ({ page }) => {
    await performLogin(page, "", "admin@123");

    await expect(page).toHaveURL(/.*login/);
  });

  test.skip("Login with empty password", async ({ page }) => {
    await performLogin(page, "admin", "");

    await expect(page).toHaveURL(/.*login/);
  });

  test("Login with invalid username format", async ({ page }) => {
    await performLogin(page, "invalid@username", "admin@123");
    await expect(page.getByTestId("error-message")).toContainText(
      "User unauthorized."
    );
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login with SQL injection attempt", async ({ page }) => {
    await performLogin(page, "' OR '1'='1", "' OR '1'='1");
    await expect(page.getByTestId("error-message")).toContainText(
      "User unauthorized."
    );
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login with maximum length username", async ({ page }) => {
    const longUsername = "a".repeat(255);
    await performLogin(page, longUsername, "admin@123");
    await expect(page.getByTestId("error-message")).toContainText(
      "User unauthorized."
    );
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login with special characters in password", async ({ page }) => {
    await performLogin(page, "admin", "!@#$%^&*()_+");
    await expect(page.getByTestId("error-message")).toContainText(
      "User unauthorized."
    );
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login page load timeout", async ({ page }) => {
    await page.route("**/login", (route) => {
      setTimeout(() => route.continue(), 60000);
    });

    try {
      await page.goto(`${BASE_URL}/login`, { timeout: 30000 });
      throw new Error("Page should have timed out");
    } catch (error) {
      expect(error.message).toContain("Timeout");
    }
  });

  test("Concurrent login attempts", async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await Promise.all([
      page1.goto(`${BASE_URL}/login`, {
        waitUntil: "networkidle",
        timeout: 30000,
      }),
      page2.goto(`${BASE_URL}/login`, {
        waitUntil: "networkidle",
        timeout: 30000,
      }),
    ]);

    await Promise.all([
      performLogin(page1, "admin", "admin@123"),
      performLogin(page2, "admin", "admin@123"),
    ]);

    await context1.close();
    await context2.close();
  });
});
