import logger from "../../core/logging/logger.js";

class LocatorHealer {
  constructor() {
    this.healingHistory = [];
  }

  /**
   * Attempt to heal a failed locator by analyzing the page DOM.
   * @param {string} failedLocator - The selector that failed
   * @param {object} page - Playwright page object
   */
  async heal(failedLocator, page) {
    logger.info(`[LocatorHealer] Attempting to heal: ${failedLocator}`);
    const alternatives = await this.findAlternatives(failedLocator, page);

    for (const alt of alternatives) {
      const valid = await this.validateHealing(alt, page);
      if (valid) {
        this.healingHistory.push({
          original: failedLocator,
          healed: alt,
          timestamp: new Date().toISOString(),
          success: true,
        });
        logger.info(`[LocatorHealer] Healed "${failedLocator}" -> "${alt}"`);
        return { success: true, original: failedLocator, healed: alt };
      }
    }

    this.healingHistory.push({
      original: failedLocator,
      healed: null,
      timestamp: new Date().toISOString(),
      success: false,
    });
    return { success: false, original: failedLocator, healed: null, alternatives };
  }

  /**
   * Find alternative selectors for a failed one.
   * @param {string} selector @param {object} page
   */
  async findAlternatives(selector, page) {
    const alternatives = [];
    try {
      const elements = await page.$$("*");
      const sampleSize = Math.min(elements.length, 500);
      for (let i = 0; i < sampleSize; i++) {
        const el = elements[i];
        const testId = await el.getAttribute("data-testid").catch(() => null);
        if (testId) alternatives.push(`[data-testid="${testId}"]`);

        const ariaLabel = await el.getAttribute("aria-label").catch(() => null);
        if (ariaLabel) alternatives.push(`[aria-label="${ariaLabel}"]`);

        const id = await el.getAttribute("id").catch(() => null);
        if (id) alternatives.push(`#${id}`);
      }
    } catch (err) {
      logger.warn(`[LocatorHealer] DOM analysis failed: ${err.message}`);
    }

    if (selector.startsWith("//") || selector.startsWith("xpath=")) {
      alternatives.push(selector.replace(/\/div\[\d+\]/g, "/div"));
    }
    return [...new Set(alternatives)].slice(0, 10);
  }

  /**
   * Verify a healed locator resolves to an element.
   * @param {string} newLocator @param {object} page
   */
  async validateHealing(newLocator, page) {
    try {
      const count = await page.locator(newLocator).count();
      return count === 1;
    } catch {
      return false;
    }
  }

  /** @returns {Array} History of all healing attempts */
  getHealingHistory() {
    return [...this.healingHistory];
  }
}

export default new LocatorHealer();
