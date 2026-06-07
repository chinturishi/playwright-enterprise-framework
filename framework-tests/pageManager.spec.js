import { test, expect } from "../core/fixtures/baseFixture.js";
import pageManager from "../core/browser/pageManager.js";

test.describe("@verify PageManager", () => {
  let context;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
  });

  test.afterEach(async () => {
    await context.close();
  });

  test("createPage - returns a page object", async () => {
    const page = await pageManager.createPage(context);
    expect(page).not.toBeNull();
    expect(page).toBeDefined();
  });

  test("closePage - closes page without error", async () => {
    const page = await pageManager.createPage(context);
    await expect(pageManager.closePage(page)).resolves.not.toThrow();
  });

  test("getPages - returns correct page count", async () => {
    await pageManager.createPage(context);
    await pageManager.createPage(context);

    const pages = pageManager.getPages(context);
    expect(pages.length).toBeGreaterThanOrEqual(2);
  });

  test("switchToPage - switches between pages with different content", async () => {
    const page1 = await pageManager.createPage(context);
    await page1.setContent("<html><body><h1>Page One</h1></body></html>");

    const page2 = await pageManager.createPage(context);
    await page2.setContent("<html><body><h1>Page Two</h1></body></html>");

    const switched1 = pageManager.switchToPage(context, 0);
    const content1 = await switched1.textContent("h1");
    expect(content1).toBe("Page One");

    const switched2 = pageManager.switchToPage(context, 1);
    const content2 = await switched2.textContent("h1");
    expect(content2).toBe("Page Two");
  });

  test("setDefaultTimeouts - sets timeout without error", async () => {
    const page = await pageManager.createPage(context);
    expect(() => pageManager.setDefaultTimeouts(page, 10000)).not.toThrow();
  });
});
