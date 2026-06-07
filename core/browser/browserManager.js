import { chromium, firefox, webkit } from "@playwright/test";
import logger from "../logging/logger.js";

const browserTypes = { chromium, firefox, webkit };

class BrowserManager {
  constructor() {
    this.browser = null;
    this.browserType = null;
  }

  /**
   * Launch a Playwright browser instance.
   * @param {string} browserType - One of 'chromium', 'firefox', 'webkit'
   * @param {object} options - Launch options (headless, slowMo, args, etc.)
   * @returns {Promise<import('@playwright/test').Browser>}
   */
  async launchBrowser(browserType = "chromium", options = {}) {
    const engine = browserTypes[browserType];
    if (!engine) {
      throw new Error(`Unsupported browser type: ${browserType}. Use chromium, firefox, or webkit.`);
    }

    logger.info(`Launching ${browserType} browser`);

    const launchOptions = {
      headless: options.headless ?? true,
      slowMo: options.slowMo ?? 0,
      args: options.args ?? [],
      ...options,
    };

    this.browser = await engine.launch(launchOptions);
    this.browserType = browserType;

    logger.info(`${browserType} browser launched successfully (pid: ${this.browser.process?.()?.pid ?? 'N/A'})`);
    return this.browser;
  }

  /**
   * Connect to a remote browser via WebSocket endpoint.
   * @param {string} wsEndpoint - WebSocket URL of the remote browser
   * @param {object} options - Connection options
   * @returns {Promise<import('@playwright/test').Browser>}
   */
  async connectBrowser(wsEndpoint, options = {}) {
    logger.info(`Connecting to remote browser at ${wsEndpoint}`);

    this.browser = await chromium.connect(wsEndpoint, options);
    this.browserType = "remote";

    logger.info("Connected to remote browser successfully");
    return this.browser;
  }

  /**
   * Gracefully close the current browser instance.
   */
  async closeBrowser() {
    if (!this.browser) {
      logger.warn("No browser instance to close");
      return;
    }

    logger.info(`Closing ${this.browserType} browser`);

    try {
      await this.browser.close();
      logger.info("Browser closed successfully");
    } catch (error) {
      logger.error(`Error closing browser: ${error.message}`);
      throw error;
    } finally {
      this.browser = null;
      this.browserType = null;
    }
  }

  /**
   * Return the current browser instance.
   * @returns {import('@playwright/test').Browser | null}
   */
  getBrowser() {
    if (!this.browser) {
      logger.warn("No active browser instance");
    }
    return this.browser;
  }

  /**
   * Check whether the browser is still connected.
   * @returns {boolean}
   */
  isConnected() {
    const connected = this.browser?.isConnected() ?? false;
    logger.debug(`Browser connected: ${connected}`);
    return connected;
  }
}

export { BrowserManager };
export default new BrowserManager();
