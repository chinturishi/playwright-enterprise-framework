import path from "path";
import { test as baseTest, expect } from "./baseFixture.js";
import logger from "../logging/logger.js";
import loginManager from "../auth/loginManager.js";
import sessionManager from "../auth/sessionManager.js";
import configLoader from "../../config/global/configLoader.js";

const SESSION_DIR = path.resolve("reports", "sessions");
const SESSION_MAX_AGE_MS = 3_600_000;

/**
 * Extended test object that provides role-based pre-authenticated browser
 * contexts. Sessions are cached to disk per role so repeated tests reuse
 * existing auth state instead of re-logging in.
 */
export const test = baseTest.extend({
  /**
   * Role identifier used by `authenticatedPage`. Override per-test with
   * `test.use({ role: 'admin' })`.
   * @default 'user'
   */
  role: ["user", { option: true }],

  /**
   * A Playwright Page pre-authenticated for the configured `role`.
   * Session storage state is cached to `reports/sessions/<role>.json` and
   * reused while fresh. When the cache is stale or missing the fixture
   * performs a fresh login via LoginManager.
   */
  authenticatedPage: async ({ browser, role, config }, use) => {
    const sessionPath = path.join(SESSION_DIR, `${role}.json`);
    const roleConfig = config.get(`auth.roles.${role}`, {});

    let context;

    if (sessionManager.isValid(sessionPath, SESSION_MAX_AGE_MS)) {
      logger.info(`Reusing cached session for role "${role}"`);
      const storageState = sessionManager.loadState(sessionPath);
      context = await browser.newContext({ storageState });
    } else {
      logger.info(`Creating fresh session for role "${role}"`);
      context = await browser.newContext();
      const page = await context.newPage();

      const loginUrl = roleConfig.loginUrl || config.get("auth.loginUrl", "");
      const credentials = {
        username: roleConfig.username || "",
        password: roleConfig.password || "",
      };
      const selectors = {
        usernameField: config.get("auth.selectors.usernameField", "#username"),
        passwordField: config.get("auth.selectors.passwordField", "#password"),
        submitButton: config.get("auth.selectors.submitButton", "#login-button"),
      };

      await loginManager.loginViaUI(page, loginUrl, credentials, selectors);
      await sessionManager.saveState(context, sessionPath);
      await page.close();
    }

    const page = await context.newPage();
    logger.info(`Authenticated page ready for role "${role}"`);

    await use(page);

    await page.close();
    await context.close();
  },
});

export { expect };
