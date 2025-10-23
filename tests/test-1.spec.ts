import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto(
    "http://k8s-mnp-mnpadmin-caf79e8920-d292c5aedbf21a5e.elb.eu-west-2.amazonaws.com/login"
  );
  await page.getByTestId("username").click();
  await page.getByTestId("username").fill("admin");
  await page.getByTestId("password").click();
  await page.getByTestId("password").fill("admin@123");
  await page.getByTestId("btn-login").click();
  await expect(page.getByText("MNP Admin Portal")).toBeVisible();
  await page.getByRole("link", { name: "Client Management" }).click();
  await page.getByRole("link", { name: "Application" }).click();
  await expect(page.getByTestId("page-header")).toContainText(
    "Client Application Information"
  );
  await page.getByTestId("btn-add-new-2").click();
  await page.getByTestId("application-form").locator("svg").click();
  await page.locator("#react-select-4-option-1").click();
  await page.getByTestId("username").click();
  await page.getByTestId("username").fill("");
  await page.getByRole("button", { name: "Exit" }).click();
  await page.getByTestId("username").fill("auto-");
  await page.getByRole("button", { name: "Exit" }).click();
  await page.getByTestId("username").fill("auto_randon_app_656478");
  await page.getByTestId("username").click();
  await page.getByTestId("name").click();
  await page.getByTestId("name").fill("Automation app 656478");
  await page.getByRole("textbox", { name: "Effective Date *" }).click();
  await page
    .getByRole("option", { name: "Choose Tuesday, October 21st," })
    .click();
  await page.getByTestId("btn_submit").click();
  await expect(page.getByLabel("Application")).toContainText(
    "Application Created Successfully !"
  );
  await page.getByRole("button", { name: "Continue on Application" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Select ClientReset$/ })
    .locator("svg")
    .first()
    .click();
  await page.locator("#react-select-2-option-1").click();
  await page.getByRole("textbox", { name: "Search" }).click();
  await page.getByRole("textbox", { name: "Search" }).fill("656478");
  await page
    .locator("div")
    .filter({ hasText: /^AZ NB partner KurtisReset$/ })
    .locator("span")
    .nth(3)
    .click();
  await expect(page.getByText("Automation app")).toBeVisible();
  await expect(page.getByText("-10-21")).toBeVisible();
  await expect(page.getByText("auto_randon_app_656478")).toBeVisible();
});

await page.getByTestId("btn-add-new-2").click();
await page
  .locator("#client-drpdwn > .css-13cymwt-control > .css-hlgwow > .css-19bb58m")
  .click();
await page.getByRole("option", { name: "QAPBP_02" }).click();
await page.getByTestId("username").click();
await page.getByTestId("username").fill("auto_app-");
await page.getByRole("button", { name: "Exit" }).click();
await page.getByTestId("username").fill("auto_app_7876");
await page.getByTestId("name").click();
await page.getByTestId("name").fill("Automation app 7876");
await page.getByRole("textbox", { name: "Effective Date *" }).click();
await page
  .getByRole("option", { name: "Choose Tuesday, October 21st," })
  .click();
await page.getByTestId("btn_submit").click();
await expect(page.getByText("Duplicate admin entry")).toBeVisible();
await expect(page.locator("body")).toContainText(
  "Duplicate admin entry creation attempt, please check the request details again"
);

await page.getByRole("button", { name: "Exit" }).click();
await page.getByTestId("custom-close-button").click();
await page.getByTestId("btn-add-new-2").click();
await page
  .locator("#client-drpdwn > .css-13cymwt-control > .css-hlgwow > .css-19bb58m")
  .click();
await page.getByRole("option", { name: "QAPBP_02" }).click();
await page.getByTestId("username").click();
await page.getByTestId("username").fill("auto_app_4144");
await page.getByTestId("username").press("Tab");
await page.getByTestId("name").fill("Automation app 4144");
await page.getByRole("textbox", { name: "Effective Date *" }).click();
await page
  .getByRole("option", { name: "Choose Tuesday, October 21st," })
  .click();
await page.getByTestId("btn_submit").click();
await page.getByRole("button", { name: "Continue on Application" }).click();
await page.getByRole("textbox", { name: "Search" }).click();
await page.getByRole("textbox", { name: "Search" }).fill("");
await page
  .locator("div")
  .filter({ hasText: /^AZ NB partner Kurtis$/ })
  .nth(3)
  .click();
await page.getByRole("option", { name: "QAPBP_02" }).click();
await page.getByRole("textbox", { name: "Search" }).click();
await page.getByRole("textbox", { name: "Search" }).fill("4144");
await page
  .locator("div")
  .filter({ hasText: /^QAPBP_02Reset$/ })
  .locator("span")
  .nth(3)
  .click();
await page.locator(".css-1xc3v61-indicatorContainer").click();
await page.getByRole("option", { name: "QAPBP_01" }).click();
await page.locator(".input-group-text").click();
await page
  .locator("div")
  .filter({ hasText: /^QAPBP_01Reset$/ })
  .locator("svg")
  .first()
  .click();
await page
  .locator("#root div")
  .filter({
    hasText:
      "Client Application Information3451 results available.Use Up and Down to choose",
  })
  .nth(2)
  .click();

await page
  .locator("div")
  .filter({ hasText: /^QAPBP_01Reset$/ })
  .locator("svg")
  .first()
  .click();
await page.getByRole("option", { name: "QAPBP_02" }).click();
await page.getByRole("textbox", { name: "Search" }).click();
await page.getByRole("textbox", { name: "Search" }).fill("pbp");
await page
  .locator("div")
  .filter({ hasText: /^QAPBP_02Reset$/ })
  .locator("span")
  .nth(3)
  .click();
await page.getByRole("textbox", { name: "Search" }).click();
await page.getByRole("textbox", { name: "Search" }).fill("");
await page
  .locator("div")
  .filter({ hasText: /^QAPBP_02Reset$/ })
  .locator("span")
  .nth(3)
  .click();
await page.getByTestId("btn-edit-46").click();
await page.getByTestId("username").click();
await page.getByTestId("username").fill("PBP_QAi5f_edited");
await page.getByTestId("name").click();
await page.getByTestId("name").fill("QA_Serverless_AppAlvena_edited auto");
await page.getByRole("textbox", { name: "Effective Date *" }).click();
await page
  .getByRole("option", { name: "Choose Wednesday, October 22nd," })
  .click();
await page.getByRole("checkbox", { name: "Enabled" }).uncheck();
await page.getByTestId("update_comment").click();
await page.getByTestId("update_comment").fill("automation test app update");
await page.getByTestId("btn_submit").click();
await page.getByText("Disabling or Enabling the").click();
await expect(page.locator("body")).toContainText(
  "Disabling or Enabling the client will impact the transaction from one or all clients . Kindly reconfirm and update the remarks to proceed"
);
await page.getByRole("button", { name: "OK" }).click();
await expect(page.getByText("Application Updated")).toBeVisible();
await expect(page.getByLabel("Application")).toContainText(
  "Application Updated Successfully !"
);
await page.getByRole("button", { name: "Continue on Application" }).click();
