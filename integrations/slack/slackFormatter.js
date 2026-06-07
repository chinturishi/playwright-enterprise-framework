import logger from "../../core/logging/logger.js";

class SlackFormatter {
  /**
   * @param {string} type - Block type (section, header, divider, context)
   * @param {string} [text] - Markdown text content
   * @returns {object} Slack block
   */
  buildBlock(type, text) {
    if (type === "divider") return { type: "divider" };
    if (type === "header") return { type: "header", text: { type: "plain_text", text, emoji: true } };
    if (type === "context") return { type: "context", elements: [{ type: "mrkdwn", text }] };
    return { type: "section", text: { type: "mrkdwn", text } };
  }

  /**
   * @param {object} results - { total, passed, failed, skipped, duration, suiteName }
   * @returns {object[]} Slack Block Kit blocks
   */
  formatTestSummary(results) {
    const { total = 0, passed = 0, failed = 0, skipped = 0, duration = 0, suiteName = "Test Suite" } = results;
    const status = failed > 0 ? ":x: FAILED" : ":white_check_mark: PASSED";

    const blocks = [
      this.buildBlock("header", `${status} — ${suiteName}`),
      this.buildBlock("divider"),
      this.buildBlock("section", `*Total:* ${total}  |  *Passed:* ${passed}  |  *Failed:* ${failed}  |  *Skipped:* ${skipped}`),
      this.buildBlock("context", `Duration: ${(duration / 1000).toFixed(1)}s  |  ${new Date().toISOString()}`),
    ];
    logger.debug("Formatted Slack test summary");
    return blocks;
  }

  /**
   * @param {string} testName
   * @param {string} error - Error message
   * @param {string} [screenshot] - Screenshot URL or path
   * @returns {object[]} Slack Block Kit blocks
   */
  formatFailure(testName, error, screenshot) {
    const blocks = [
      this.buildBlock("header", ":rotating_light: Test Failure"),
      this.buildBlock("section", `*Test:* ${testName}\n*Error:*\n\`\`\`${error}\`\`\``),
    ];
    if (screenshot) {
      blocks.push({ type: "image", image_url: screenshot, alt_text: `${testName} failure screenshot` });
    }
    blocks.push(this.buildBlock("context", new Date().toISOString()));
    logger.debug(`Formatted Slack failure block for ${testName}`);
    return blocks;
  }

  /**
   * @param {object} stats - { date, totalRuns, totalTests, passRate, avgDuration, topFailures }
   * @returns {object[]} Slack Block Kit blocks
   */
  formatDailySummary(stats) {
    const { date = new Date().toISOString().slice(0, 10), totalRuns = 0, totalTests = 0, passRate = 0, avgDuration = 0, topFailures = [] } = stats;
    const blocks = [
      this.buildBlock("header", `:bar_chart: Daily Summary — ${date}`),
      this.buildBlock("divider"),
      this.buildBlock("section", `*Runs:* ${totalRuns}  |  *Tests:* ${totalTests}  |  *Pass Rate:* ${passRate}%  |  *Avg Duration:* ${(avgDuration / 1000).toFixed(1)}s`),
    ];
    if (topFailures.length) {
      const list = topFailures.map((f) => `• ${f}`).join("\n");
      blocks.push(this.buildBlock("section", `*Top Failures:*\n${list}`));
    }
    logger.debug("Formatted Slack daily summary");
    return blocks;
  }

  /**
   * @param {object[]} blocks - Slack blocks array
   * @returns {string} JSON payload for Slack API
   */
  toJSON(blocks) {
    return JSON.stringify({ blocks });
  }
}

export default new SlackFormatter();
