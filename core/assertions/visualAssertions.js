import { expect } from "@playwright/test";
import logger from "../logging/logger.js";

const DEFAULT_OPTIONS = {
  maxDiffPixelRatio: 0.01,
  threshold: 0.2,
  animations: "disabled",
};

class VisualAssertions {
  /**
   * Full-page screenshot assertion with framework defaults merged over
   * Playwright's `toHaveScreenshot`.
   * @param {import('@playwright/test').Page} page
   * @param {string} name - Snapshot file name (e.g. "homepage")
   * @param {object} [options] - Overrides for toHaveScreenshot
   */
  async assertScreenshot(page, name, options = {}) {
    const merged = { ...DEFAULT_OPTIONS, ...options };
    logger.info(`Visual assertion — page screenshot "${name}"`);
    await expect(page).toHaveScreenshot(`${name}.png`, merged);
    logger.info(`Visual assertion passed — "${name}"`);
  }

  /**
   * Element-level screenshot assertion.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} name
   * @param {object} [options]
   */
  async assertElementScreenshot(locator, name, options = {}) {
    const merged = { ...DEFAULT_OPTIONS, ...options };
    logger.info(`Visual assertion — element screenshot "${name}"`);
    await expect(locator).toHaveScreenshot(`${name}.png`, merged);
    logger.info(`Visual assertion passed — element "${name}"`);
  }

  /**
   * Assert that a page screenshot does not exceed the given diff threshold.
   * @param {import('@playwright/test').Page} page
   * @param {string} name
   * @param {number} [threshold=0.01] - Maximum allowed diff pixel ratio (0–1)
   */
  async assertNoVisualRegression(page, name, threshold = 0.01) {
    logger.info(`Regression check — "${name}" (threshold: ${threshold})`);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      ...DEFAULT_OPTIONS,
      maxDiffPixelRatio: threshold,
    });
    logger.info(`No visual regression detected — "${name}"`);
  }

  /**
   * Non-blocking (soft) screenshot assertion. Failures are collected but do
   * not stop test execution.
   * @param {import('@playwright/test').Page} page
   * @param {string} name
   * @param {object} [options]
   */
  async softAssertScreenshot(page, name, options = {}) {
    const merged = { ...DEFAULT_OPTIONS, ...options };
    logger.info(`Soft visual assertion — "${name}"`);
    await expect.soft(page).toHaveScreenshot(`${name}.png`, merged);
    logger.info(`Soft visual assertion completed — "${name}"`);
  }
}

const visualAssertions = new VisualAssertions();
export default visualAssertions;
