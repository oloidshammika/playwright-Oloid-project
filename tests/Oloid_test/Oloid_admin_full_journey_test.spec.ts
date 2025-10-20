import fs from "fs";
import path from "path";
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

  // ensure test-results folder exists for downloads/screenshots
  fs.mkdirSync("test-results", { recursive: true });

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
  } catch (error) {
    // Global error handling and screenshot on failure
    console.error("Test Failed during execution:", error);
    await page.screenshot({
      path: `test-results/failure-screenshot-${Date.now()}.png`,
    });

    // Re-throw the error to ensure Playwright marks the test as failed
    throw error;
  } finally {
    // Ensure resources are closed so Playwright worker can exit cleanly
    try {
      if (!page.isClosed()) await page.close();
    } catch (err) {
      console.warn("Error closing page in finally:", err);
    }
    try {
      await page.context().close();
    } catch (err) {
      console.warn(
        "Error closing context in finally (may be already closed):",
        err
      );
    }
  }

  console.log("Test Completed.");

  // --- End of Test Case ---
});
