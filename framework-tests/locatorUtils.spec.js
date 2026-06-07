import { test, expect } from "../core/fixtures/baseFixture.js";
import locatorUtils from "../core/utils/locatorUtils.js";

const testHTML = `
  <button role="button" data-testid="submit-btn">Submit</button>
  <label for="name">Name</label>
  <input id="name" type="text" placeholder="Enter your name" />
  <p>Welcome message</p>
`;

test.describe("LocatorUtils @verify", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(testHTML);
  });

  test("byRole - locates element by ARIA role", async ({ page }) => {
    const button = locatorUtils.byRole(page, "button", { name: "Submit" });
    await expect(button).toBeVisible();
    await expect(button).toHaveText("Submit");
  });

  test("byTestId - locates element by data-testid attribute", async ({
    page,
  }) => {
    const element = locatorUtils.byTestId(page, "submit-btn");
    await expect(element).toBeVisible();
    await expect(element).toHaveText("Submit");
  });

  test("byText - locates element by visible text content", async ({
    page,
  }) => {
    const element = locatorUtils.byText(page, "Welcome message");
    await expect(element).toBeVisible();
  });

  test("byText - supports RegExp matching", async ({ page }) => {
    const element = locatorUtils.byText(page, /welcome/i);
    await expect(element).toBeVisible();
  });

  test("byLabel - locates form element by associated label", async ({
    page,
  }) => {
    const input = locatorUtils.byLabel(page, "Name");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "text");
  });

  test("byPlaceholder - locates input by placeholder text", async ({
    page,
  }) => {
    const input = locatorUtils.byPlaceholder(page, "Enter your name");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("id", "name");
  });

  test("byPlaceholder - supports partial match with RegExp", async ({
    page,
  }) => {
    const input = locatorUtils.byPlaceholder(page, /enter your/i);
    await expect(input).toBeVisible();
  });

  test("buildSelector - builds CSS selector string", async () => {
    const selector = locatorUtils.buildSelector("css", "button.primary");
    expect(selector).toBe("button.primary");
  });

  test("buildSelector - builds XPath selector", async () => {
    const selector = locatorUtils.buildSelector("xpath", "//button[@id='go']");
    expect(selector).toBe("xpath=//button[@id='go']");
  });

  test("buildSelector - builds ID selector with # prefix", async () => {
    const selector = locatorUtils.buildSelector("id", "main-content");
    expect(selector).toBe("#main-content");
  });

  test("buildSelector - builds testid attribute selector", async () => {
    const selector = locatorUtils.buildSelector("testid", "submit-btn");
    expect(selector).toBe('[data-testid="submit-btn"]');
  });

  test("buildSelector - builds text selector", async () => {
    const selector = locatorUtils.buildSelector("text", "Click me");
    expect(selector).toBe("text=Click me");
  });

  test("buildSelector - throws for unknown strategy", async () => {
    expect(() => locatorUtils.buildSelector("invalid", "value")).toThrow(
      'Unknown locator strategy: "invalid"'
    );
  });
});
