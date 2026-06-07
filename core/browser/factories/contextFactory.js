import logger from "../../logging/logger.js";

/**
 * Factory for creating browser contexts from configuration objects.
 */
class ContextFactory {
  /**
   * Create a standard browser context.
   * Undefined values are stripped so Playwright uses its own defaults.
   * @param {import('@playwright/test').Browser} browser
   * @param {object} [config]
   * @returns {Promise<import('@playwright/test').BrowserContext>}
   */
  static async create(browser, config = {}) {
    const contextOptions = {
      viewport: config.viewport ?? { width: 1280, height: 720 },
      locale: config.locale,
      colorScheme: config.colorScheme,
      timezoneId: config.timezoneId,
      geolocation: config.geolocation,
      permissions: config.permissions,
      storageState: config.storageState,
      extraHTTPHeaders: config.extraHTTPHeaders,
      ignoreHTTPSErrors: config.ignoreHTTPSErrors ?? false,
      userAgent: config.userAgent,
      ...(config.contextOptions || {}),
    };

    for (const key of Object.keys(contextOptions)) {
      if (contextOptions[key] === undefined) delete contextOptions[key];
    }

    logger.info("ContextFactory: creating browser context");
    const context = await browser.newContext(contextOptions);
    logger.info("ContextFactory: context created");
    return context;
  }

  /**
   * Create a context pre-loaded with authentication / storage state.
   * @param {import('@playwright/test').Browser} browser
   * @param {string} storageStatePath - Path to the saved storage state JSON
   * @param {object} [config]
   * @returns {Promise<import('@playwright/test').BrowserContext>}
   */
  static async createAuthenticated(browser, storageStatePath, config = {}) {
    logger.info(`ContextFactory: creating authenticated context from ${storageStatePath}`);
    return ContextFactory.create(browser, {
      ...config,
      storageState: storageStatePath,
    });
  }

  /**
   * Create a context that emulates a mobile device.
   * @param {import('@playwright/test').Browser} browser
   * @param {string} deviceName - Playwright device name (e.g. 'iPhone 15')
   * @param {object} [config]
   * @returns {Promise<import('@playwright/test').BrowserContext>}
   */
  static async createMobile(browser, deviceName, config = {}) {
    const { devices } = await import("@playwright/test");
    const deviceConfig = devices[deviceName];
    if (!deviceConfig) {
      throw new Error(`Unknown device: "${deviceName}"`);
    }
    logger.info(`ContextFactory: creating mobile context for ${deviceName}`);
    return ContextFactory.create(browser, { ...deviceConfig, ...config });
  }
}

export default ContextFactory;
