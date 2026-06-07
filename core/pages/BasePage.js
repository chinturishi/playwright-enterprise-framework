import { LocatorNotFoundError } from "../errors/FrameworkError.js";

/**
 * Base class for consumer page objects. Subclasses define a `locators` map of
 * plain descriptor objects and call action methods by locator **name** — no
 * Playwright imports needed.
 *
 * @example
 *   import { BasePage } from 'playwright-enterprise-framework';
 *
 *   class LoginPage extends BasePage {
 *     locators = {
 *       username: { testId: 'username-input' },
 *       password: { testId: 'password-input' },
 *       submit:   { role: 'button', options: { name: 'Sign in' } },
 *     };
 *
 *     async login(user, pass) {
 *       await this.fill('username', user);
 *       await this.fill('password', pass);
 *       await this.click('submit');
 *     }
 *   }
 *
 *   // In test:
 *   test('login', async ({ frameworkPage }) => {
 *     const loginPage = new LoginPage(frameworkPage);
 *     await loginPage.navigate('https://app.example.com/login');
 *     await loginPage.login('admin', 's3cret');
 *   });
 */
export class BasePage {
  /**
   * @param {import('./FrameworkPage.js').default} frameworkPage
   */
  constructor(frameworkPage) {
    this.page = frameworkPage;
  }

  // ---------------------------------------------------------------------------
  // Locator helpers
  // ---------------------------------------------------------------------------

  /**
   * Resolve a locator name to its descriptor, then to a Playwright Locator.
   * @param {string} name - Key from the subclass `locators` map
   */
  getLocator(name) {
    const descriptor = this.locators?.[name];
    if (!descriptor) {
      throw new LocatorNotFoundError(
        `"${name}" is not defined in ${this.constructor.name}.locators`
      );
    }
    return this.page.locate(descriptor);
  }

  /** @private Resolve descriptor — throws if name not in map. */
  _descriptor(name) {
    const d = this.locators?.[name];
    if (!d) {
      throw new LocatorNotFoundError(
        `"${name}" is not defined in ${this.constructor.name}.locators`
      );
    }
    return d;
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async navigate(url) {
    return this.page.navigate(url);
  }

  async reload(options) {
    return this.page.reload(options);
  }

  async goBack(options) {
    return this.page.goBack(options);
  }

  async goForward(options) {
    return this.page.goForward(options);
  }

  getUrl() {
    return this.page.getUrl();
  }

  async getTitle() {
    return this.page.getTitle();
  }

  // ---------------------------------------------------------------------------
  // Element actions — accept locator **name** (string key into this.locators)
  // ---------------------------------------------------------------------------

  async click(name, options) {
    return this.page.click(this._descriptor(name), options);
  }

  async doubleClick(name, options) {
    return this.page.doubleClick(this._descriptor(name), options);
  }

  async fill(name, text) {
    return this.page.fill(this._descriptor(name), text);
  }

  async type(name, text, options) {
    return this.page.type(this._descriptor(name), text, options);
  }

  async clear(name) {
    return this.page.clear(this._descriptor(name));
  }

  async selectOption(name, value) {
    return this.page.selectOption(this._descriptor(name), value);
  }

  async check(name) {
    return this.page.check(this._descriptor(name));
  }

  async uncheck(name) {
    return this.page.uncheck(this._descriptor(name));
  }

  async hover(name) {
    return this.page.hover(this._descriptor(name));
  }

  async focus(name) {
    return this.page.focus(this._descriptor(name));
  }

  async scrollIntoView(name) {
    return this.page.scrollIntoView(this._descriptor(name));
  }

  // ---------------------------------------------------------------------------
  // Element state
  // ---------------------------------------------------------------------------

  async getText(name) {
    return this.page.getText(this._descriptor(name));
  }

  async getInnerText(name) {
    return this.page.getInnerText(this._descriptor(name));
  }

  async getInputValue(name) {
    return this.page.getInputValue(this._descriptor(name));
  }

  async getAttribute(name, attribute) {
    return this.page.getAttribute(this._descriptor(name), attribute);
  }

  async isVisible(name) {
    return this.page.isVisible(this._descriptor(name));
  }

  async isEnabled(name) {
    return this.page.isEnabled(this._descriptor(name));
  }

  async isChecked(name) {
    return this.page.isChecked(this._descriptor(name));
  }

  async count(name) {
    return this.page.count(this._descriptor(name));
  }

  // ---------------------------------------------------------------------------
  // Keyboard / Waits / Screenshot — delegated to FrameworkPage
  // ---------------------------------------------------------------------------

  async pressKey(key) {
    return this.page.pressKey(key);
  }

  async waitForPageLoad(state) {
    return this.page.waitForPageLoad(state);
  }

  async waitForVisible(name, options) {
    return this.page.waitForVisible(this._descriptor(name), options);
  }

  async waitForHidden(name, options) {
    return this.page.waitForHidden(this._descriptor(name), options);
  }

  async waitForUrl(url, options) {
    return this.page.waitForUrl(url, options);
  }

  async screenshot(options) {
    return this.page.screenshot(options);
  }

  // ---------------------------------------------------------------------------
  // File upload
  // ---------------------------------------------------------------------------

  async uploadFile(name, filePath) {
    return this.page.uploadFile(this._descriptor(name), filePath);
  }

  // ---------------------------------------------------------------------------
  // Drag & drop
  // ---------------------------------------------------------------------------

  async dragAndDrop(sourceName, targetName, options) {
    return this.page.dragAndDrop(
      this._descriptor(sourceName),
      this._descriptor(targetName),
      options
    );
  }
}

export default BasePage;
