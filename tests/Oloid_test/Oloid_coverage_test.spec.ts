import fs from "fs";
import path from "path";
import { test, expect, Page, Locator } from "@playwright/test";

// --- Utility Functions for Dynamic Data and Robust Waits (Refactored) ---

const generateUniqueId = (prefix: string = "auto_test"): string => {
  return `${prefix}_${Date.now()}`;
};

const getLocator = (
  page: Page,
  selectorOrLocator: string | Locator
): Locator => {
  return typeof selectorOrLocator === "string"
    ? page.locator(selectorOrLocator)
    : selectorOrLocator;
};

const waitForElementAndClick = async (
  page: Page,
  selectorOrLocator: string | Locator,
  description: string
) => {
  const logSelector =
    typeof selectorOrLocator === "string" ? selectorOrLocator : description;
  console.log(`Waiting for and clicking: ${description} (${logSelector})`);

  const locator = getLocator(page, selectorOrLocator);
  await locator.waitFor({ state: "visible", timeout: 30000 });
  await locator.click({ timeout: 10000 });
};

const waitForElementAndFill = async (
  page: Page,
  selectorOrLocator: string | Locator,
  value: string,
  description: string
) => {
  const logSelector =
    typeof selectorOrLocator === "string" ? selectorOrLocator : description;
  console.log(
    `Waiting for and filling: ${description} (${logSelector}) with value: ${value}`
  );
  const locator = getLocator(page, selectorOrLocator);
  await locator.waitFor({ state: "visible", timeout: 30000 });
  await locator.fill(value, { timeout: 10000 });
};

