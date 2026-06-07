import { test, expect } from "../core/fixtures/baseFixture.js";
import browserManager from "../core/browser/browserManager.js";

test.describe("@verify BrowserManager", () => {
  test.afterEach(async () => {
    await browserManager.closeBrowser();
  });

  test("launchBrowser (chromium) - returns connected browser instance", async () => {
    const browser = await browserManager.launchBrowser("chromium");
    expect(browser).not.toBeNull();
    expect(browser.isConnected()).toBe(true);
  });

  test("launchBrowser (invalid) - throws error for unsupported browser type", async () => {
    await expect(browserManager.launchBrowser("safari")).rejects.toThrow(
      /Unsupported browser type/
    );
  });

  test("closeBrowser - sets getBrowser to null after close", async () => {
    await browserManager.launchBrowser("chromium");
    await browserManager.closeBrowser();
    expect(browserManager.getBrowser()).toBeNull();
  });

  test("closeBrowser (no browser) - handles gracefully when none exists", async () => {
    await browserManager.closeBrowser();
    expect(browserManager.getBrowser()).toBeNull();
  });

  test("getBrowser - returns active browser instance", async () => {
    await browserManager.launchBrowser("chromium");
    const browser = browserManager.getBrowser();
    expect(browser).not.toBeNull();
  });

  test("isConnected - true when launched, false after close", async () => {
    await browserManager.launchBrowser("chromium");
    expect(browserManager.isConnected()).toBe(true);

    await browserManager.closeBrowser();
    expect(browserManager.isConnected()).toBe(false);
  });

  test("headless option - launches successfully with headless true", async () => {
    const browser = await browserManager.launchBrowser("chromium", {
      headless: true,
    });
    expect(browser).not.toBeNull();
    expect(browser.isConnected()).toBe(true);
  });
});
