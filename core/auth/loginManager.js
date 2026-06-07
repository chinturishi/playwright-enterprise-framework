import fs from "fs";
import logger from "../logging/logger.js";

class LoginManager {
  /**
   * Perform a UI-based login by filling form fields and submitting.
   * @param {import('@playwright/test').Page} page
   * @param {string} loginUrl
   * @param {{ username: string, password: string }} credentials
   * @param {{ usernameField: string, passwordField: string, submitButton: string }} selectors
   */
  async loginViaUI(page, loginUrl, credentials, selectors) {
    logger.info(`UI login → ${loginUrl}`);
    await page.goto(loginUrl, { waitUntil: "domcontentloaded" });
    await page.fill(selectors.usernameField, credentials.username);
    await page.fill(selectors.passwordField, credentials.password);
    await page.click(selectors.submitButton);
    await page.waitForLoadState("networkidle");
    logger.info("UI login completed");
  }

  /**
   * Login via API POST and return the response token/body.
   * @param {object} apiClient - An ApiInterceptor instance or compatible object
   * @param {string} loginEndpoint
   * @param {object} credentials
   * @returns {Promise<{status: number, body: *}>}
   */
  async loginViaAPI(apiClient, loginEndpoint, credentials) {
    logger.info(`API login → ${loginEndpoint}`);
    const result = await apiClient.post(loginEndpoint, credentials);
    logger.info(`API login → ${result.status}`);
    return result;
  }

  /**
   * Save the browser context's storage state (cookies + localStorage) to a file.
   * @param {import('@playwright/test').BrowserContext} context
   * @param {string} path
   */
  async saveSession(context, path) {
    await context.storageState({ path });
    logger.info(`Session saved → ${path}`);
  }

  /**
   * Load a previously saved storage state from disk.
   * @param {string} path
   * @returns {object} Storage state JSON
   */
  loadSession(path) {
    if (!fs.existsSync(path)) throw new Error(`Session file not found: ${path}`);
    const state = JSON.parse(fs.readFileSync(path, "utf-8"));
    logger.info(`Session loaded ← ${path}`);
    return state;
  }

  /**
   * Verify a session is still valid by navigating and checking for a known element.
   * @param {import('@playwright/test').Page} page
   * @param {string} checkUrl
   * @param {string} expectedElement - Selector that should be visible when logged in
   * @returns {Promise<boolean>}
   */
  async isSessionValid(page, checkUrl, expectedElement) {
    try {
      await page.goto(checkUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(expectedElement, { timeout: 5000 });
      logger.info("Session is valid");
      return true;
    } catch {
      logger.warn("Session is invalid or expired");
      return false;
    }
  }
}

export default new LoginManager();
