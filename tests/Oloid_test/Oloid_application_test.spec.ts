import fs from "fs";
import path from "path";
import { test, expect, Page, Locator } from "@playwright/test";

// --- Utility Functions ---
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
  console.log(`Filling: ${description} (${logSelector}) with value: ${value}`);
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
  const billingEmail = `billing.${uniqueId}@example.com`;
  const techEmail = `tech.${uniqueId}@example.com`;

  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const adminUser = "admin";
  const adminPass = "admin@123";
  const effectiveDate = "2026-01-01";

  fs.mkdirSync("test-results", { recursive: true });

  try {
    // LOGIN
    await page.goto(baseURL, { waitUntil: "domcontentloaded", timeout: 60000 });
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

    // CLIENT CREATION
    await waitForElementAndClick(
      page,
      'role=link[name="Client Management"]',
      "Client Management link"
    );
    await page.getByRole("link", { name: "Client", exact: true }).click();
    await waitForElementAndClick(
      page,
      "data-testid=btn-add-new-2",
      "Add New Client"
    );

    await waitForElementAndFill(
      page,
      "data-testid=name",
      clientName,
      "Client Name"
    );
    await waitForElementAndFill(
      page,
      "data-testid=address",
      "16616, Canary Dr, Surrey, BC",
      "Address"
    );
    await waitForElementAndFill(
      page,
      "data-testid=post_code",
      "V3R 4V7",
      "Post Code"
    );

    page.waitForTimeout(500);

    const currencyDropdown = page
      .locator('div:has-text("Currency Code") .css-19bb58m')
      .first();
    await waitForElementAndClick(page, currencyDropdown, "Currency dropdown");
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
      {
        timeout: 15000,
      }
    );
    await waitForElementAndClick(
      page,
      "data-testid=btn-continue",
      "Continue after client creation"
    );

    // APPLICATION CREATION
    await waitForElementAndFill(
      page,
      "data-testid=username",
      clientAppUsername,
      "App Username"
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
      {
        timeout: 15000,
      }
    );
    await waitForElementAndClick(
      page,
      "data-testid=btn-continue",
      "Continue after app creation"
    );
  } catch (error) {
    console.error("❌ Test Failed:", error);
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
});

// --- TEST 2: Duplicate Application Name Validation ---
test("Validate duplicate Application Name shows error popup", async ({
  page,
}) => {
  const uniqueId = generateUniqueId("duplicate_app");
  const compliantBaseName = `Client_${uniqueId}`;
  const appName = `App_${compliantBaseName}`;
  const clientAppUsername = `user_${uniqueId}`;
  const effectiveDate = "2026-01-01";

  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const adminUser = "admin";
  const adminPass = "admin@123";

  // Login
  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
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
  await expect(page.locator("#root")).toContainText("MNP Admin Portal");

  // Go to Application Creation page directly
  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Application" }).click();

  await page.getByTestId("btn-add-new-2").click();

  // --- Create first application ---

  // Click the dropdown container to focus and open it
  await page.waitForTimeout(5000);
  await page
    .locator(
      "#client-drpdwn > .css-13cymwt-control > .css-hlgwow > .css-19bb58m"
    )
    .click();

  // Type "test" into the hidden React Select input
  await page.locator("#react-select-4-input").fill("test");
  await page.locator("#react-select-4-input").press("Enter");

  await waitForElementAndFill(
    page,
    "data-testid=username",
    clientAppUsername,
    "Username field"
  );
  await waitForElementAndFill(
    page,
    "data-testid=name",
    appName,
    "Application Name field"
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
  await expect(
    page.locator("text=Application Created Successfully")
  ).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: "Continue on Application" }).click();

  page.waitForTimeout(2000);

  // --- Try creating the same application again (duplicate) ---
  // Go to Application Creation page directly
  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Application" }).click();

  await page.getByTestId("btn-add-new-2").click();

  // --- Create second application ---

  await page.waitForTimeout(5000);
  await page
    .locator(
      "#client-drpdwn > .css-13cymwt-control > .css-hlgwow > .css-19bb58m"
    )
    .click();

  await page.getByRole("option", { name: "AZ NB partner Greg" }).click();

  await waitForElementAndFill(
    page,
    "data-testid=username",
    clientAppUsername,
    "Username field"
  );
  await waitForElementAndFill(
    page,
    "data-testid=name",
    appName,
    "Duplicate Application Name"
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
    "Submit Duplicate Application"
  );

  // --- Expect error popup ---
  await page.getByText("Duplicate admin entry").click();
  await expect(page.locator("body")).toContainText(
    "Duplicate admin entry creation attempt, please check the request details again"
  );
  await expect(page.getByText("Problem")).toBeVisible();
});

