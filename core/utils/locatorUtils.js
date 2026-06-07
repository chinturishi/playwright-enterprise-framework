import logger from "../logging/logger.js";

class LocatorUtils {
  constructor() {
    if (LocatorUtils._instance) return LocatorUtils._instance;
    LocatorUtils._instance = this;
  }

  /**
   * Locates an element by its ARIA role.
   * @param {import('@playwright/test').Page} page
   * @param {string} role - e.g. "button", "heading", "link"
   * @param {{ name?: string|RegExp, exact?: boolean }} [options]
   * @returns {import('@playwright/test').Locator}
   */
  byRole(page, role, options = {}) {
    logger.debug(`Locating by role: ${role} ${options.name ? `name="${options.name}"` : ""}`);
    return page.getByRole(role, options);
  }

  /**
   * Locates an element by its data-testid attribute.
   * @param {import('@playwright/test').Page} page
   * @param {string} testId
   * @returns {import('@playwright/test').Locator}
   */
  byTestId(page, testId) {
    logger.debug(`Locating by testId: ${testId}`);
    return page.getByTestId(testId);
  }

  /**
   * Locates an element by visible text content.
   * @param {import('@playwright/test').Page} page
   * @param {string|RegExp} text
   * @returns {import('@playwright/test').Locator}
   */
  byText(page, text) {
    logger.debug(`Locating by text: ${text}`);
    return page.getByText(text);
  }

  /**
   * Locates a form element by its associated label text.
   * @param {import('@playwright/test').Page} page
   * @param {string|RegExp} label
   * @returns {import('@playwright/test').Locator}
   */
  byLabel(page, label) {
    logger.debug(`Locating by label: ${label}`);
    return page.getByLabel(label);
  }

  /**
   * Locates an input by its placeholder text.
   * @param {import('@playwright/test').Page} page
   * @param {string|RegExp} text
   * @returns {import('@playwright/test').Locator}
   */
  byPlaceholder(page, text) {
    logger.debug(`Locating by placeholder: ${text}`);
    return page.getByPlaceholder(text);
  }

  /**
   * Builds a CSS or XPath selector string from a strategy name and value.
   * @param {"css"|"xpath"|"id"|"testid"|"text"} strategy
   * @param {string} value
   * @returns {string} Playwright-compatible selector
   */
  buildSelector(strategy, value) {
    const strategies = {
      css: value,
      xpath: `xpath=${value}`,
      id: `#${value}`,
      testid: `[data-testid="${value}"]`,
      text: `text=${value}`
    };
    const selector = strategies[strategy];
    if (!selector) {
      throw new Error(`Unknown locator strategy: "${strategy}". Use: ${Object.keys(strategies).join(", ")}`);
    }
    logger.debug(`Built selector [${strategy}]: ${selector}`);
    return selector;
  }
}

const locatorUtils = new LocatorUtils();
export default locatorUtils;
