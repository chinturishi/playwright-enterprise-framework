import { test, expect } from "../core/fixtures/baseFixture.js";
import frameActions from "../core/wrappers/frameActions.js";

const HTML = `
<h1 id="main-title">Main Page</h1>
<iframe id="test-frame" name="testframe"
  srcdoc="<html><body><h1 id='frame-title'>Inside Frame</h1><button id='frame-btn'>Frame Button</button></body></html>">
</iframe>
`;

test.describe("FrameActions @verify", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML);
    await page.locator("#test-frame").waitFor({ state: "attached" });
    const frame = page.frame("testframe");
    if (frame) await frame.waitForLoadState("domcontentloaded");
  });

  test("getFrame - retrieves frame by name", async ({ page }) => {
    const frame = frameActions.getFrame(page, "testframe");
    expect(frame).not.toBeNull();
  });

  test("getFrameBySelector - retrieves frame by CSS selector", async ({ page }) => {
    const frame = await frameActions.getFrameBySelector(page, "#test-frame");
    expect(frame).not.toBeNull();
  });

  test("switchToFrame - switches to named frame and returns it", async ({ page }) => {
    const frame = frameActions.switchToFrame(page, "testframe");
    expect(frame).not.toBeNull();
    const title = await frame.locator("#frame-title").textContent();
    expect(title).toBe("Inside Frame");
  });

  test("switchToMainFrame - returns main frame", async ({ page }) => {
    const mainFrame = frameActions.switchToMainFrame(page);
    expect(mainFrame).toBe(page.mainFrame());
    const title = await mainFrame.locator("#main-title").textContent();
    expect(title).toBe("Main Page");
  });

  test("getFrameLocator - creates FrameLocator for iframe", async ({ page }) => {
    const fl = frameActions.getFrameLocator(page, "#test-frame");
    const title = fl.locator("#frame-title");
    await expect(title).toHaveText("Inside Frame");
  });

  test("executeInFrame - executes callback inside frame scope", async ({ page }) => {
    const result = await frameActions.executeInFrame(
      page,
      "#test-frame",
      async (fl) => {
        return await fl.locator("#frame-title").textContent();
      }
    );
    expect(result).toBe("Inside Frame");
  });
});
