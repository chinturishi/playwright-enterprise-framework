import logger from "../../core/logging/logger.js";
import fs from "fs";

class GithubActionsReporter {
  /** @returns {boolean} */
  isGitHubActions() {
    return process.env.GITHUB_ACTIONS === "true";
  }

  /**
   * @param {string} markdown - Markdown content for the job summary
   */
  async setSummary(markdown) {
    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryPath) {
      logger.warn("GITHUB_STEP_SUMMARY not set — not running in GitHub Actions");
      return;
    }
    fs.appendFileSync(summaryPath, markdown + "\n");
    logger.info("GitHub Actions step summary updated");
  }

  /**
   * @param {'warning'|'error'|'notice'} level
   * @param {string} message
   * @param {string} [file]
   * @param {number} [line]
   */
  addAnnotation(level, message, file, line) {
    const params = [];
    if (file) params.push(`file=${file}`);
    if (line) params.push(`line=${line}`);
    const paramStr = params.length ? ` ${params.join(",")}` : "";
    const cmd = `::${level}${paramStr}::${message}`;
    console.log(cmd);
    logger.debug(`GitHub annotation: ${cmd}`);
  }

  /**
   * @param {string} name - Output parameter name
   * @param {string} value - Output value
   */
  setOutput(name, value) {
    const outputPath = process.env.GITHUB_OUTPUT;
    if (outputPath) {
      fs.appendFileSync(outputPath, `${name}=${value}\n`);
      logger.debug(`Set GitHub output ${name}`);
    } else {
      console.log(`::set-output name=${name}::${value}`);
    }
  }

  /**
   * @param {object} results - { total, passed, failed, skipped, duration, tests }
   * @returns {string} Markdown table
   */
  formatTestResults(results) {
    const { total = 0, passed = 0, failed = 0, skipped = 0, duration = 0, tests = [] } = results;
    const status = failed > 0 ? "❌ FAILED" : "✅ PASSED";

    let md = `## ${status} Test Results\n\n`;
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| Total | ${total} |\n`;
    md += `| Passed | ${passed} |\n`;
    md += `| Failed | ${failed} |\n`;
    md += `| Skipped | ${skipped} |\n`;
    md += `| Duration | ${(duration / 1000).toFixed(1)}s |\n\n`;

    if (tests.length) {
      md += `### Details\n\n| Test | Status | Duration |\n|------|--------|----------|\n`;
      for (const t of tests) {
        md += `| ${t.name} | ${t.status} | ${t.duration || "-"} |\n`;
      }
    }

    logger.debug("Formatted GitHub Actions test results markdown");
    return md;
  }
}

export default new GithubActionsReporter();
