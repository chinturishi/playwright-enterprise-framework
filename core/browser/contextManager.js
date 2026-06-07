import logger from "../logging/logger.js";

class ContextManager {
  constructor() {
    this.context = null;
  }

  /**
   * Create a new BrowserContext with configurable options.
   * @param {import('@playwright/test').Browser} browser
   * @param {object} options - viewport, locale, permissions, storageState, extraHTTPHeaders, etc.
   * @returns {Promise<import('@playwright/test').BrowserContext>}
   */
  async createContext(browser, options = {}) {
    logger.info("Creating new browser context");

    const contextOptions = {
      viewport: options.viewport ?? { width: 1280, height: 720 },
      locale: options.locale,
      permissions: options.permissions,
      storageState: options.storageState,
      extraHTTPHeaders: options.extraHTTPHeaders,
      ignoreHTTPSErrors: options.ignoreHTTPSErrors ?? false,
      colorScheme: options.colorScheme,
      geolocation: options.geolocation,
      timezoneId: options.timezoneId,
      userAgent: options.userAgent,
      ...options,
    };

    this.context = await browser.newContext(contextOptions);
    logger.info("Browser context created successfully");
    return this.context;
  }

  /**
   * Gracefully close a browser context.
   * @param {import('@playwright/test').BrowserContext} [context]
   */
  async closeContext(context) {
    const target = context ?? this.context;
    if (!target) {
      logger.warn("No browser context to close");
      return;
    }

    logger.info("Closing browser context");

    try {
      await target.close();
      logger.info("Browser context closed successfully");
    } catch (error) {
      logger.error(`Error closing context: ${error.message}`);
      throw error;
    } finally {
      if (target === this.context) {
        this.context = null;
      }
    }
  }

  /**
   * Return the current browser context.
   * @returns {import('@playwright/test').BrowserContext | null}
   */
  getContext() {
    if (!this.context) {
      logger.warn("No active browser context");
    }
    return this.context;
  }

  /**
   * Apply a saved authentication/storage state to a context.
   * @param {import('@playwright/test').BrowserContext} context
   * @param {string | object} state - File path or state object
   */
  async setStorageState(context, state) {
    logger.info("Applying storage state to context");
    await context.addCookies((typeof state === "string" ? (await import("fs")).readFileSync(state, "utf-8") : state).cookies || []);
    logger.info("Storage state applied");
  }

  /**
   * Grant browser permissions for the context.
   * @param {import('@playwright/test').BrowserContext} context
   * @param {string[]} permissions - e.g. ['geolocation', 'notifications']
   */
  async grantPermissions(context, permissions) {
    logger.info(`Granting permissions: ${permissions.join(", ")}`);
    await context.grantPermissions(permissions);
    logger.info("Permissions granted");
  }

  /**
   * Clear all cookies from the context.
   * @param {import('@playwright/test').BrowserContext} context
   */
  async clearCookies(context) {
    logger.info("Clearing cookies from context");
    await context.clearCookies();
    logger.info("Cookies cleared");
  }

  /**
   * Clear all granted permissions from the context.
   * @param {import('@playwright/test').BrowserContext} context
   */
  async clearPermissions(context) {
    logger.info("Clearing permissions from context");
    await context.clearPermissions();
    logger.info("Permissions cleared");
  }
}

export { ContextManager };
export default new ContextManager();
