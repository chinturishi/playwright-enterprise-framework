/**
 * Framework sanity tests — verify that core modules load and are functional.
 *
 * These are the first tests to run when the framework is set up in a new repo.
 * They do NOT test any application; they validate that the framework itself is
 * wired correctly.
 */
import { test, expect } from "../core/fixtures/baseFixture.js";
import configLoader from "../config/global/configLoader.js";

test.describe("Framework sanity @sanity", () => {
  test("logger fixture is available and functional", async ({ logger }) => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    logger.info("Sanity: logger is working");
  });

  test("config fixture is available and loadable", async ({ config }) => {
    expect(config).toBeDefined();
    config.load();
    const all = config.getAll();
    expect(all).toBeDefined();
    expect(typeof all).toBe("object");
  });

  test("elementActions fixture is available", async ({ elementActions }) => {
    expect(elementActions).toBeDefined();
    expect(typeof elementActions.click).toBe("function");
    expect(typeof elementActions.fill).toBe("function");
    expect(typeof elementActions.getText).toBe("function");
    expect(typeof elementActions.isVisible).toBe("function");
  });

  test("waitActions fixture is available", async ({ waitActions }) => {
    expect(waitActions).toBeDefined();
    expect(typeof waitActions.waitForVisible).toBe("function");
    expect(typeof waitActions.waitForPageLoad).toBe("function");
    expect(typeof waitActions.waitForURL).toBe("function");
  });

  test("screenshotUtils fixture is available", async ({ screenshotUtils }) => {
    expect(screenshotUtils).toBeDefined();
  });

  test("configLoader singleton loads without errors", async () => {
    configLoader.reset();
    configLoader.load();
    const cfg = configLoader.getAll();
    expect(cfg).toBeDefined();
  });

  test("page can navigate to about:blank", async ({ page, logger }) => {
    await page.goto("about:blank");
    const url = page.url();
    logger.info(`Navigated to: ${url}`);
    expect(url).toBe("about:blank");
  });

  test("page title is accessible after navigation", async ({ page }) => {
    await page.goto("about:blank");
    const title = await page.title();
    expect(typeof title).toBe("string");
  });
});
