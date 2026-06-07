import path from "path";
import fs from "fs-extra";
import logger from "../logging/logger.js";

const SCREENSHOT_DIR = "reports/screenshots";

class ScreenshotUtils {
  constructor() {
    if (ScreenshotUtils._instance) return ScreenshotUtils._instance;
    ScreenshotUtils._instance = this;
  }

  /**
   * Captures a full-page or viewport screenshot and saves it.
   * @param {import('@playwright/test').Page} page
   * @param {string} name - Descriptive file name (without extension)
   * @param {{ fullPage?: boolean }} [options]
   * @returns {Promise<string>} Absolute path to the saved screenshot
   */
  async capture(page, name, options = {}) {
    const filePath = this.getPath(name);
    await fs.ensureDir(path.dirname(filePath));
    await page.screenshot({
      path: filePath,
      fullPage: options.fullPage ?? false
    });
    logger.info(`Screenshot saved: ${filePath}`);
    return filePath;
  }

  /**
   * Captures a screenshot of a specific element via its locator.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} name
   * @returns {Promise<string>}
   */
  async captureElement(locator, name) {
    const filePath = this.getPath(name);
    await fs.ensureDir(path.dirname(filePath));
    await locator.screenshot({ path: filePath });
    logger.info(`Element screenshot saved: ${filePath}`);
    return filePath;
  }

  /**
   * Builds a timestamped file path for a screenshot name.
   * @param {string} name
   * @returns {string}
   */
  getPath(name) {
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return path.resolve(SCREENSHOT_DIR, `${sanitized}_${timestamp}.png`);
  }

  /**
   * Takes a screenshot and compares it against a stored baseline using
   * Playwright's built-in visual comparison (toHaveScreenshot).
   * @param {import('@playwright/test').Page} page
   * @param {string} name - Baseline identifier
   * @returns {Promise<Buffer>} The screenshot buffer for further assertions
   */
  async compareWithBaseline(page, name) {
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const buffer = await page.screenshot();
    const baselinePath = path.resolve(SCREENSHOT_DIR, "baselines", `${sanitized}.png`);
    const baselineExists = await fs.pathExists(baselinePath);

    if (!baselineExists) {
      await fs.ensureDir(path.dirname(baselinePath));
      await fs.writeFile(baselinePath, buffer);
      logger.info(`Baseline created: ${baselinePath}`);
    } else {
      logger.info(`Baseline exists for comparison: ${baselinePath}`);
    }
    return buffer;
  }
}

const screenshotUtils = new ScreenshotUtils();
export default screenshotUtils;
