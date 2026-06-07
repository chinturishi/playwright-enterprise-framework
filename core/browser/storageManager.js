import fs from "fs-extra";
import logger from "../logging/logger.js";

class StorageManager {
  /**
   * Save the full storage state (cookies + localStorage) to a JSON file.
   * @param {import('@playwright/test').BrowserContext} context
   * @param {string} filePath - Destination file path
   */
  async saveStorageState(context, filePath) {
    logger.info(`Saving storage state to ${filePath}`);
    await fs.ensureDir(filePath.substring(0, filePath.lastIndexOf("/")));
    const state = await context.storageState();
    await fs.writeJson(filePath, state, { spaces: 2 });
    logger.info("Storage state saved successfully");
    return state;
  }

  /**
   * Load a previously saved storage state from a JSON file.
   * @param {string} filePath - Path to the storage state JSON
   * @returns {Promise<object>}
   */
  async loadStorageState(filePath) {
    logger.info(`Loading storage state from ${filePath}`);
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`Storage state file not found: ${filePath}`);
    }
    const state = await fs.readJson(filePath);
    logger.info("Storage state loaded successfully");
    return state;
  }

  /**
   * Read a localStorage value via page evaluate.
   * @param {import('@playwright/test').Page} page
   * @param {string} key
   * @returns {Promise<string | null>}
   */
  async getLocalStorage(page, key) {
    logger.debug(`Getting localStorage key: ${key}`);
    const value = await page.evaluate((k) => localStorage.getItem(k), key);
    logger.debug(`localStorage[${key}] = ${value}`);
    return value;
  }

  /**
   * Set a localStorage value via page evaluate.
   * @param {import('@playwright/test').Page} page
   * @param {string} key
   * @param {string} value
   */
  async setLocalStorage(page, key, value) {
    logger.debug(`Setting localStorage key: ${key}`);
    await page.evaluate(({ k, v }) => localStorage.setItem(k, v), { k: key, v: value });
    logger.debug(`localStorage[${key}] set`);
  }

  /**
   * Read a sessionStorage value via page evaluate.
   * @param {import('@playwright/test').Page} page
   * @param {string} key
   * @returns {Promise<string | null>}
   */
  async getSessionStorage(page, key) {
    logger.debug(`Getting sessionStorage key: ${key}`);
    const value = await page.evaluate((k) => sessionStorage.getItem(k), key);
    logger.debug(`sessionStorage[${key}] = ${value}`);
    return value;
  }

  /**
   * Set a sessionStorage value via page evaluate.
   * @param {import('@playwright/test').Page} page
   * @param {string} key
   * @param {string} value
   */
  async setSessionStorage(page, key, value) {
    logger.debug(`Setting sessionStorage key: ${key}`);
    await page.evaluate(({ k, v }) => sessionStorage.setItem(k, v), { k: key, v: value });
    logger.debug(`sessionStorage[${key}] set`);
  }

  /**
   * Clear both localStorage and sessionStorage on the page.
   * @param {import('@playwright/test').Page} page
   */
  async clearStorage(page) {
    logger.info("Clearing all browser storage");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    logger.info("All browser storage cleared");
  }
}

export default new StorageManager();
