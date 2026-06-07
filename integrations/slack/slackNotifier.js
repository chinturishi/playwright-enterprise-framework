import logger from "../../core/logging/logger.js";
import slackFormatter from "./slackFormatter.js";

class SlackNotifier {
  #webhookUrl = "";

  /** @param {string} webhookUrl - Slack incoming webhook URL */
  configure(webhookUrl) {
    this.#webhookUrl = webhookUrl;
    logger.info("Slack notifier configured");
  }

  /**
   * @param {object} message - Slack Block Kit message payload ({ blocks } or plain { text })
   * @returns {Promise<boolean>} true if sent successfully
   */
  async send(message) {
    if (!this.#webhookUrl) throw new Error("Slack webhook URL not configured");
    const body = typeof message === "string" ? JSON.stringify({ text: message }) : JSON.stringify(message);

    logger.debug("Sending Slack notification");
    const res = await fetch(this.#webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      logger.error(`Slack webhook failed ${res.status}: ${text}`);
      return false;
    }
    logger.info("Slack notification sent");
    return true;
  }

  /**
   * @param {object} results - { total, passed, failed, skipped, duration, suiteName }
   */
  async notifyTestResults(results) {
    const blocks = slackFormatter.formatTestSummary(results);
    return this.send({ blocks });
  }

  /**
   * @param {string} testName
   * @param {string} error
   */
  async notifyFailure(testName, error) {
    const blocks = slackFormatter.formatFailure(testName, error);
    return this.send({ blocks });
  }
}

export default new SlackNotifier();
