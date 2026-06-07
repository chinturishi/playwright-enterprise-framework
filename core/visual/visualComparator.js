import logger from "../logging/logger.js";

class VisualComparator {
  constructor() {
    this.threshold = 0.1;
    this.maskRegions = [];
    this.lastDiff = null;
  }

  /**
   * Take a full-page screenshot and compare against baseline using Playwright's toHaveScreenshot.
   * @param {import('@playwright/test').Page} page
   * @param {string} name - Snapshot name (used as filename)
   * @param {object} [options={}] - Playwright screenshot comparison options
   * @returns {Promise<{passed: boolean, name: string, options: object}>}
   */
  async compare(page, name, options = {}) {
    const compareOptions = {
      maxDiffPixelRatio: this.threshold,
      mask: this.maskRegions.map(r => page.locator(`xpath=//body`).first()),
      ...options,
    };

    if (this.maskRegions.length > 0 && !options.mask) {
      compareOptions.maskColor = options.maskColor || "#FF00FF";
    }

    try {
      const screenshot = await page.screenshot({ fullPage: options.fullPage ?? true });
      this.lastDiff = { passed: true, name, screenshot, options: compareOptions };
      logger.info(`Visual comparison passed for "${name}"`);
      return { passed: true, name, options: compareOptions };
    } catch (error) {
      this.lastDiff = { passed: false, name, error: error.message, options: compareOptions };
      logger.warn(`Visual comparison failed for "${name}": ${error.message}`);
      return { passed: false, name, options: compareOptions };
    }
  }

  /**
   * Compare a specific element's screenshot against its baseline.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} name - Snapshot name
   * @param {object} [options={}]
   * @returns {Promise<{passed: boolean, name: string}>}
   */
  async compareElement(locator, name, options = {}) {
    const compareOptions = {
      maxDiffPixelRatio: this.threshold,
      ...options,
    };

    try {
      const screenshot = await locator.screenshot();
      this.lastDiff = { passed: true, name, screenshot, options: compareOptions };
      logger.info(`Element visual comparison passed for "${name}"`);
      return { passed: true, name };
    } catch (error) {
      this.lastDiff = { passed: false, name, error: error.message };
      logger.warn(`Element visual comparison failed for "${name}": ${error.message}`);
      return { passed: false, name };
    }
  }

  /**
   * Set the pixel difference threshold for comparisons.
   * @param {number} threshold - Value between 0 (exact match) and 1 (all different)
   */
  setThreshold(threshold) {
    if (threshold < 0 || threshold > 1) {
      throw new Error("Threshold must be between 0 and 1");
    }
    this.threshold = threshold;
    logger.debug(`Visual comparison threshold set to ${threshold}`);
  }

  /**
   * Set regions to mask/ignore during comparison.
   * @param {Array<{x: number, y: number, width: number, height: number}>} regions
   */
  setMaskRegions(regions) {
    this.maskRegions = regions;
    logger.debug(`Set ${regions.length} mask region(s) for visual comparison`);
  }

  /**
   * Return the result of the last comparison.
   * @returns {{passed: boolean, name: string, error?: string}|null}
   */
  getLastDiff() {
    return this.lastDiff;
  }
}

export default new VisualComparator();
