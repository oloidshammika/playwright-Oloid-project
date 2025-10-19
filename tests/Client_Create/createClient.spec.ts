import { test, expect, Page } from "@playwright/test";

test.describe("Client Creation Flow", () => {
  // Reusable functions

  /**
   * Logs in to the MNP Admin Portal.
   */
  async function login(page: Page) {
    await page.goto(
      "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login"
    );
    await page.getByTestId("username").fill("admin");
    await page.getByTestId("password").fill("admin@123");
    await page.getByTestId("btn-login").click();
    // Use an explicit 30s timeout for the dashboard load
    await expect(page.locator("#root")).toContainText("MNP Admin Portal", {
      timeout: 30000,
    });
  }

  /**
   * Navigates from the dashboard to the Create Client form.
   * FIX: Increased the timeout for the final assertion to 60s due to slow page loading.
   */
  async function navigateToClientForm(page: Page) {
    await page.getByRole("link", { name: "Client Management" }).click();
    await page.getByRole("link", { name: "Client", exact: true }).click();

    // Small pause to ensure the button is clickable before the command
    await page.waitForTimeout(500);
    await page.getByTestId("btn-add-new-2").click();

    // *** CRITICAL FIX: Timeout increased to 60 seconds (1 minute) ***
    console.log("Waiting for 'Create Client' form to load (up to 60s)...");
    await expect(page.getByTestId("model-title")).toContainText(
      "Create Client",
      { timeout: 60000 }
    );
    console.log("Create Client form loaded successfully.");
  }

  // New: function to fill client form with dynamic details
  async function fillClientForm(page: Page, clientData: any) {
    await page.getByTestId("name").fill(clientData.name);
    await page.getByTestId("address").fill(clientData.address);
    await page.getByTestId("post_code").fill(clientData.postCode);

    // Select Currency (Assuming 1000ms is enough for dropdown options to load)
    await page.waitForTimeout(1000);
    // Locator for the Currency dropdown arrow/input (first instance)
    await page.locator(".css-19bb58m").first().click();
    await page
      .locator(`#react-select-4-option-${clientData.currencyOptionIndex}`)
      .click();

    // Select Country
    await page.waitForTimeout(500); // Small wait between dropdowns
    // Locator for the Country dropdown arrow/input (second specific instance)
    await page
      .locator(".css-my3gbk-control > .css-hlgwow > .css-19bb58m")
      .click();
    await page
      .locator(`#react-select-5-option-${clientData.countryOptionIndex}`)
      .click();

    // Additional details
    await page
      .getByTestId("registration_number")
      .fill(clientData.registrationNumber);
    await page
      .getByTestId("billing_contact_name")
      .fill(clientData.billingContactName);
    await page
      .getByTestId("billing_email_address")
      .fill(clientData.billingEmail);
    await page
      .getByTestId("billing_phone_number")
      .fill(clientData.billingPhone);

    await page
      .getByTestId("support_contact_name")
      .fill(clientData.supportContactName);
    await page
      .getByTestId("support_email_address")
      .fill(clientData.supportEmail);
    await page
      .getByTestId("support_phone_number")
      .fill(clientData.supportPhone);

    await page
      .getByTestId("technical_contact_name")
      .fill(clientData.technicalContactName);
    await page
      .getByTestId("technical_email_address")
      .fill(clientData.technicalEmail);
    await page
      .getByTestId("technical_phone_number")
      .fill(clientData.technicalPhone);

    await page.getByTestId("account_manager").fill(clientData.accountManager);
  }

  // Use test.beforeEach to handle setup for all tests
  test.beforeEach(async ({ page }) => {
    await page.goto(
      "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login",
      { waitUntil: "networkidle" }
    );
    await expect(page.getByTestId("username")).toBeVisible();
  });

  test("Login to MNP Admin Portal", async ({ page }) => {
    await login(page);
  });

  test("Create Client with Dynamic Data", async ({ page }) => {
    const clientData = {
      name: `random_client_${Date.now()}`, // dynamic unique client name
      address: "15176, Canary Dr, Surrey",
      postCode: "V3R 4V7",
      currencyOptionIndex: 2, // Check if this index (2) correctly selects USD
      countryOptionIndex: 31, // Check if this index (31) correctly selects Canada
      registrationNumber: "12344",
      billingContactName: "Damro",
      billingEmail: "damro@gmail.com",
      billingPhone: "94715006124",
      supportContactName: "Damro supplier 1",
      supportEmail: "damrosup@gmail.com",
      supportPhone: "94715006125",
      technicalContactName: "Damro tec 1",
      technicalEmail: "damrotec1@gmail.com",
      technicalPhone: "94715006126",
      accountManager: "Damro manager 1",
    };

    await login(page);
    await navigateToClientForm(page);
    await page.waitForTimeout(1000); // A small delay after form loads

    await fillClientForm(page, clientData);

    // Submit
    await page.getByTestId("btn_submit").click();

    await expect(page.locator("#market-form-model")).toContainText(
      "Client Created Successfully!"
    );

    // The button name was previously "OK". Using "Continue on Client" from your provided script.
    await page.getByRole("button", { name: "Continue on Client" }).click();
  });

  test("Duplicate Client Creation Should Be Omitted", async ({ page }) => {
    // We must ensure the name used here is unique on the first run,
    // and then used again on the second run to check for duplication.
    const uniqueClientName = `random_client_duplicate_${Date.now()}`;

    const duplicateClientData = {
      name: uniqueClientName,
      address: "123 Dup St, Vancouver",
      postCode: "V5K 0A1",
      currencyOptionIndex: 1,
      countryOptionIndex: 31,
      registrationNumber: "54321",
      billingContactName: "Dup Billing",
      billingEmail: "dupbilling@gmail.com",
      billingPhone: "94715006127",
      supportContactName: "Dup Support",
      supportEmail: "dupsupport@gmail.com",
      supportPhone: "94715006128",
      technicalContactName: "Dup Tech",
      technicalEmail: "duptech@gmail.com",
      technicalPhone: "94715006129",
      accountManager: "Dup Manager",
    };

    // --- First creation (Success) ---
    await login(page);
    await navigateToClientForm(page);
    await fillClientForm(page, duplicateClientData);
    await page.getByTestId("btn_submit").click();
    await expect(page.locator("#market-form-model")).toContainText(
      "Client Created Successfully!"
    );
    await page.getByRole("button", { name: "Continue on Client" }).click();

    // --- Second creation (Duplication attempt) ---
    await navigateToClientForm(page);
    await fillClientForm(page, duplicateClientData);
    await page.getByTestId("btn_submit").click();

    // Now expect the error message
    await expect(page.locator("body")).toContainText(
      "Duplicate admin entry creation attempt, please check the request details again",
      { timeout: 15000 }
    );

    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "OK" }).click();
  });

  test("Verify Client is Displayed in List", async ({ page }) => {
    // NOTE: This test will fail unless 'random_client_1' actually exists from a previous run.
    const clientName = "random_client_1";

    await login(page);
    await page.getByRole("link", { name: "Client Management" }).click();
    await page.getByRole("link", { name: "Client", exact: true }).click();

    await page.getByRole("textbox", { name: "Search" }).click();
    await page.getByRole("textbox", { name: "Search" }).fill(clientName);

    // Click the search icon
    await page.locator(".input-group-text > .icon").click();

    // Using stable locators based on content, as the IDs in the original script were brittle.
    await expect(page.locator("text=" + clientName).first()).toBeVisible();
    await expect(page.locator("text=Canada").first()).toBeVisible();
    await expect(page.locator("text=USD").first()).toBeVisible();
    await expect(page.locator("text=V3R 4V7").first()).toBeVisible();
  });

  // close all browsers and stop testing after running all tests
});
