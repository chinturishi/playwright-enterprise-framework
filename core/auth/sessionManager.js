import fs from "fs";
import path from "path";
import logger from "../logging/logger.js";

class SessionManager {
  /**
   * Persist the browser context's storage state to a JSON file.
   * @param {import('@playwright/test').BrowserContext} context
   * @param {string} filePath
   */
  async saveState(context, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await context.storageState({ path: filePath });
    logger.info(`Session state saved → ${filePath}`);
  }

  /**
   * Read a previously saved storage state.
   * @param {string} filePath
   * @returns {object}
   */
  loadState(filePath) {
    if (!fs.existsSync(filePath)) throw new Error(`Session file not found: ${filePath}`);
    const state = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    logger.info(`Session state loaded ← ${filePath}`);
    return state;
  }

  /**
   * Check whether a session file exists and is younger than `maxAgeMs`.
   * @param {string} filePath
   * @param {number} [maxAgeMs=3600000]
   * @returns {boolean}
   */
  isValid(filePath, maxAgeMs = 3_600_000) {
    if (!fs.existsSync(filePath)) return false;
    const age = Date.now() - fs.statSync(filePath).mtimeMs;
    const valid = age < maxAgeMs;
    logger.debug(`Session file age ${Math.round(age / 1000)}s — ${valid ? "valid" : "expired"}`);
    return valid;
  }

  /** @param {string} filePath */
  invalidate(filePath) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Session invalidated: ${filePath}`);
    }
  }

  /**
   * @param {import('@playwright/test').BrowserContext} context
   * @returns {Promise<Array<object>>}
   */
  async getCookies(context) {
    return context.cookies();
  }

  /**
   * @param {import('@playwright/test').BrowserContext} context
   * @param {Array<object>} cookies
   */
  async setCookies(context, cookies) {
    await context.addCookies(cookies);
    logger.info(`${cookies.length} cookie(s) set on context`);
  }
}

export default new SessionManager();
