/**
 * Sample UI test suite demonstrating how a consuming application uses the
 * framework's FrameworkPage, BasePage, and data-driven approach.
 *
 * NOTE: No `@playwright/test` import — everything comes through the framework.
 *
 * Run with:  npx playwright test templates/ui/sample.spec.js
 */
import { test, expect } from "../../core/fixtures/baseFixture.js";
import { SamplePage } from "./sample.page.js";
import { validData, invalidData, createTestData } from "./sample.data.js";

test.describe("Sample Form @smoke", () => {
  let samplePage;

  test.beforeEach(async ({ frameworkPage, logger }) => {
    logger.info("Setting up SamplePage for test");
    samplePage = new SamplePage(frameworkPage);
    await samplePage.navigate("about:blank");
  });

  test("should load the page successfully", async ({ frameworkPage, logger }) => {
    logger.info("Verifying page loaded");
    expect(frameworkPage.getUrl()).toBe("about:blank");
  });

  test("should have framework fixtures available", async ({
    frameworkPage,
    logger,
    config,
    locatorUtils,
    screenshotUtils,
  }) => {
    expect(frameworkPage).toBeDefined();
    expect(logger).toBeDefined();
    expect(config).toBeDefined();
    expect(locatorUtils).toBeDefined();
    expect(screenshotUtils).toBeDefined();
  });

  test("should demonstrate page object navigation", async ({ logger }) => {
    logger.info("Navigating via page object");
    await samplePage.navigate("about:blank");
    const url = samplePage.getUrl();
    expect(url).toBe("about:blank");
  });

  test("should demonstrate wait actions via frameworkPage", async ({ frameworkPage, logger }) => {
    logger.info("Demonstrating waitForPageLoad");
    await frameworkPage.navigate("about:blank");
    await frameworkPage.waitForPageLoad("load");
    expect(frameworkPage.getUrl()).toBe("about:blank");
  });
});

test.describe("Data-driven tests @regression", () => {
  for (const data of validData) {
    test(`should accept valid data for ${data.name}`, async ({
      frameworkPage,
      logger,
    }) => {
      const samplePage = new SamplePage(frameworkPage);
      await samplePage.navigate("about:blank");
      logger.info(`Running data-driven test for: ${data.name}`);
      expect(data.name).toBeTruthy();
      expect(data.email).toContain("@");
    });
  }

  for (const data of invalidData) {
    test(`should reject invalid data — ${data.expectedError}`, async ({
      frameworkPage,
      logger,
    }) => {
      const samplePage = new SamplePage(frameworkPage);
      await samplePage.navigate("about:blank");
      logger.info(`Running negative test: ${data.expectedError}`);
      expect(data.expectedError).toBeTruthy();
    });
  }
});

test.describe("Dynamic data factory @regression", () => {
  test("should generate unique test data per invocation", async ({ logger }) => {
    const first = createTestData();
    const second = createTestData({ name: "Custom Name" });

    logger.info(`Generated data 1: ${first.email}`);
    logger.info(`Generated data 2: ${second.email}`);

    expect(first.email).not.toBe(second.email);
    expect(second.name).toBe("Custom Name");
    expect(first.category).toBe("general");
  });
});

test.describe("Configuration usage @smoke", () => {
  test("should read framework configuration", async ({ config, logger }) => {
    config.load();
    const all = config.getAll();
    logger.info(`Config keys: ${Object.keys(all).join(", ")}`);
    expect(all).toBeDefined();
    expect(typeof all).toBe("object");
  });

  test("should support dot-path config access", async ({ config, logger }) => {
    config.load();
    const browserConfig = config.get("browser", {});
    logger.info(`Browser config: ${JSON.stringify(browserConfig)}`);
    expect(browserConfig).toBeDefined();
  });
});
