import { test, expect } from "../core/fixtures/baseFixture.js";
import screenshotUtils from "../core/utils/screenshotUtils.js";
import fs from "fs-extra";

test.describe("@verify ScreenshotUtils", () => {
  const createdFiles = [];

  test.afterEach(async () => {
    for (const filePath of createdFiles) {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    }
    createdFiles.length = 0;
  });

  test("capture - saves screenshot file to disk", async ({ page }) => {
    await page.setContent(
      "<html><body><h1>Screenshot Test</h1></body></html>"
    );
    const filePath = await screenshotUtils.capture(page, "test-capture");
    createdFiles.push(filePath);

    const exists = await fs.pathExists(filePath);
    expect(exists).toBe(true);
  });

  test("captureElement - saves element screenshot to disk", async ({
    page,
  }) => {
    await page.setContent(
      '<html><body><div id="target" style="width:100px;height:100px;background:red;">Box</div></body></html>'
    );
    const locator = page.locator("#target");
    const filePath = await screenshotUtils.captureElement(
      locator,
      "test-element"
    );
    createdFiles.push(filePath);

    const exists = await fs.pathExists(filePath);
    expect(exists).toBe(true);
  });

  test("getPath - returns png path containing the name", async () => {
    const filePath = screenshotUtils.getPath("my-screenshot");
    expect(filePath).toContain("my-screenshot");
    expect(filePath.endsWith(".png")).toBe(true);
  });

  test("capture fullPage - saves full page screenshot to disk", async ({
    page,
  }) => {
    await page.setContent(
      "<html><body style='height:2000px'><h1>Tall Page</h1></body></html>"
    );
    const filePath = await screenshotUtils.capture(page, "test-fullpage", {
      fullPage: true,
    });
    createdFiles.push(filePath);

    const exists = await fs.pathExists(filePath);
    expect(exists).toBe(true);
  });
});
