import logger from "../logging/logger.js";
import { DEFAULT_TIMEOUT_MS } from "../../config/constants/timeoutConstants.js";

class WaitActions {
  /**
   * Wait until the locator's element is visible in the DOM.
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout]
   */
  async waitForVisible(locator, timeout = DEFAULT_TIMEOUT_MS) {
    logger.debug("Waiting for element to be visible");
    await locator.waitFor({ state: "visible", timeout });
    logger.debug("Element is visible");
  }

  /**
   * Wait until the locator's element is hidden or detached.
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout]
   */
  async waitForHidden(locator, timeout = DEFAULT_TIMEOUT_MS) {
    logger.debug("Waiting for element to be hidden");
    await locator.waitFor({ state: "hidden", timeout });
    logger.debug("Element is hidden");
  }

  /**
   * Wait until the locator's element is enabled (not disabled).
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout]
   */
  async waitForEnabled(locator, timeout = DEFAULT_TIMEOUT_MS) {
    logger.debug("Waiting for element to be enabled");
    await locator.waitFor({ state: "visible", timeout });
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await locator.isEnabled()) {
        logger.debug("Element is enabled");
        return;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`Element was not enabled within ${timeout}ms`);
  }

  /**
   * Wait until the locator's element is disabled.
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [timeout]
   */
  async waitForDisabled(locator, timeout = DEFAULT_TIMEOUT_MS) {
    logger.debug("Waiting for element to be disabled");
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await locator.isDisabled()) {
        logger.debug("Element is disabled");
        return;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error(`Element was not disabled within ${timeout}ms`);
  }

  /**
   * Wait for the page to reach a specific load state.
   * @param {import('@playwright/test').Page} page
   * @param {'load' | 'domcontentloaded' | 'networkidle'} [state='networkidle']
   */
  async waitForPageLoad(page, state = "networkidle") {
    logger.debug(`Waiting for page load state: ${state}`);
    await page.waitForLoadState(state);
    logger.debug(`Page reached load state: ${state}`);
  }

  /**
   * Wait until network activity has settled.
   * @param {import('@playwright/test').Page} page
   * @param {number} [timeout]
   */
  async waitForNetworkIdle(page, timeout = DEFAULT_TIMEOUT_MS) {
    logger.debug("Waiting for network idle");
    await page.waitForLoadState("networkidle", { timeout });
    logger.debug("Network is idle");
  }

  /**
   * Wait for the page URL to match a pattern.
   * @param {import('@playwright/test').Page} page
   * @param {string | RegExp} urlPattern
   * @param {number} [timeout]
   */
  async waitForURL(page, urlPattern, timeout = DEFAULT_TIMEOUT_MS) {
    logger.debug(`Waiting for URL matching: ${urlPattern}`);
    await page.waitForURL(urlPattern, { timeout });
    logger.debug(`URL matched: ${page.url()}`);
  }

  /**
   * Wait for a network response matching the given URL pattern.
   * @param {import('@playwright/test').Page} page
   * @param {string | RegExp} urlPattern
   * @param {number} [timeout]
   * @returns {Promise<import('@playwright/test').Response>}
   */
  async waitForResponse(page, urlPattern, timeout = DEFAULT_TIMEOUT_MS) {
    logger.debug(`Waiting for response matching: ${urlPattern}`);
    const response = await page.waitForResponse(urlPattern, { timeout });
    logger.debug(`Response received: ${response.status()} ${response.url()}`);
    return response;
  }

  /**
   * Wait for a selector to reach a given state on the page.
   * @param {import('@playwright/test').Page} page
   * @param {string} selector
   * @param {object} [options] - state, timeout, strict
   */
  async waitForSelector(page, selector, options = {}) {
    const opts = { timeout: DEFAULT_TIMEOUT_MS, ...options };
    logger.debug(`Waiting for selector: ${selector}`);
    await page.waitForSelector(selector, opts);
    logger.debug(`Selector found: ${selector}`);
  }

  /**
   * Explicit wait — use sparingly. Prefer event-driven waits.
   * @param {number} ms
   */
  async waitForTimeout(ms) {
    logger.warn(`Explicit wait for ${ms}ms — consider replacing with an event-driven wait`);
    await new Promise((resolve) => setTimeout(resolve, ms));
    logger.debug(`Explicit wait of ${ms}ms completed`);
  }
}

export default new WaitActions();
