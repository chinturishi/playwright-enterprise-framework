import logger from "../logging/logger.js";

class KeyboardActions {
  /**
   * Press a single key (e.g. Enter, Tab, Escape, ArrowDown).
   * @param {import('@playwright/test').Page} page
   * @param {string} key - Key name per Playwright key reference
   */
  async press(page, key) {
    logger.info(`Pressing key: ${key}`);
    await page.keyboard.press(key);
    logger.info(`Key pressed: ${key}`);
  }

  /**
   * Type text via the keyboard (dispatches keydown/keypress/keyup per character).
   * @param {import('@playwright/test').Page} page
   * @param {string} text
   * @param {object} [options] - { delay } between keystrokes in ms
   */
  async type(page, text, options = {}) {
    logger.info(`Typing text via keyboard (length: ${text.length})`);
    await page.keyboard.type(text, options);
    logger.info("Keyboard type completed");
  }

  /**
   * Execute a keyboard shortcut (e.g. Control+A, Meta+C).
   * @param {import('@playwright/test').Page} page
   * @param {...string} keys - Modifier(s) and key, e.g. 'Control', 'a'
   */
  async shortcut(page, ...keys) {
    const combo = keys.join("+");
    logger.info(`Executing keyboard shortcut: ${combo}`);
    await page.keyboard.press(combo);
    logger.info(`Shortcut executed: ${combo}`);
  }

  /**
   * Hold a key down.
   * @param {import('@playwright/test').Page} page
   * @param {string} key
   */
  async keyDown(page, key) {
    logger.debug(`Key down: ${key}`);
    await page.keyboard.down(key);
  }

  /**
   * Release a held key.
   * @param {import('@playwright/test').Page} page
   * @param {string} key
   */
  async keyUp(page, key) {
    logger.debug(`Key up: ${key}`);
    await page.keyboard.up(key);
  }

  /**
   * Select all content (Ctrl/Cmd + A).
   * @param {import('@playwright/test').Page} page
   */
  async selectAll(page) {
    logger.info("Selecting all (Control+A)");
    await page.keyboard.press("Control+A");
    logger.info("Select all completed");
  }

  /**
   * Copy selection to clipboard (Ctrl/Cmd + C).
   * @param {import('@playwright/test').Page} page
   */
  async copy(page) {
    logger.info("Copying selection (Control+C)");
    await page.keyboard.press("Control+C");
    logger.info("Copy completed");
  }

  /**
   * Paste from clipboard (Ctrl/Cmd + V).
   * @param {import('@playwright/test').Page} page
   */
  async paste(page) {
    logger.info("Pasting from clipboard (Control+V)");
    await page.keyboard.press("Control+V");
    logger.info("Paste completed");
  }

  /**
   * Undo last action (Ctrl/Cmd + Z).
   * @param {import('@playwright/test').Page} page
   */
  async undo(page) {
    logger.info("Undoing last action (Control+Z)");
    await page.keyboard.press("Control+Z");
    logger.info("Undo completed");
  }
}

export default new KeyboardActions();
