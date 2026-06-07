import { test as base, expect } from "@playwright/test";
import logger from "../logging/logger.js";
import configLoader from "../../config/global/configLoader.js";
import FrameworkPage from "../pages/FrameworkPage.js";
import elementActions from "../wrappers/elementActions.js";
import waitActions from "../wrappers/waitActions.js";
import keyboardActions from "../wrappers/keyboardActions.js";
import mouseActions from "../wrappers/mouseActions.js";
import dragDropActions from "../wrappers/dragDropActions.js";
import uploadActions from "../wrappers/uploadActions.js";
import frameActions from "../wrappers/frameActions.js";
import screenshotUtils from "../utils/screenshotUtils.js";
import locatorUtils from "../utils/locatorUtils.js";
import { BrowserManager } from "../browser/browserManager.js";
import { ContextManager } from "../browser/contextManager.js";
import { PageManager } from "../browser/pageManager.js";
import storageManager from "../browser/storageManager.js";

/**
 * Extended Playwright test object that injects framework-level utilities
 * into every test as fixtures. This is the primary entry point for consuming
 * applications — import `test` and `expect` from this module instead of
 * `@playwright/test` to get access to logger, config, and action wrappers.
 *
 * **Recommended:** use `frameworkPage` for a fully abstracted experience
 * where no Playwright knowledge is needed.
 */
export const test = base.extend({
  // ---------------------------------------------------------------------------
  // Core — fully-abstracted page (recommended for consumers)
  // ---------------------------------------------------------------------------

  /**
   * FrameworkPage wraps the Playwright `page` so consumers never need
   * Playwright imports. Provides navigate, click, fill, type, wait, keyboard,
   * screenshot, and locator resolution via plain descriptor objects.
   */
  frameworkPage: async ({ page }, use) => {
    await use(new FrameworkPage(page));
  },

  // ---------------------------------------------------------------------------
  // Logging & configuration
  // ---------------------------------------------------------------------------

  logger: async ({}, use) => {
    await use(logger);
  },

  config: async ({}, use) => {
    configLoader.load();
    await use(configLoader);
  },

  // ---------------------------------------------------------------------------
  // Action wrappers (legacy — prefer frameworkPage for new tests)
  // ---------------------------------------------------------------------------

  elementActions: async ({}, use) => {
    await use(elementActions);
  },

  waitActions: async ({}, use) => {
    await use(waitActions);
  },

  keyboardActions: async ({}, use) => {
    await use(keyboardActions);
  },

  mouseActions: async ({}, use) => {
    await use(mouseActions);
  },

  dragDropActions: async ({}, use) => {
    await use(dragDropActions);
  },

  uploadActions: async ({}, use) => {
    await use(uploadActions);
  },

  frameActions: async ({}, use) => {
    await use(frameActions);
  },

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  screenshotUtils: async ({}, use) => {
    await use(screenshotUtils);
  },

  locatorUtils: async ({}, use) => {
    await use(locatorUtils);
  },

  // ---------------------------------------------------------------------------
  // Browser management — per-test instances (no shared singleton state)
  // ---------------------------------------------------------------------------

  browserManager: async ({}, use) => {
    const manager = new BrowserManager();
    await use(manager);
    await manager.closeBrowser();
  },

  contextManager: async ({}, use) => {
    const manager = new ContextManager();
    await use(manager);
  },

  pageManager: async ({}, use) => {
    const manager = new PageManager();
    await use(manager);
  },

  storageManager: async ({}, use) => {
    await use(storageManager);
  },
});

export { expect };
