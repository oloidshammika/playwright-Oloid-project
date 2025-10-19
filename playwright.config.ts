import { defineConfig, devices } from "@playwright/test";
import { OrtoniReportConfig } from "ortoni-report";
// 🚨 Keep this line to access the Ortoni reporter configuration function
const { reporter } = require("ortoni-report");

const reportConfig: OrtoniReportConfig = {
  // --- Configuration for HTML Generation ---
  // 'never' in CI ensures it doesn't try to open a browser window on the runner
  open: process.env.CI ? "never" : "always",
  // This is the output folder uploaded to GitHub Actions
  folderPath: "ortoni-report",
  // 🚨 This line is CRITICAL for ensuring the HTML file is generated
  filename: "index.html",

  // --- Customization ---
  //logo: "logo.{png, jpg}", // Uncomment and provide a file if needed
  title: "Oloid Test Run Report",
  showProject: !true,
  projectName: "Ortoni-Report",
  testType: "e2e",
  authorName: "Shammika Dahanayaka",
  base64Image: false,
  stdIO: false,
  preferredTheme: "light",

  // --- Metadata ---
  meta: {
    project: "Playwright",
    version: "3.0.0",
    description: "Playwright test report",
    testCycle: "1",
    release: "1.0.0",
    platform: "Windows",
  },
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 5 * 60 * 1000, // 5 minutes overall test timeout
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  globalTimeout: 60000,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list", { output: "list-report.txt" }],
    // 👇 FIX: Correctly applies the full 'reportConfig' constant defined above
    reporter(reportConfig),
  ],

  /* Shared settings for all the projects below. */
  use: {
    actionTimeout: 30000,
    navigationTimeout: 60000,
    headless: process.env.CI ? true : false,
    baseURL: process.env.BASE_URL,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