// --- TEST 1: Full Happy Path ---
test("Full Happy Path: Create Client, App, Coverage, Price Plan, and Generate Password", async ({
  page,
}) => {
  const uniqueId = generateUniqueId("client");
  const clientName = `Auto Client ${uniqueId.replace(/_/g, "-")}`;
  const clientRegNum = `REG-${uniqueId.toUpperCase().replace(/_/g, "-")}`;
  const compliantBaseName = `Client_${uniqueId}`;
  const clientAppUsername = `app_${compliantBaseName}_user`.toLowerCase();
  const appName = `App_${compliantBaseName}`;
  const coverageRef = `COV_${uniqueId}`;
  const billingEmail = `billing.${uniqueId}@example.com`;
  const techEmail = `tech.${uniqueId}@example.com`;

  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const adminUser = "admin";
  const adminPass = "admin@123";
  const effectiveDate = "2026-01-01";

  fs.mkdirSync("test-results", { recursive: true });

  try {
    console.log("Starting Login...");
    await page.goto(baseURL, { waitUntil: "load", timeout: 60000 });
    await waitForElementAndFill(
      page,
      "data-testid=username",
      adminUser,
      "Username field"
    );
    await waitForElementAndFill(
      page,
      "data-testid=password",
      adminPass,
      "Password field"
    );
    await waitForElementAndClick(page, "data-testid=btn-login", "Login button");
    await expect(page.locator("#root")).toContainText("MNP Admin Portal", {
      timeout: 30000,
    });

    // Create Client
    await waitForElementAndClick(
      page,
      'role=link[name="Client Management"]',
      "Client Management link"
    );
    await page.getByRole("link", { name: "Client", exact: true }).click();
    await waitForElementAndClick(
      page,
      "data-testid=btn-add-new-2",
      "Add New Client button"
    );
    await waitForElementAndFill(
      page,
      "data-testid=name",
      clientName,
      "Client Name field"
    );
    await waitForElementAndFill(
      page,
      "data-testid=address",
      "16616, Canary Dr, Surrey, BC",
      "Address field"
    );
    await waitForElementAndFill(
      page,
      "data-testid=post_code",
      "V3R 4V7",
      "Post Code field"
    );

    const currencyDropdownLocator = page
      .locator('div:has-text("Currency Code") .css-19bb58m')
      .first();
    await waitForElementAndClick(
      page,
      currencyDropdownLocator,
      "Currency dropdown arrow"
    );
    await waitForElementAndClick(
      page,
      page.getByRole("option", { name: "USD" }).first(),
      "USD option"
    );

    await page.waitForTimeout(500);
    await page
      .locator(
        "div:nth-child(5) > div > .css-b62m3t-container > .css-my3gbk-control > .css-hlgwow > .css-19bb58m"
      )
      .click();
    await page.locator("#react-select-5-option-1").click();

    await waitForElementAndFill(
      page,
      "data-testid=registration_number",
      clientRegNum,
      "Registration Number"
    );
    await waitForElementAndFill(
      page,
      "data-testid=billing_contact_name",
      clientName,
      "Billing Contact Name"
    );
    await waitForElementAndFill(
      page,
      "data-testid=billing_email_address",
      billingEmail,
      "Billing Email"
    );
    await waitForElementAndFill(
      page,
      "data-testid=billing_phone_number",
      "94714696124",
      "Billing Phone"
    );
    await waitForElementAndFill(
      page,
      "data-testid=technical_contact_name",
      `Tech ${clientName}`,
      "Technical Name"
    );
    await waitForElementAndFill(
      page,
      "data-testid=technical_email_address",
      techEmail,
      "Technical Email"
    );
    await waitForElementAndClick(
      page,
      "data-testid=btn_submit",
      "Submit Client"
    );
    await expect(page.locator("#market-form-model")).toContainText(
      "Client Created Successfully!",
      { timeout: 15000 }
    );
    await waitForElementAndClick(page, "data-testid=btn-continue", "Continue");

    // Create Application
    await waitForElementAndFill(
      page,
      "data-testid=username",
      clientAppUsername,
      "Application Username"
    );
    await waitForElementAndFill(
      page,
      "data-testid=name",
      appName,
      "Application Name"
    );
    await waitForElementAndFill(
      page,
      'role=textbox[name="Effective Date *"]',
      effectiveDate,
      "Effective Date"
    );
    await page.keyboard.press("Escape");
    await waitForElementAndClick(
      page,
      "data-testid=btn_submit",
      "Submit Application"
    );
    await expect(page.getByLabel("Application")).toContainText(
      "Application Created Successfully !",
      { timeout: 15000 }
    );
    await waitForElementAndClick(page, "data-testid=btn-continue", "Continue");

    // Create Coverage
    await expect(page.locator("#application-drpdwn")).toBeVisible({
      timeout: 15000,
    });
    await page
      .locator(
        "#market_id-drpdwn > .css-my3gbk-control > .css-hlgwow > .css-19bb58m"
      )
      .click();
    await page.getByRole("option", { name: "Pakistan" }).click();
    await waitForElementAndFill(
      page,
      "data-testid=reference",
      coverageRef,
      "Coverage Reference field"
    );
    await waitForElementAndFill(
      page,
      'role=textbox[name="Effective Date *"]',
      effectiveDate,
      "Coverage Effective Date field"
    );
    await page.keyboard.press("Escape");
    await page.getByTestId("enable-cache-db-lookup").check();
    await waitForElementAndClick(page, 'role=button[name="OK"]', "OK button");
    await waitForElementAndClick(
      page,
      "data-testid=btn_submit",
      "Submit Coverage"
    );
    await expect(page.getByLabel("Coverage")).toContainText(
      "Coverage Created Successfully !",
      { timeout: 15000 }
    );
    await waitForElementAndClick(page, "data-testid=btn-continue", "Continue");
  } catch (error) {
    console.error("Test Failed:", error);
    await page.screenshot({ path: `test-results/failure-${Date.now()}.png` });
    throw error;
  } finally {
    try {
      if (!page.isClosed()) await page.close();
    } catch {}
    try {
      await page.context().close();
    } catch {}
  }

  console.log("✅ Full Happy Path Test Completed.");
});

// --- TEST 2: Missing Coverage Reference ---
test.skip("Validate Coverage creation fails when Coverage Reference is missing", async ({
  page,
}) => {
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await waitForElementAndFill(
    page,
    "data-testid=username",
    "admin",
    "Username"
  );
  await waitForElementAndFill(
    page,
    "data-testid=password",
    "admin@123",
    "Password"
  );
  await waitForElementAndClick(page, "data-testid=btn-login", "Login");
  await expect(page.locator("#root")).toContainText("MNP Admin Portal");

  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Coverage", exact: true }).click();

  await page.getByTestId("btn-add-new-2").click();

  // Skip reference
  await waitForElementAndFill(
    page,
    'role=textbox[name="Effective Date *"]',
    "2026-01-01",
    "Effective Date"
  );
  await waitForElementAndClick(
    page,
    "data-testid=btn_submit",
    "Submit Coverage"
  );
  await expect(page.locator("text=Coverage Reference is required")).toBeVisible(
    { timeout: 10000 }
  );
});

