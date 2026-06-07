import logger from "../../core/logging/logger.js";

class TeamsNotifier {
  #webhookUrl = "";

  /** @param {string} webhookUrl - Microsoft Teams incoming webhook URL */
  configure(webhookUrl) {
    this.#webhookUrl = webhookUrl;
    logger.info("Teams notifier configured");
  }

  /**
   * @param {object} card - Adaptive Card JSON payload
   * @returns {Promise<boolean>}
   */
  async send(card) {
    if (!this.#webhookUrl) throw new Error("Teams webhook URL not configured");

    const payload = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: card,
        },
      ],
    };

    logger.debug("Sending Teams notification");
    const res = await fetch(this.#webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      logger.error(`Teams webhook failed ${res.status}: ${await res.text()}`);
      return false;
    }
    logger.info("Teams notification sent");
    return true;
  }

  /**
   * @param {object} results - { total, passed, failed, skipped, duration, suiteName }
   * @returns {object} Adaptive Card JSON
   */
  formatTestSummary(results) {
    const { total = 0, passed = 0, failed = 0, skipped = 0, duration = 0, suiteName = "Test Suite" } = results;
    const status = failed > 0 ? "❌ FAILED" : "✅ PASSED";

    return {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.4",
      body: [
        { type: "TextBlock", text: `${status} — ${suiteName}`, size: "Large", weight: "Bolder" },
        {
          type: "ColumnSet",
          columns: [
            { type: "Column", items: [{ type: "TextBlock", text: `Total: ${total}` }] },
            { type: "Column", items: [{ type: "TextBlock", text: `Passed: ${passed}` }] },
            { type: "Column", items: [{ type: "TextBlock", text: `Failed: ${failed}` }] },
            { type: "Column", items: [{ type: "TextBlock", text: `Skipped: ${skipped}` }] },
          ],
        },
        { type: "TextBlock", text: `Duration: ${(duration / 1000).toFixed(1)}s`, isSubtle: true },
      ],
    };
  }

  /**
   * @param {string} testName
   * @param {string} error
   */
  async notifyFailure(testName, error) {
    const card = {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.4",
      body: [
        { type: "TextBlock", text: "🚨 Test Failure", size: "Large", weight: "Bolder", color: "Attention" },
        { type: "TextBlock", text: `**Test:** ${testName}`, wrap: true },
        { type: "TextBlock", text: `**Error:** ${error}`, wrap: true, color: "Attention" },
        { type: "TextBlock", text: new Date().toISOString(), isSubtle: true, size: "Small" },
      ],
    };
    return this.send(card);
  }
}

export default new TeamsNotifier();
