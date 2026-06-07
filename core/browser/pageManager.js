import logger from "../logging/logger.js";
import { DEFAULT_TIMEOUT_MS } from "../../config/constants/timeoutConstants.js";

class PageManager {
  constructor() {
    this.currentPage = null;
  }

  /**
   * Create a new page within the given browser context.
   * @param {import('@playwright/test').BrowserContext} context
   * @returns {Promise<import('@playwright/test').Page>}
   */
  async createPage(context) {
    logger.info("Creating new page");
    const page = await context.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
    page.setDefaultNavigationTimeout(DEFAULT_TIMEOUT_MS);
    this.currentPage = page;
    logger.info("New page created with default timeouts");
    return page;
  }

  /**
   * Gracefully close a page.
   * @param {import('@playwright/test').Page} page
   */
  async closePage(page) {
    const target = page ?? this.currentPage;
    if (!target) {
      logger.warn("No page to close");
      return;
    }

    logger.info(`Closing page: ${target.url()}`);

    try {
      await target.close();
      logger.info("Page closed successfully");
    } catch (error) {
      logger.error(`Error closing page: ${error.message}`);
      throw error;
    } finally {
      if (target === this.currentPage) {
        this.currentPage = null;
      }
    }
  }

  /**
   * Return all open pages in the given context.
   * @param {import('@playwright/test').BrowserContext} context
   * @returns {import('@playwright/test').Page[]}
   */
  getPages(context) {
    const pages = context.pages();
    logger.debug(`Found ${pages.length} open page(s)`);
    return pages;
  }

  /**
   * Switch to a specific tab by index within the context.
   * @param {import('@playwright/test').BrowserContext} context
   * @param {number} index - Zero-based tab index
   * @returns {import('@playwright/test').Page}
   */
  switchToPage(context, index) {
    const pages = context.pages();
    if (index < 0 || index >= pages.length) {
      throw new Error(`Page index ${index} out of range (0-${pages.length - 1})`);
    }

    this.currentPage = pages[index];
    logger.info(`Switched to page at index ${index}: ${this.currentPage.url()}`);
    return this.currentPage;
  }

  /**
   * Wait for a new page (popup/tab) triggered by an action.
   * @param {import('@playwright/test').BrowserContext} context
   * @param {Function} action - The action that triggers the new page
   * @returns {Promise<import('@playwright/test').Page>}
   */
  async waitForNewPage(context, action) {
    logger.info("Waiting for new page/popup to open");

    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      action(),
    ]);

    await newPage.waitForLoadState();
    this.currentPage = newPage;
    logger.info(`New page opened: ${newPage.url()}`);
    return newPage;
  }

  /**
   * Override default timeouts on a page.
   * @param {import('@playwright/test').Page} page
   * @param {number} timeout - Timeout in milliseconds
   */
  setDefaultTimeouts(page, timeout) {
    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);
    logger.info(`Default timeouts set to ${timeout}ms`);
  }
}

export { PageManager };
export default new PageManager();
