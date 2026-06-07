import logger from "../logging/logger.js";

class FrameActions {
  /**
   * Get a frame by its name attribute or URL.
   * @param {import('@playwright/test').Page} page
   * @param {string} nameOrUrl - Frame name or URL substring
   * @returns {import('@playwright/test').Frame | null}
   */
  getFrame(page, nameOrUrl) {
    logger.info(`Looking for frame: ${nameOrUrl}`);
    const frame = page.frame(nameOrUrl);
    if (!frame) {
      logger.warn(`Frame not found: ${nameOrUrl}`);
    } else {
      logger.info(`Frame found: ${frame.url()}`);
    }
    return frame;
  }

  /**
   * Get a frame by matching a CSS selector for the iframe element.
   * @param {import('@playwright/test').Page} page
   * @param {string} selector - CSS selector for the <iframe> element
   * @returns {Promise<import('@playwright/test').Frame | null>}
   */
  async getFrameBySelector(page, selector) {
    logger.info(`Looking for frame by selector: ${selector}`);
    const elementHandle = await page.$(selector);
    if (!elementHandle) {
      logger.warn(`No iframe element found for selector: ${selector}`);
      return null;
    }
    const frame = await elementHandle.contentFrame();
    if (frame) {
      logger.info(`Frame found via selector: ${frame.url()}`);
    }
    return frame;
  }

  /**
   * Switch execution context to a named frame or one matching a URL.
   * @param {import('@playwright/test').Page} page
   * @param {string} nameOrUrl
   * @returns {import('@playwright/test').Frame}
   */
  switchToFrame(page, nameOrUrl) {
    const frame = this.getFrame(page, nameOrUrl);
    if (!frame) {
      throw new Error(`Cannot switch to frame: ${nameOrUrl} — not found`);
    }
    logger.info(`Switched to frame: ${frame.url()}`);
    return frame;
  }

  /**
   * Return to the main (top-level) frame of the page.
   * @param {import('@playwright/test').Page} page
   * @returns {import('@playwright/test').Frame}
   */
  switchToMainFrame(page) {
    const mainFrame = page.mainFrame();
    logger.info("Switched to main frame");
    return mainFrame;
  }

  /**
   * Get a FrameLocator for scoping locators inside an iframe.
   * @param {import('@playwright/test').Page} page
   * @param {string} selector - CSS selector for the <iframe>
   * @returns {import('@playwright/test').FrameLocator}
   */
  getFrameLocator(page, selector) {
    logger.info(`Creating FrameLocator for: ${selector}`);
    return page.frameLocator(selector);
  }

  /**
   * Execute a callback function within the scope of an iframe.
   * @param {import('@playwright/test').Page} page
   * @param {string} selector - CSS selector for the <iframe>
   * @param {(frameLocator: import('@playwright/test').FrameLocator) => Promise<*>} callback
   * @returns {Promise<*>}
   */
  async executeInFrame(page, selector, callback) {
    logger.info(`Executing action inside frame: ${selector}`);
    const frameLocator = page.frameLocator(selector);
    const result = await callback(frameLocator);
    logger.info("Frame action completed");
    return result;
  }
}

export default new FrameActions();
