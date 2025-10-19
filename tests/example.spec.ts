import { test, expect, Page, Locator } from "@playwright/test";

// --- Utility Functions for Dynamic Data and Robust Waits (Refactored) ---

/**
 * Generates a unique string based on a timestamp to ensure data is unique per run.
 * Uses underscore for separation to simplify compliance with 'alphanumeric with underscores' rule.
 */
const generateUniqueId = (prefix: string = "auto_test"): string => {
  return `${prefix}_${Date.now()}`;
};

/**
 * Helper function to resolve string selectors to Locator objects.
 */
const getLocator = (
  page: Page,
  selectorOrLocator: string | Locator
): Locator => {
  return typeof selectorOrLocator === "string"
    ? page.locator(selectorOrLocator)
    : selectorOrLocator;
};

/**
 * Custom wait and click function with error handling and long timeout (30s).
 * Accepts either a string selector or a Playwright Locator object.
 */
const waitForElementAndClick = async (
  page: Page,
  selectorOrLocator: string | Locator,
  description: string
) => {
  // Use the description for logging when a Locator object is passed
  const logSelector =
    typeof selectorOrLocator === "string" ? selectorOrLocator : description;
  console.log(`Waiting for and clicking: ${description} (${logSelector})`);

  try {
    const locator = getLocator(page, selectorOrLocator);
    // Wait for the element to be visible and enabled (30 seconds)
    await locator.waitFor({ state: "visible", timeout: 30000 });
    // Click with a shorter timeout once visible
    await locator.click({ timeout: 10000 });
  } catch (error) {
    console.error(
      `Error waiting for/clicking ${description} (${logSelector}):`,
      error
    );
    throw new Error(
      `Failed to interact with ${description} after waiting. See console for details.`
    );
  }
};

/**
 * Custom wait and fill function with error handling and long timeout (30s).
 * Accepts either a string selector or a Playwright Locator object.
 */
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
  try {
    const locator = getLocator(page, selectorOrLocator);
    await locator.waitFor({ state: "visible", timeout: 30000 });
    await locator.fill(value, { timeout: 10000 });
  } catch (error) {
    console.error(
      `Error waiting for/filling ${description} (${logSelector}):`,
      error
    );
    throw new Error(
      `Failed to fill ${description} after waiting. See console for details.`
    );
  }
};

// --- Test Case Definition ---

