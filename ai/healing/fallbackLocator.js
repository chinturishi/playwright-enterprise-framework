import logger from "../../core/logging/logger.js";

class FallbackLocator {
  /**
   * @param {string} primarySelector - Main selector to try first
   * @param {string[]} [fallbacks] - Ordered list of fallback selectors
   */
  constructor(primarySelector, fallbacks = []) {
    this.primarySelector = primarySelector;
    this.fallbacks = [...fallbacks];
    this.usedSelector = null;
  }

  /**
   * Try the primary selector, then each fallback until one resolves.
   * @param {object} page - Playwright page object
   * @returns {Promise<import('@playwright/test').Locator>}
   */
  async locate(page) {
    const chain = [this.primarySelector, ...this.fallbacks];
    for (const selector of chain) {
      try {
        const locator = page.locator(selector);
        const count = await locator.count();
        if (count > 0) {
          this.usedSelector = selector;
          if (selector !== this.primarySelector) {
            logger.warn(`[FallbackLocator] Primary "${this.primarySelector}" failed, used fallback "${selector}"`);
          }
          return locator;
        }
      } catch {
        continue;
      }
    }
    throw new Error(`[FallbackLocator] All selectors failed: ${chain.join(", ")}`);
  }

  /** @param {string} selector */
  addFallback(selector) {
    this.fallbacks.push(selector);
  }

  /** @returns {string|null} The selector that successfully resolved */
  getUsedSelector() {
    return this.usedSelector;
  }
}

export default FallbackLocator;
