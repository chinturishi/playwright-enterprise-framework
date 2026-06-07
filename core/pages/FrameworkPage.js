import logger from "../logging/logger.js";
import locatorUtils from "../utils/locatorUtils.js";
import {
  NavigationError,
  LocatorNotFoundError,
} from "../errors/FrameworkError.js";

/**
 * Full abstraction over Playwright's Page object. Consumers interact with this
 * class instead of the raw Playwright page — all locator resolution, element
 * actions, keyboard input, waits, and navigation are provided here so that no
 * Playwright imports are needed in consuming test code.
 *
 * Locator descriptors are plain objects:
 *   { role, options }   → page.getByRole()
 *   { testId }          → page.getByTestId()
 *   { text }            → page.getByText()
 *   { label }           → page.getByLabel()
 *   { placeholder }     → page.getByPlaceholder()
 *   { css }             → page.locator(css)
 *   { xpath }           → page.locator('xpath=...')
 *   string              → page.locator(string)
 */
class FrameworkPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this._page = page;
  }

  // ---------------------------------------------------------------------------
  // Locator resolution
  // ---------------------------------------------------------------------------

  /**
   * Resolve a descriptor into a Playwright Locator.
   * @param {string|object|import('@playwright/test').Locator} descriptor
   * @returns {import('@playwright/test').Locator}
   */
  locate(descriptor) {
    if (!descriptor) {
      throw new LocatorNotFoundError(descriptor);
    }

    if (typeof descriptor.click === "function") {
      return descriptor;
    }

    if (typeof descriptor === "string") {
      return this._page.locator(descriptor);
    }

    if (descriptor.role) {
      return locatorUtils.byRole(this._page, descriptor.role, descriptor.options || {});
    }
    if (descriptor.testId) {
      return locatorUtils.byTestId(this._page, descriptor.testId);
    }
    if (descriptor.text) {
      return locatorUtils.byText(this._page, descriptor.text);
    }
    if (descriptor.label) {
      return locatorUtils.byLabel(this._page, descriptor.label);
    }
    if (descriptor.placeholder) {
      return locatorUtils.byPlaceholder(this._page, descriptor.placeholder);
    }
    if (descriptor.css) {
      return this._page.locator(descriptor.css);
    }
    if (descriptor.xpath) {
      return this._page.locator(`xpath=${descriptor.xpath}`);
    }

    throw new LocatorNotFoundError(descriptor);
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async navigate(url, options = {}) {
    try {
      logger.info(`Navigating to: ${url}`);
      await this._page.goto(url, options);
      logger.info(`Navigation complete: ${url}`);
    } catch (error) {
      throw new NavigationError(url, error.message, { cause: error });
    }
  }

  async reload(options = {}) {
    logger.info("Reloading page");
    await this._page.reload(options);
  }

  async goBack(options = {}) {
    logger.info("Navigating back");
    await this._page.goBack(options);
  }

  async goForward(options = {}) {
    logger.info("Navigating forward");
    await this._page.goForward(options);
  }

  getUrl() {
    return this._page.url();
  }

  async getTitle() {
    return this._page.title();
  }

  // ---------------------------------------------------------------------------
  // Element actions
  // ---------------------------------------------------------------------------

  async click(descriptor, options = {}) {
    const locator = this.locate(descriptor);
    logger.info(`Clicking: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.click(options);
  }

  async doubleClick(descriptor, options = {}) {
    const locator = this.locate(descriptor);
    logger.info(`Double-clicking: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.dblclick(options);
  }

  async fill(descriptor, text) {
    const locator = this.locate(descriptor);
    logger.info(`Filling: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.fill(text);
  }

  async type(descriptor, text, options = {}) {
    const locator = this.locate(descriptor);
    logger.info(`Typing into: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.pressSequentially(text, options);
  }

  async clear(descriptor) {
    const locator = this.locate(descriptor);
    logger.info(`Clearing: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.clear();
  }

  async selectOption(descriptor, value) {
    const locator = this.locate(descriptor);
    logger.info(`Selecting option on: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.selectOption(value);
  }

  async check(descriptor) {
    const locator = this.locate(descriptor);
    logger.info(`Checking: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.check();
  }

  async uncheck(descriptor) {
    const locator = this.locate(descriptor);
    logger.info(`Unchecking: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.uncheck();
  }

  async hover(descriptor) {
    const locator = this.locate(descriptor);
    logger.info(`Hovering: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.hover();
  }

  async focus(descriptor) {
    const locator = this.locate(descriptor);
    logger.info(`Focusing: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible" });
    await locator.focus();
  }

  async scrollIntoView(descriptor) {
    const locator = this.locate(descriptor);
    logger.info(`Scrolling into view: ${_describe(descriptor)}`);
    await locator.scrollIntoViewIfNeeded();
  }

  // ---------------------------------------------------------------------------
  // Element state
  // ---------------------------------------------------------------------------

  async getText(descriptor) {
    const locator = this.locate(descriptor);
    return locator.textContent();
  }

  async getInnerText(descriptor) {
    const locator = this.locate(descriptor);
    return locator.innerText();
  }

  async getInputValue(descriptor) {
    const locator = this.locate(descriptor);
    return locator.inputValue();
  }

  async getAttribute(descriptor, name) {
    const locator = this.locate(descriptor);
    return locator.getAttribute(name);
  }

  async isVisible(descriptor) {
    const locator = this.locate(descriptor);
    return locator.isVisible();
  }

  async isEnabled(descriptor) {
    const locator = this.locate(descriptor);
    return locator.isEnabled();
  }

  async isChecked(descriptor) {
    const locator = this.locate(descriptor);
    return locator.isChecked();
  }

  async count(descriptor) {
    const locator = this.locate(descriptor);
    return locator.count();
  }

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------

  async pressKey(key) {
    logger.info(`Pressing key: ${key}`);
    await this._page.keyboard.press(key);
  }

  async typeText(text, options = {}) {
    logger.info(`Typing via keyboard (length: ${text.length})`);
    await this._page.keyboard.type(text, options);
  }

  async shortcut(...keys) {
    const combo = keys.join("+");
    logger.info(`Keyboard shortcut: ${combo}`);
    await this._page.keyboard.press(combo);
  }

  // ---------------------------------------------------------------------------
  // Mouse
  // ---------------------------------------------------------------------------

  async mouseClick(x, y) {
    logger.info(`Mouse click at (${x}, ${y})`);
    await this._page.mouse.click(x, y);
  }

  async mouseMove(x, y) {
    await this._page.mouse.move(x, y);
  }

  async mouseWheel(deltaX, deltaY) {
    logger.info(`Mouse wheel (dx: ${deltaX}, dy: ${deltaY})`);
    await this._page.mouse.wheel(deltaX, deltaY);
  }

  // ---------------------------------------------------------------------------
  // Drag & Drop
  // ---------------------------------------------------------------------------

  async dragAndDrop(sourceDescriptor, targetDescriptor, options = {}) {
    const source = this.locate(sourceDescriptor);
    const target = this.locate(targetDescriptor);
    logger.info(`Drag-and-drop: ${_describe(sourceDescriptor)} → ${_describe(targetDescriptor)}`);
    await source.dragTo(target, options);
  }

  // ---------------------------------------------------------------------------
  // File upload
  // ---------------------------------------------------------------------------

  async uploadFile(descriptor, filePath) {
    const locator = this.locate(descriptor);
    logger.info(`Uploading file: ${filePath}`);
    await locator.setInputFiles(filePath);
  }

  async uploadFiles(descriptor, filePaths) {
    const locator = this.locate(descriptor);
    logger.info(`Uploading ${filePaths.length} file(s)`);
    await locator.setInputFiles(filePaths);
  }

  // ---------------------------------------------------------------------------
  // Waits
  // ---------------------------------------------------------------------------

  async waitForPageLoad(state = "load") {
    logger.info(`Waiting for page load state: ${state}`);
    await this._page.waitForLoadState(state);
  }

  async waitForVisible(descriptor, options = {}) {
    const locator = this.locate(descriptor);
    logger.info(`Waiting for visible: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "visible", ...options });
  }

  async waitForHidden(descriptor, options = {}) {
    const locator = this.locate(descriptor);
    logger.info(`Waiting for hidden: ${_describe(descriptor)}`);
    await locator.waitFor({ state: "hidden", ...options });
  }

  async waitForUrl(url, options = {}) {
    logger.info(`Waiting for URL: ${url}`);
    await this._page.waitForURL(url, options);
  }

  async waitForResponse(urlOrPredicate, options = {}) {
    logger.info("Waiting for network response");
    return this._page.waitForResponse(urlOrPredicate, options);
  }

  async waitForTimeout(ms) {
    await this._page.waitForTimeout(ms);
  }

  // ---------------------------------------------------------------------------
  // Screenshots
  // ---------------------------------------------------------------------------

  async screenshot(options = {}) {
    logger.info("Taking page screenshot");
    return this._page.screenshot(options);
  }

  async screenshotElement(descriptor, options = {}) {
    const locator = this.locate(descriptor);
    logger.info(`Taking element screenshot: ${_describe(descriptor)}`);
    return locator.screenshot(options);
  }

  // ---------------------------------------------------------------------------
  // Dialogs
  // ---------------------------------------------------------------------------

  onDialog(handler) {
    this._page.on("dialog", handler);
  }

  // ---------------------------------------------------------------------------
  // Frames
  // ---------------------------------------------------------------------------

  frame(nameOrUrl) {
    return this._page.frame(nameOrUrl);
  }

  frameLocator(selector) {
    return this._page.frameLocator(selector);
  }

  // ---------------------------------------------------------------------------
  // Evaluate
  // ---------------------------------------------------------------------------

  async evaluate(fn, arg) {
    return this._page.evaluate(fn, arg);
  }

  // ---------------------------------------------------------------------------
  // Escape hatch — consumers should prefer framework methods above
  // ---------------------------------------------------------------------------

  get rawPage() {
    logger.warn("Accessing raw Playwright page — prefer framework methods");
    return this._page;
  }
}

// ---------------------------------------------------------------------------
// Private helper
// ---------------------------------------------------------------------------

function _describe(descriptor) {
  if (typeof descriptor === "string") return descriptor;
  if (descriptor.role) {
    const name = descriptor.options?.name;
    return `role="${descriptor.role}"${name ? ` name="${name}"` : ""}`;
  }
  if (descriptor.testId) return `testId="${descriptor.testId}"`;
  if (descriptor.text) return `text="${descriptor.text}"`;
  if (descriptor.label) return `label="${descriptor.label}"`;
  if (descriptor.css) return `css="${descriptor.css}"`;
  return JSON.stringify(descriptor);
}

export default FrameworkPage;
