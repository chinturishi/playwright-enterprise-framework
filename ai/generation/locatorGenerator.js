import logger from "../../core/logging/logger.js";

const STRATEGY_PRIORITY = ["data-testid", "role", "aria-label", "placeholder", "id", "css"];

class LocatorGenerator {
  /**
   * Generate the best Playwright locator for a specific element.
   * @param {object} page @param {object} element - Element handle
   */
  async generate(page, element) {
    const attrs = await element.evaluate((el) => ({
      tagName: el.tagName.toLowerCase(),
      id: el.id,
      testId: el.getAttribute("data-testid"),
      role: el.getAttribute("role"),
      ariaLabel: el.getAttribute("aria-label"),
      placeholder: el.placeholder || "",
      name: el.name || "",
      text: el.textContent?.trim().slice(0, 50) || "",
      classes: el.className || "",
    }));

    const locators = [];
    if (attrs.testId) locators.push({ strategy: "data-testid", locator: `[data-testid="${attrs.testId}"]`, score: 95 });
    if (attrs.role && attrs.ariaLabel) locators.push({ strategy: "role", locator: `role=${attrs.role}[name="${attrs.ariaLabel}"]`, score: 90 });
    if (attrs.ariaLabel) locators.push({ strategy: "aria-label", locator: `[aria-label="${attrs.ariaLabel}"]`, score: 85 });
    if (attrs.placeholder) locators.push({ strategy: "placeholder", locator: `[placeholder="${attrs.placeholder}"]`, score: 75 });
    if (attrs.id) locators.push({ strategy: "id", locator: `#${attrs.id}`, score: 65 });
    if (attrs.text && attrs.tagName !== "div") locators.push({ strategy: "text", locator: `text="${attrs.text}"`, score: 60 });

    return this.rankByStability(locators)[0] || { strategy: "css", locator: attrs.tagName, score: 20 };
  }

  /**
   * Generate locators for all interactive elements on the page.
   * @param {object} page
   */
  async generateAll(page) {
    const elements = await page.$$("input, button, select, textarea, a[href], [role='button'], [data-testid]");
    const results = [];
    for (const el of elements.slice(0, 50)) {
      try {
        results.push(await this.generate(page, el));
      } catch {
        continue;
      }
    }
    logger.info(`[LocatorGenerator] Generated ${results.length} locators`);
    return results;
  }

  /**
   * Rank locators by stability score descending.
   * @param {Array<{ locator: string, score: number }>} locators
   */
  rankByStability(locators) {
    return [...locators].sort((a, b) => b.score - a.score);
  }
}

export default new LocatorGenerator();
