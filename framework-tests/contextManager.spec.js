import { test, expect } from "../core/fixtures/baseFixture.js";
import contextManager from "../core/browser/contextManager.js";

test.describe("@verify ContextManager", () => {
  test("createContext - returns a non-null context", async ({ browser }) => {
    const context = await contextManager.createContext(browser);
    expect(context).not.toBeNull();
    await context.close();
  });

  test("createContext with viewport - applies custom viewport dimensions", async ({
    browser,
  }) => {
    const context = await contextManager.createContext(browser, {
      viewport: { width: 800, height: 600 },
    });
    const page = await context.newPage();
    const viewport = page.viewportSize();
    expect(viewport.width).toBe(800);
    expect(viewport.height).toBe(600);
    await context.close();
  });

  test("closeContext - closes without error", async ({ browser }) => {
    const context = await contextManager.createContext(browser);
    await expect(contextManager.closeContext(context)).resolves.not.toThrow();
  });

  test("grantPermissions - grants geolocation without error", async ({
    browser,
  }) => {
    const context = await contextManager.createContext(browser);
    await expect(
      contextManager.grantPermissions(context, ["geolocation"])
    ).resolves.not.toThrow();
    await context.close();
  });

  test("clearCookies - removes all cookies from context", async ({
    browser,
  }) => {
    const context = await contextManager.createContext(browser);
    const page = await context.newPage();
    await page.goto("about:blank");

    await context.addCookies([
      { name: "testcookie", value: "abc", url: "http://example.com" },
    ]);

    let cookies = await context.cookies();
    expect(cookies.length).toBeGreaterThan(0);

    await contextManager.clearCookies(context);
    cookies = await context.cookies();
    expect(cookies.length).toBe(0);

    await context.close();
  });

  test("clearPermissions - clears granted permissions without error", async ({
    browser,
  }) => {
    const context = await contextManager.createContext(browser);
    await contextManager.grantPermissions(context, ["geolocation"]);
    await expect(
      contextManager.clearPermissions(context)
    ).resolves.not.toThrow();
    await context.close();
  });
});
