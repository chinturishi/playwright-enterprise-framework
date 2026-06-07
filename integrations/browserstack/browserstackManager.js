import logger from "../../core/logging/logger.js";

class BrowserStackManager {
  #username = "";
  #accessKey = "";
  #sessionName = "";

  /**
   * @param {string} username - BrowserStack username
   * @param {string} accessKey - BrowserStack access key
   */
  configure(username, accessKey) {
    this.#username = username;
    this.#accessKey = accessKey;
    logger.info("BrowserStack manager configured");
  }

  get #authHeader() {
    return `Basic ${Buffer.from(`${this.#username}:${this.#accessKey}`).toString("base64")}`;
  }

  /**
   * @param {string} browser - e.g. 'chrome', 'firefox', 'safari'
   * @param {string} os - e.g. 'Windows', 'OS X'
   * @param {string} osVersion - e.g. '11', 'Sonoma'
   * @returns {object} BrowserStack capabilities
   */
  getCaps(browser, os, osVersion) {
    return {
      "bstack:options": {
        os,
        osVersion,
        userName: this.#username,
        accessKey: this.#accessKey,
        sessionName: this.#sessionName || "Playwright Test",
        debug: true,
        consoleLogs: "info",
        networkLogs: true,
      },
      browserName: browser,
    };
  }

  /** @returns {object} BrowserStack Local options */
  getConnectOptions() {
    return {
      key: this.#accessKey,
      force: true,
      forceLocal: true,
      onlyAutomate: true,
    };
  }

  /** @param {string} name */
  setSessionName(name) {
    this.#sessionName = name;
    logger.debug(`BrowserStack session name: ${name}`);
  }

  /**
   * @param {string} sessionId - BrowserStack session/build ID
   * @param {'passed'|'failed'} status
   * @param {string} [reason]
   */
  async setSessionStatus(sessionId, status, reason) {
    const url = `https://api.browserstack.com/automate/sessions/${sessionId}.json`;
    const body = { status, reason: reason || "" };

    logger.info(`Marking BrowserStack session ${sessionId} as ${status}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: { Authorization: this.#authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) logger.error(`BrowserStack status update failed: ${res.status}`);
  }

  /**
   * Placeholder: replace with full API call to https://api.browserstack.com/automate/browsers.json
   * @returns {Promise<object[]>}
   */
  async getBrowserList() {
    logger.info("Fetching BrowserStack browser list");
    const res = await fetch("https://api.browserstack.com/automate/browsers.json", {
      headers: { Authorization: this.#authHeader },
    });
    if (!res.ok) {
      logger.error(`BrowserStack browsers API failed: ${res.status}`);
      return [];
    }
    return res.json();
  }
}

export default new BrowserStackManager();
