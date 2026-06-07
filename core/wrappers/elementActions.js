import logger from "../logging/logger.js";
import waitActions from "./waitActions.js";

class ElementActions {
  /**
   * Auto-wait for visibility then click.
   * @param {import('@playwright/test').Locator} locator
   * @param {object} [options] - Playwright click options (force, button, modifiers, position, etc.)
   */
  async click(locator, options = {}) {
    logger.info("Performing click");
    await waitActions.waitForVisible(locator);
    await locator.click(options);
    logger.info("Click completed");
  }

  /**
   * Auto-wait then double-click.
   * @param {import('@playwright/test').Locator} locator
   * @param {object} [options]
   */
  async doubleClick(locator, options = {}) {
    logger.info("Performing double-click");
    await waitActions.waitForVisible(locator);
    await locator.dblclick(options);
    logger.info("Double-click completed");
  }

  /**
   * Auto-wait, clear existing value, then fill with text.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} text
   */
  async fill(locator, text) {
    logger.info(`Filling field with text (length: ${text.length})`);
    await waitActions.waitForVisible(locator);
    await locator.fill(text);
    logger.info("Fill completed");
  }

  /**
   * Type text character by character with optional delay.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} text
   * @param {object} [options] - { delay } in ms between keystrokes
   */
  async type(locator, text, options = {}) {
    logger.info(`Typing text character-by-character (length: ${text.length})`);
    await waitActions.waitForVisible(locator);
    await locator.pressSequentially(text, options);
    logger.info("Type completed");
  }

  /**
   * Clear an input field.
   * @param {import('@playwright/test').Locator} locator
   */
  async clear(locator) {
    logger.info("Clearing field");
    await waitActions.waitForVisible(locator);
    await locator.clear();
    logger.info("Field cleared");
  }

  /**
   * Get the textContent of an element.
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<string | null>}
   */
  async getText(locator) {
    logger.debug("Getting textContent");
    await waitActions.waitForVisible(locator);
    const text = await locator.textContent();
    logger.debug(`textContent retrieved (length: ${text?.length ?? 0})`);
    return text;
  }

  /**
   * Get the innerText of an element.
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<string>}
   */
  async getInnerText(locator) {
    logger.debug("Getting innerText");
    await waitActions.waitForVisible(locator);
    const text = await locator.innerText();
    logger.debug(`innerText retrieved (length: ${text.length})`);
    return text;
  }

  /**
   * Get the current value of an input element.
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<string>}
   */
  async getInputValue(locator) {
    logger.debug("Getting input value");
    await waitActions.waitForVisible(locator);
    const value = await locator.inputValue();
    logger.debug(`Input value retrieved (length: ${value.length})`);
    return value;
  }

  /**
   * Get an attribute value from an element.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} name - Attribute name
   * @returns {Promise<string | null>}
   */
  async getAttribute(locator, name) {
    logger.debug(`Getting attribute: ${name}`);
    const value = await locator.getAttribute(name);
    logger.debug(`Attribute ${name} = ${value}`);
    return value;
  }

  /**
   * Check whether the element is visible.
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<boolean>}
   */
  async isVisible(locator) {
    const visible = await locator.isVisible();
    logger.debug(`Element visible: ${visible}`);
    return visible;
  }

  /**
   * Check whether the element is enabled.
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<boolean>}
   */
  async isEnabled(locator) {
    const enabled = await locator.isEnabled();
    logger.debug(`Element enabled: ${enabled}`);
    return enabled;
  }

  /**
   * Check whether a checkbox/radio is checked.
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<boolean>}
   */
  async isChecked(locator) {
    const checked = await locator.isChecked();
    logger.debug(`Element checked: ${checked}`);
    return checked;
  }

  /**
   * Check a checkbox (no-op if already checked).
   * @param {import('@playwright/test').Locator} locator
   */
  async check(locator) {
    logger.info("Checking checkbox");
    await waitActions.waitForVisible(locator);
    await locator.check();
    logger.info("Checkbox checked");
  }

  /**
   * Uncheck a checkbox (no-op if already unchecked).
   * @param {import('@playwright/test').Locator} locator
   */
  async uncheck(locator) {
    logger.info("Unchecking checkbox");
    await waitActions.waitForVisible(locator);
    await locator.uncheck();
    logger.info("Checkbox unchecked");
  }

  /**
   * Select an option from a dropdown.
   * @param {import('@playwright/test').Locator} locator
   * @param {string | string[] | object} value - Value, label, or option object
   */
  async selectOption(locator, value) {
    logger.info(`Selecting option: ${JSON.stringify(value)}`);
    await waitActions.waitForVisible(locator);
    await locator.selectOption(value);
    logger.info("Option selected");
  }

  /**
   * Hover over an element.
   * @param {import('@playwright/test').Locator} locator
   */
  async hover(locator) {
    logger.info("Hovering over element");
    await waitActions.waitForVisible(locator);
    await locator.hover();
    logger.info("Hover completed");
  }

  /**
   * Focus an element.
   * @param {import('@playwright/test').Locator} locator
   */
  async focus(locator) {
    logger.info("Focusing element");
    await waitActions.waitForVisible(locator);
    await locator.focus();
    logger.info("Element focused");
  }

  /**
   * Scroll the element into the visible viewport.
   * @param {import('@playwright/test').Locator} locator
   */
  async scrollIntoView(locator) {
    logger.info("Scrolling element into view");
    await locator.scrollIntoViewIfNeeded();
    logger.info("Element scrolled into view");
  }

  /**
   * Return the count of elements matching the locator.
   * @param {import('@playwright/test').Locator} locator
   * @returns {Promise<number>}
   */
  async count(locator) {
    const n = await locator.count();
    logger.debug(`Element count: ${n}`);
    return n;
  }
}

export default new ElementActions();
