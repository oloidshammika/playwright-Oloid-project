import { defineConfig, devices } from "@playwright/test";
import { OrtoniReportConfig } from "ortoni-report";

const reportConfig: OrtoniReportConfig = {
  open: process.env.CI ? "never" : "always",
  folderPath: "ortoni-report",
  // ✅ FIX: Set filename to the observed correct output name
  filename: "ortoni-report.html",
  title: "Oloid Test Run Report",
  showProject: false,
  projectName: "Ortoni-Report",
  testType: "e2e",
  authorName: "Shammika Dahanayaka",
  base64Image: false,
  stdIO: false,
  preferredTheme: "light",
  meta: {
    project: "Playwright",
    version: "3.0.0",
    description: "Playwright test report",
    testCycle: "1",
    release: "1.0.0",
    platform: "Windows",
  },
};

export default defineConfig({
  testDir: "./tests",
  timeout: 5 * 60 * 1000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  globalTimeout: 60000,

  reporter: [
    ["list", { output: "list-report.txt" }],
    ["ortoni-report", reportConfig],
    ["html", { open: "never" }],
  ],

  use: {
    actionTimeout: 30000,
    navigationTimeout: 60000,
    headless: process.env.CI ? true : false,
    baseURL: process.env.BASE_URL,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
