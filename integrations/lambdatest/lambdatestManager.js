import logger from "../../core/logging/logger.js";

class LambdaTestManager {
  #username = "";
  #accessKey = "";
  #testName = "";

  /**
   * @param {string} username - LambdaTest username
   * @param {string} accessKey - LambdaTest access key
   */
  configure(username, accessKey) {
    this.#username = username;
    this.#accessKey = accessKey;
    logger.info("LambdaTest manager configured");
  }

  get #authHeader() {
    return `Basic ${Buffer.from(`${this.#username}:${this.#accessKey}`).toString("base64")}`;
  }

  /**
   * @param {string} browser - e.g. 'Chrome', 'Firefox'
   * @param {string} platform - e.g. 'Windows 11', 'MacOS Sonoma'
   * @returns {object} LambdaTest capabilities
   */
  getCaps(browser, platform) {
    return {
      "LT:Options": {
        username: this.#username,
        accessKey: this.#accessKey,
        platformName: platform,
        name: this.#testName || "Playwright Test",
        build: `Build-${new Date().toISOString().slice(0, 10)}`,
        console: true,
        network: true,
        video: true,
      },
      browserName: browser,
    };
  }

  /** @param {string} name */
  setTestName(name) {
    this.#testName = name;
    logger.debug(`LambdaTest test name: ${name}`);
  }

  /**
   * @param {string} sessionId - LambdaTest session ID
   * @param {'passed'|'failed'} status
   * @param {string} [reason]
   */
  async setTestStatus(sessionId, status, reason) {
    const url = `https://api.lambdatest.com/automation/api/v1/sessions/${sessionId}`;
    const body = { status_ind: status, reason: reason || "" };

    logger.info(`Marking LambdaTest session ${sessionId} as ${status}`);
    const res = await fetch(url, {
      method: "PATCH",
      headers: { Authorization: this.#authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) logger.error(`LambdaTest status update failed: ${res.status}`);
  }

  /** @returns {object} Tunnel configuration options */
  getTunnelOptions() {
    return {
      user: this.#username,
      key: this.#accessKey,
      tunnelName: `tunnel-${Date.now()}`,
    };
  }
}

export default new LambdaTestManager();