// --- TEST 3: Username with hyphen shows alphanumeric error ---
test("Validate username with hyphen triggers alphanumeric error", async ({
  page,
}) => {
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const adminUser = "admin";
  const adminPass = "admin@123";

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
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

  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Application" }).click();
  await page.getByTestId("btn-add-new-2").click();

  await page.waitForTimeout(5000);
  await page
    .locator(
      "#client-drpdwn > .css-13cymwt-control > .css-hlgwow > .css-19bb58m"
    )
    .click();

  await page.getByRole("option", { name: "AZ NB partner Greg" }).click();

  await waitForElementAndFill(
    page,
    'role=textbox[name="Effective Date *"]',
    "2026-01-01",
    "Effective Date"
  );

  await waitForElementAndFill(
    page,
    "data-testid=name",
    "ValidApp",
    "App Username"
  );

  await waitForElementAndFill(
    page,
    "data-testid=username",
    "auto-app-username",
    "Invalid Username field"
  );

  await page.keyboard.press("Escape");

  await waitForElementAndClick(
    page,
    "data-testid=btn_submit",
    "Save Application"
  );

  await page.waitForTimeout(1000);
  await expect(page.locator("body")).toContainText(
    "Request parameter 'username' contains unsupported characters. Only alphanumeric with underscores are allowed"
  );
  await expect(page.getByText("Problem")).toBeVisible();
});

// --- TEST 4: Username with special character triggers alphanumeric error ---
test("Validate username with special character triggers alphanumeric error", async ({
  page,
}) => {
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const adminUser = "admin";
  const adminPass = "admin@123";

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
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

  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Application" }).click();
  await page.getByTestId("btn-add-new-2").click();

  await page.waitForTimeout(5000);
  await page
    .locator(
      "#client-drpdwn > .css-13cymwt-control > .css-hlgwow > .css-19bb58m"
    )
    .click();

  await page.getByRole("option", { name: "AZ NB partner Greg" }).click();

  await waitForElementAndFill(
    page,
    'role=textbox[name="Effective Date *"]',
    "2026-01-01",
    "Effective Date"
  );

  await waitForElementAndFill(
    page,
    "data-testid=name",
    "ValidApp",
    "App Username"
  );

  await waitForElementAndFill(
    page,
    "data-testid=username",
    "auto@$app*username",
    "Invalid Username field"
  );

  await page.keyboard.press("Escape");

  await waitForElementAndClick(
    page,
    "data-testid=btn_submit",
    "Save Application"
  );
  await page.waitForTimeout(1000);
  await expect(page.locator("body")).toContainText(
    "Request parameter 'username' contains unsupported characters. Only alphanumeric with underscores are allowed"
  );
  await expect(page.getByText("Problem")).toBeVisible();
});

// --- TEST 5: Application Name with space triggers alphanumeric error ---
test("Validate Application Name with space triggers alphanumeric error", async ({
  page,
}) => {
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const adminUser = "admin";
  const adminPass = "admin@123";

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
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

  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Application" }).click();
  await page.getByTestId("btn-add-new-2").click();

  await page.waitForTimeout(5000);
  await page
    .locator(
      "#client-drpdwn > .css-13cymwt-control > .css-hlgwow > .css-19bb58m"
    )
    .click();

  await page.getByRole("option", { name: "AZ NB partner Greg" }).click();

  await waitForElementAndFill(
    page,
    'role=textbox[name="Effective Date *"]',
    "2026-01-01",
    "Effective Date"
  );

  await waitForElementAndFill(
    page,
    "data-testid=name",
    "Invalid-App",
    "App Username"
  );

  await waitForElementAndFill(
    page,
    "data-testid=username",
    "autoUsername4545",
    "Invalid Username field"
  );

  await page.keyboard.press("Escape");

  await waitForElementAndClick(
    page,
    "data-testid=btn_submit",
    "Save Application"
  );
  await page.waitForTimeout(1000);
  await expect(page.locator("body")).toContainText(
    "Request parameter 'username' contains unsupported characters. Only alphanumeric with underscores are allowed"
  );
  await expect(page.getByText("Problem")).toBeVisible();
});

// --- TEST 6: Application Name with dash triggers alphanumeric error ---
test("Validate Application Name with dash triggers alphanumeric error", async ({
  page,
}) => {
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const adminUser = "admin";
  const adminPass = "admin@123";

  await page.goto(baseURL, { waitUntil: "domcontentloaded" });
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

  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Application" }).click();
  await page.getByTestId("btn-add-new-2").click();

  await page.waitForTimeout(5000);
  await page
    .locator(
      "#client-drpdwn > .css-13cymwt-control > .css-hlgwow > .css-19bb58m"
    )
    .click();

  await page.getByRole("option", { name: "AZ NB partner Greg" }).click();

  await waitForElementAndFill(
    page,
    'role=textbox[name="Effective Date *"]',
    "2026-01-01",
    "Effective Date"
  );

  await waitForElementAndFill(
    page,
    "data-testid=name",
    "Invalid*7345@$App",
    "App Username"
  );

  await waitForElementAndFill(
    page,
    "data-testid=username",
    "aAppUsername41417",
    "Invalid Username field"
  );

  await page.keyboard.press("Escape");

  await waitForElementAndClick(
    page,
    "data-testid=btn_submit",
    "Save Application"
  );
  await page.waitForTimeout(1000);
  await expect(page.locator("body")).toContainText(
    "Request parameter 'username' contains unsupported characters. Only alphanumeric with underscores are allowed"
  );
  await expect(page.getByText("Problem")).toBeVisible();
});