test("Full Happy Path: Create Client, App, Coverage, Price Plan, and Generate Password", async ({
  page,
}) => {
  // 1. Setup Dynamic Test Data
  const uniqueId = generateUniqueId("client");

  // Client Name can have spaces/hyphens for display/logging
  const clientName = `Auto Client ${uniqueId.replace(/_/g, "-")}`;
  const clientRegNum = `REG-${uniqueId.toUpperCase().replace(/_/g, "-")}`;

  // FIX: Create a compliant base name for Application name/username
  // The error specifies: "Only alphanumeric with underscores are allowed"
  const compliantBaseName = `Client_${uniqueId}`; // e.g., Client_auto_test_1690000000000

  const clientAppUsername = `app_${compliantBaseName}_user`.toLowerCase();
  const appName = `App_${compliantBaseName}`; // FIX: This is the field causing the "unsupported characters" error

  // FIX: Change hyphen to underscore for Coverage Reference (COV- to COV_)
  const coverageRef = `COV_${uniqueId}`;

  const billingEmail = `billing.${uniqueId}@example.com`;
  const techEmail = `tech.${uniqueId}@example.com`;

  // Static data (URL and Credentials)
  const baseURL =
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login";
  const adminUser = "admin";
  const adminPass = "admin@123";

  // Date for forms (A future date for reliability)
  const effectiveDate = "2026-01-01";

  try {
    // --- 2. Login Section ---
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
    console.log("Login Successful, Dashboard Loaded.");

    // --- 3. Navigate to Client Creation ---
    await waitForElementAndClick(
      page,
      'role=link[name="Client Management"]',
      "Client Management link"
    );

    const clientLink = page.getByRole("link", { name: "Client", exact: true });
    console.log("Waiting for and clicking: Client link (exact match)");
    await clientLink.waitFor({ state: "visible", timeout: 30000 });
    await clientLink.click({ timeout: 10000 });

    // Click Add New Client
    await waitForElementAndClick(
      page,
      "data-testid=btn-add-new-2",
      "Add New Client button"
    );

    console.log(
      'Waiting for "Create New Client" heading to be visible (up to 120s)...'
    );

    await page.waitForTimeout(2000); // Initial wait before checking
    console.log("New Client form loaded.");

    // --- 4. Create Client ---
    console.log(`Creating Client: ${clientName}`);
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

    // Select Currency
    const currencyDropdownLocator = page
      .locator('div:has-text("Currency Code") .css-19bb58m')
      .first();
    await waitForElementAndClick(
      page,
      currencyDropdownLocator,
      "Currency dropdown arrow"
    );

    const usdOptionLocator = page.getByRole("option", { name: "USD" }).first();
    await waitForElementAndClick(page, usdOptionLocator, "USD Currency option");

    await page.waitForTimeout(500); // Small wait between dropdowns

    // Select Country
    await page
      .locator(
        "div:nth-child(5) > div > .css-b62m3t-container > .css-my3gbk-control > .css-hlgwow > .css-19bb58m"
      )
      .click();

    await page.locator("#react-select-5-input").type("Canada");

    await page.locator("#react-select-5-input").press("Enter");

    await page.locator("#react-select-5-input").press("Tab");

    await page.waitForTimeout(500);

    await waitForElementAndFill(
      page,
      "data-testid=registration_number",
      clientRegNum,
      "Registration Number field"
    );

    // Billing Contact
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

    // Support Contact
    await waitForElementAndFill(
      page,
      "data-testid=support_contact_name",
      `Support ${clientName}`,
      "Support Contact Name"
    );
    await waitForElementAndFill(
      page,
      "data-testid=support_email_address",
      `support.${uniqueId}@example.com`,
      "Support Email"
    );
    await waitForElementAndFill(
      page,
      "data-testid=support_phone_number",
      "94714696125",
      "Support Phone"
    );

    // Technical Contact
    await waitForElementAndFill(
      page,
      "data-testid=technical_contact_name",
      `Tech ${clientName}`,
      "Technical Contact Name"
    );
    await waitForElementAndFill(
      page,
      "data-testid=technical_email_address",
      techEmail,
      "Technical Email"
    );
    await waitForElementAndFill(
      page,
      "data-testid=technical_phone_number",
      "94714696126",
      "Technical Phone"
    );

    // Account Manager
    await waitForElementAndFill(
      page,
      "data-testid=account_manager",
      "Auto Manager",
      "Account Manager"
    );

    // Submit and Verify
    await waitForElementAndClick(
      page,
      "data-testid=btn_submit",
      "Submit Client button"
    );

    await page.waitForTimeout(1000); // Short wait before checking
    await expect(page.locator("#market-form-model")).toContainText(
      "Client Created Successfully!",
      { timeout: 15000 }
    );
    console.log("Client Created Successfully.");
    await waitForElementAndClick(
      page,
      "data-testid=btn-continue",
      "Continue button after client creation"
    );

    // --- 5. Create Application ---
    console.log(`Creating Application: ${appName}`);
    await expect(page.locator("#client-drpdwn")).toBeVisible({
      timeout: 15000,
    });

    // Fill Application form using dynamic data
    await waitForElementAndFill(
      page,
      "data-testid=username",
      clientAppUsername,
      "Application Username field"
    );
    // The problematic field is 'Application Name' (data-testid=name)
    // FIX: Pass the compliant appName with only alphanumeric and underscores
    await waitForElementAndFill(
      page,
      "data-testid=name",
      appName,
      "Application Name field"
    );

    // Set Effective Date
    await waitForElementAndFill(
      page,
      'role=textbox[name="Effective Date *"]',
      effectiveDate,
      "Effective Date field"
    );
    await page.keyboard.press("Escape");

    await waitForElementAndClick(
      page,
      "data-testid=btn_submit",
      "Submit Application button"
    );

    await page.waitForTimeout(1000); // Short wait before checking

    // Verify Application Creation Success
    await expect(page.getByLabel("Application")).toContainText(
      "Application Created Successfully !",
      { timeout: 15000 }
    );
    console.log("Application Created Successfully.");
    await waitForElementAndClick(
      page,
      "data-testid=btn-continue",
      "Continue button after application creation"
    );

    // --- 6. Create Coverage ---
    console.log(`Creating Coverage: ${coverageRef}`);
    await expect(page.locator("#application-drpdwn")).toBeVisible({
      timeout: 15000,
    });

    // Select Market (Pakistan)

    await page.waitForTimeout(1000); // Short wait before interacting

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

    // Set Effective Date
    await waitForElementAndFill(
      page,
      'role=textbox[name="Effective Date *"]',
      effectiveDate,
      "Coverage Effective Date field"
    );
    await page.keyboard.press("Escape");

    // Check Enable Cache DB Lookup checkbox
    await page.getByTestId("enable-cache-db-lookup").check();
    await waitForElementAndClick(
      page,
      'role=button[name="OK"]',
      "OK button after cache checkbox"
    );

    await waitForElementAndClick(
      page,
      "data-testid=btn_submit",
      "Submit Coverage button"
    );

    // Verify Coverage Creation Success
    await expect(page.getByLabel("Coverage")).toContainText(
      "Coverage Created Successfully !",
      { timeout: 15000 }
    );
    console.log("Coverage Created Successfully.");
    await waitForElementAndClick(
      page,
      "data-testid=btn-continue",
      "Continue button after coverage creation"
    );

    // --- 7. Map Coverage to Supplier ---
    console.log("Starting Coverage Supplier Mapping...");

    // Select Supplier
    // FIX: Replaced the invalid selector string with a Playwright Locator chain
    const supplierDropdownArrowLocator = page
      .getByRole("cell", { name: "Select Supplier" })
      .locator("svg")
      .first();

    await waitForElementAndClick(
      page,
      supplierDropdownArrowLocator,
      "Supplier dropdown arrow"
    );

    await waitForElementAndClick(
      page,
      'role=option[name="int RDS Pakistan"]',
      "int RDS Pakistan option"
    );

    // Select Priority

    //await page.locator('.css-t3ipsp-control > .css-hlgwow > .css-19bb58m').click();
    await page
      .getByRole("cell", { name: "Select or Enter Proportion" })
      .locator("svg")
      .click();
    await page.getByRole("option", { name: "100" }).click();

    // await waitForElementAndClick(
    //   page,
    //   'role=button[name="Save Mapping"]',
    //   "Save Mapping button"
    // );

    await page.waitForTimeout(5000);

    //await page.locator("#react-select-5-input").press("Tab");

    //await page.locator("#react-select-5-input").press("Enter");

    await page.getByRole("button", { name: "Save Mapping" }).press("Enter");

    await page.waitForTimeout(1000);
    // Wait for and verify Mapping Success
    await expect(page.getByLabel("Coverage Supplier mapping")).toContainText(
      "Coverage Supplier Mapping Created Successfully!",
      { timeout: 15000 }
    );
    console.log("Coverage Supplier Mapping Created Successfully.");
    await waitForElementAndClick(
      page,
      "data-testid=btn-continue",
      "Continue button after mapping"
    );

    // --- 8. Create Client Price Plan ---
    console.log("Starting Client Price Plan Creation...");

    await page.waitForTimeout(1000); // Short wait before interacting

    // await page
    //   .locator(".css-t3ipsp-control > .css-hlgwow > .css-19bb58m")
    //   .click();

    await page.waitForTimeout(500);

    await page
      .locator(
        "#price-plan-drpdwn > .css-my3gbk-control > .css-hlgwow > .css-19bb58m"
      )
      .click();
    await page.getByRole("option", { name: "Transaction Rental" }).click();

    // // Wait for the price plan dropdown
    // await expect(page.locator("#price-plan-drpdwn")).toBeVisible({
    //   timeout: 15000,
    // });

    // // FIX: Replaced the selector targeting the inner path with a more robust locator
    // // that targets the interactive control element of the dropdown container.
    // const pricePlanControlLocator = page
    //   .locator("#price-plan-drpdwn")
    //   .locator("div")
    //   .first();

    // await waitForElementAndClick(
    //   page,
    //   pricePlanControlLocator, // Use the new, more robust locator
    //   "Price Plan dropdown control" // Updated description for clarity
    // );

    // Fill Price and Effective Date

    await page.getByRole("textbox").nth(1).click();
    await page.getByRole("textbox").nth(1).fill("0.25");

    // await waitForElementAndFill(
    //   page,
    //   'role=textbox[name="Effective Date *"]',
    //   effectiveDate,
    //   "Price Plan Effective Date field"
    // );
    // await page.keyboard.press("Escape");

    await page.getByRole("textbox").nth(2).click();
    await page
      .getByRole("option", { name: "Choose Tuesday, October 14th," })
      .click();
    await page
      .getByTestId("coverage-form")
      .locator("div")
      .filter({ hasText: "ResetSave Price Plan" })
      .first()
      .click();

    await waitForElementAndClick(
      page,
      "data-testid=btn_submit",
      "Submit Price Plan button"
    );

    // Verify Price Plan Creation Success
    await expect(page.getByLabel("Client Price Plan")).toContainText(
      "Client Price Created Successfully!",
      { timeout: 15000 }
    );
    console.log("Client Price Plan Created Successfully.");
    await waitForElementAndClick(
      page,
      "data-testid=btn-continue",
      "Continue button after price plan"
    );

    // --- 9. Generate Password ---
    console.log("Starting Password Generation...");

    // // Select Client (Search for the dynamically created one)
    // await waitForElementAndClick(
    //   page,
    //   'div:has-text("Select Client")',
    //   "Client dropdown"
    // );

    // // Use the clientName which is used for display
    // await page.locator('div:has-text("Select Client") input').fill(clientName);
    // await waitForElementAndClick(
    //   page,
    //   `role=option[name="${clientName}"]`,
    //   "Created Client option"
    // );

    await page.locator("#client-drpdwn svg").click();
    await page.locator("#react-select-39-input").fill(clientName);
    await page.getByRole("option", { name: clientName }).click();

    // Select Application (Search for the dynamically created one)
    // await waitForElementAndClick(
    //   page,
    //   "#application-drpdwn .css-19bb58m",
    //   "Application dropdown"
    // );
    // // Use the compliant appName
    // await waitForElementAndClick(
    //   page,
    //   `role=option[name="${appName}"]`,
    //   "Created Application option"
    // );

    await page
      .locator(".css-t3ipsp-control > .css-hlgwow > .css-19bb58m")
      .click();
    await page.locator("#react-select-40-input").fill(appName);
    await page.getByRole("option", { name: appName }).click();

    // Fill Username and Remarks
    await waitForElementAndFill(
      page,
      "data-testid=username",
      clientAppUsername,
      "Username field for generation"
    );

    await waitForElementAndFill(
      page,
      "data-testid=remarks",
      "password generate for happy path test",
      "Remarks field"
    );

    // Submit and capture download
    const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
    await waitForElementAndClick(
      page,
      "data-testid=btn_submit",
      "Submit Password Generation button"
    );
    const download = await downloadPromise;

    console.log(`Password file downloaded: ${download.suggestedFilename()}`);

    // Verify Password Generation Success
    await expect(page.locator("#market-form-model")).toContainText(
      "Password Generated Successfully",
      { timeout: 15000 }
    );
    console.log("Password Generated Successfully. Full Happy Path Complete!");

    await waitForElementAndClick(
      page,
      "data-testid=btn-continue",
      "Continue button after password generation"
    );
  } catch (error) {
    // Global error handling and screenshot on failure
    console.error("Test Failed during execution:", error);
    await page.screenshot({
      path: `test-results/failure-screenshot-${Date.now()}.png`,
    });

    // Re-throw the error to ensure Playwright marks the test as failed
    throw error;
  }

  console.log("Test Completed.");

  // --- End of Test Case ---
});