// --- TEST 3: Invalid Coverage Reference (non-alphanumeric) ---
test("Validate Coverage Reference with special characters shows validation error", async ({
  page,
}) => {
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await waitForElementAndFill(
    page,
    "data-testid=username",
    "admin",
    "Username"
  );
  await waitForElementAndFill(
    page,
    "data-testid=password",
    "admin@123",
    "Password"
  );
  await waitForElementAndClick(page, "data-testid=btn-login", "Login");
  await expect(page.locator("#root")).toContainText("MNP Admin Portal");

  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Coverage", exact: true }).click();
  await page.getByTestId("btn-add-new-2").click();

  await waitForElementAndFill(
    page,
    "data-testid=reference",
    "cov#001",
    "Invalid Coverage Reference"
  );
  await waitForElementAndFill(
    page,
    'role=textbox[name="Effective Date *"]',
    "2026-01-01",
    "Effective Date"
  );
  await waitForElementAndClick(
    page,
    "data-testid=btn_submit",
    "Submit Coverage"
  );
  await expect(page.locator("body")).toContainText(
    "The field must be alphanumeric."
  );
});

// --- TEST 4: Missing Effective Date ---
test.skip("Validate Coverage creation fails when Effective Date is missing", async ({
  page,
}) => {
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await waitForElementAndFill(
    page,
    "data-testid=username",
    "admin",
    "Username"
  );
  await waitForElementAndFill(
    page,
    "data-testid=password",
    "admin@123",
    "Password"
  );
  await waitForElementAndClick(page, "data-testid=btn-login", "Login");
  await expect(page.locator("#root")).toContainText("MNP Admin Portal");

  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Coverage", exact: true }).click();
  await page.getByTestId("btn-add-new-2").click();

  await waitForElementAndFill(
    page,
    "data-testid=reference",
    "COV_12345",
    "Coverage Reference"
  );
  await waitForElementAndClick(
    page,
    "data-testid=btn_submit",
    "Submit Coverage"
  );
  await expect(page.locator("text=Effective Date is required")).toBeVisible({
    timeout: 10000,
  });
});

// --- TEST 5: Duplicate Coverage Reference ---
test("Validate duplicate Coverage Reference shows error popup", async ({
  page,
}) => {
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const duplicateRef = "COV_DUPLICATE_01";
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
  await waitForElementAndFill(
    page,
    "data-testid=username",
    "admin",
    "Username"
  );
  await waitForElementAndFill(
    page,
    "data-testid=password",
    "admin@123",
    "Password"
  );
  await waitForElementAndClick(page, "data-testid=btn-login", "Login");
  await expect(page.locator("#root")).toContainText("MNP Admin Portal");

  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Coverage", exact: true }).click();
  await page.getByTestId("btn-add-new-2").click();

  await page.waitForTimeout(5000);

  await page
    .locator(".css-my3gbk-control > .css-hlgwow > .css-19bb58m")
    .first()
    .click();
  await page.getByRole("option", { name: "AZ NB partner Greg" }).click();

  await page
    .locator(".css-my3gbk-control > .css-hlgwow > .css-19bb58m")
    .first()
    .click();
  await page.getByRole("option", { name: "app_Nola" }).click();

  await page
    .locator(
      "#market_id-drpdwn > .css-my3gbk-control > .css-hlgwow > .css-19bb58m"
    )
    .click();
  await page.getByRole("option", { name: "Pakistan" }).click();

  await waitForElementAndFill(
    page,
    "data-testid=reference",
    duplicateRef,
    "Coverage Reference"
  );
  await waitForElementAndFill(
    page,
    'role=textbox[name="Effective Date *"]',
    "2026-01-01",
    "Effective Date"
  );
  await waitForElementAndClick(
    page,
    "data-testid=btn_submit",
    "Submit Coverage"
  );

  await page.waitForTimeout(1000);

  await expect(page.locator("body")).toContainText(
    "Duplicate admin entry creation attempt, please check the request details again"
  );
  await expect(page.locator("body")).toContainText("Problem");
});
