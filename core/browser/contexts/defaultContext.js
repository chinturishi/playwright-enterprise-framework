import logger from "../../logging/logger.js";
import ContextFactory from "../factories/contextFactory.js";

/**
 * Create a default browser context using framework configuration values.
 * @param {import('@playwright/test').Browser} browser
 * @param {object} [frameworkConfig] - Merged framework configuration
 * @returns {Promise<import('@playwright/test').BrowserContext>}
 */
export async function createDefaultContext(browser, frameworkConfig = {}) {
  const browserConfig = frameworkConfig.browser || {};

  logger.info("Creating default context from framework config");
  return ContextFactory.create(browser, {
    viewport: browserConfig.viewport || { width: 1280, height: 720 },
    locale: browserConfig.locale || "en-US",
    colorScheme: browserConfig.colorScheme || "light",
    ignoreHTTPSErrors: browserConfig.ignoreHTTPSErrors || false,
  });
}

export default createDefaultContext;
