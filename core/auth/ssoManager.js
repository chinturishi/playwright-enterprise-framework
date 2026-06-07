import logger from "../logging/logger.js";
import { NAVIGATION_TIMEOUT_MS } from "../../config/constants/timeoutConstants.js";

class SSOManager {
  /**
   * Handle a redirect to an SSO identity provider page and fill credentials.
   * @param {import('@playwright/test').Page} page
   * @param {{
   *   usernameField: string,
   *   passwordField: string,
   *   submitButton: string,
   *   username: string,
   *   password: string,
   *   ssoUrlPattern?: string|RegExp
   * }} options
   */
  async handleSSORedirect(page, options) {
    if (options.ssoUrlPattern) {
      logger.info(`Waiting for SSO redirect → ${options.ssoUrlPattern}`);
      await page.waitForURL(options.ssoUrlPattern, { timeout: NAVIGATION_TIMEOUT_MS });
    }

    logger.info(`Filling SSO credentials on ${page.url()}`);
    await page.fill(options.usernameField, options.username);
    await page.fill(options.passwordField, options.password);
    await page.click(options.submitButton);
    await page.waitForLoadState("networkidle");
    logger.info("SSO credentials submitted");
  }

  /**
   * Wait for the SSO provider to redirect back to the application callback URL.
   * @param {import('@playwright/test').Page} page
   * @param {string|RegExp} callbackUrlPattern
   * @returns {Promise<string>} The full callback URL
   */
  async waitForCallback(page, callbackUrlPattern) {
    logger.info(`Waiting for callback redirect → ${callbackUrlPattern}`);
    await page.waitForURL(callbackUrlPattern, { timeout: NAVIGATION_TIMEOUT_MS });
    const url = page.url();
    logger.info(`Callback received: ${url}`);
    return url;
  }

  /**
   * Extract a token from the current page URL's query or hash parameters.
   * @param {import('@playwright/test').Page} page
   * @param {string} tokenParam - Name of the URL parameter (e.g. "code", "access_token")
   * @returns {string|null}
   */
  extractToken(page, tokenParam) {
    const url = new URL(page.url());
    const fromQuery = url.searchParams.get(tokenParam);
    if (fromQuery) return fromQuery;

    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const fromHash = hashParams.get(tokenParam);
    logger.info(`Extracted ${tokenParam}: ${fromHash ? "found" : "not found"}`);
    return fromHash ?? null;
  }
}

export default new SSOManager();
