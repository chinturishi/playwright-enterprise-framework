import { chromium, firefox, webkit } from "@playwright/test";
import logger from "../../logging/logger.js";
import { FrameworkError } from "../../errors/FrameworkError.js";

const engines = { chromium, firefox, webkit };

/**
 * Factory for creating browser instances from configuration objects.
 * Prefer this over direct Playwright browser-type imports.
 */
class BrowserFactory {
  /**
   * Launch a local browser instance.
   * @param {object} [config]
   * @param {string} [config.name='chromium'] - chromium | firefox | webkit
   * @param {boolean} [config.headless=true]
   * @param {number} [config.slowMo=0]
   * @param {string[]} [config.args=[]]
   * @param {object} [config.launchOptions] - Additional Playwright launch options
   * @returns {Promise<import('@playwright/test').Browser>}
   */
  static async create(config = {}) {
    const browserName = config.name || "chromium";
    const engine = engines[browserName];

    if (!engine) {
      throw new FrameworkError(
        `Unsupported browser: "${browserName}". Supported: ${Object.keys(engines).join(", ")}`
      );
    }

    const launchOptions = {
      headless: config.headless ?? true,
      slowMo: config.slowMo ?? 0,
      args: config.args ?? [],
      ...(config.launchOptions || {}),
    };

    logger.info(`BrowserFactory: launching ${browserName}`);
    const browser = await engine.launch(launchOptions);
    logger.info(
      `BrowserFactory: ${browserName} launched (pid: ${browser.process?.()?.pid ?? "N/A"})`
    );
    return browser;
  }

  /**
   * Connect to a remote browser over the Chrome DevTools Protocol.
   * @param {string} endpointURL
   * @param {object} [options]
   * @returns {Promise<import('@playwright/test').Browser>}
   */
  static async connectOverCDP(endpointURL, options = {}) {
    logger.info(`BrowserFactory: connecting via CDP to ${endpointURL}`);
    const browser = await chromium.connectOverCDP(endpointURL, options);
    logger.info("BrowserFactory: CDP connection established");
    return browser;
  }
}

export default BrowserFactory;
