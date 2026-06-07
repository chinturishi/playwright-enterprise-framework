import path from "path";
import fs from "fs-extra";
import logger from "../logging/logger.js";

const STATUS_BADGES = {
  passed: '<span style="background:#22c55e;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px">PASSED</span>',
  failed: '<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px">FAILED</span>',
  skipped: '<span style="background:#eab308;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px">SKIPPED</span>',
  flaky: '<span style="background:#f97316;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px">FLAKY</span>',
};

class HtmlReporter {
  #sections = [];

  /**
   * Generate a standalone HTML report file from test results.
   * @param {{ stats: object, tests: Array<object> }} results
   * @param {string} [outputPath='reports/report.html']
   * @returns {Promise<string>} Absolute path to the written report
   */
  async generate(results, outputPath = "reports/report.html") {
    this.#sections = [];
    this.addSection("Summary", this.buildSummaryTable(results.stats || {}));
    this.addSection("Test Results", this.buildTestList(results.tests || []));

    const html = this.#wrapHtml(this.#sections.join("\n"));
    const absPath = path.resolve(outputPath);
    await fs.ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, html, "utf-8");
    logger.info(`HTML report generated → ${absPath}`);
    return absPath;
  }

  /**
   * Append a named section to the report body.
   * @param {string} title
   * @param {string} content - Raw HTML content
   */
  addSection(title, content) {
    this.#sections.push(`<section><h2>${title}</h2>${content}</section>`);
  }

  /**
   * Build an HTML summary table from aggregated stats.
   * @param {{ total?: number, passed?: number, failed?: number, skipped?: number, duration?: number }} stats
   * @returns {string}
   */
  buildSummaryTable(stats) {
    const rows = [
      ["Total", stats.total ?? 0],
      ["Passed", stats.passed ?? 0],
      ["Failed", stats.failed ?? 0],
      ["Skipped", stats.skipped ?? 0],
      ["Duration", `${((stats.duration ?? 0) / 1000).toFixed(2)}s`],
    ];
    const trs = rows.map(([label, val]) => `<tr><td>${label}</td><td>${val}</td></tr>`).join("");
    return `<table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${trs}</tbody></table>`;
  }

  /**
   * Build an HTML list of individual test results with status badges.
   * @param {Array<{ title: string, status: string, duration?: number, error?: string }>} tests
   * @returns {string}
   */
  buildTestList(tests) {
    if (!tests.length) return "<p>No test results available.</p>";
    const items = tests.map((t) => {
      const badge = STATUS_BADGES[t.status] || t.status;
      const dur = t.duration != null ? ` (${(t.duration / 1000).toFixed(2)}s)` : "";
      const err = t.error ? `<pre style="color:#ef4444;margin:4px 0 0 16px">${this.#escapeHtml(t.error)}</pre>` : "";
      return `<li>${badge} ${this.#escapeHtml(t.title)}${dur}${err}</li>`;
    });
    return `<ul style="list-style:none;padding:0">${items.join("")}</ul>`;
  }

  /**
   * Read an image from disk and embed it as a base64 `<img>` tag.
   * @param {string} screenshotPath
   * @returns {Promise<string>} HTML img tag or empty string if file missing
   */
  async embedScreenshot(screenshotPath) {
    try {
      const buffer = await fs.readFile(screenshotPath);
      const base64 = buffer.toString("base64");
      return `<img src="data:image/png;base64,${base64}" style="max-width:100%;border:1px solid #ddd;margin:8px 0" />`;
    } catch {
      logger.warn(`Screenshot not found for embedding: ${screenshotPath}`);
      return "";
    }
  }

  #escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  #wrapHtml(body) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Test Report</title>
<style>
body{font-family:system-ui,sans-serif;margin:2rem;color:#1e293b}
h1{border-bottom:2px solid #3b82f6;padding-bottom:.5rem}
h2{color:#3b82f6}
table{border-collapse:collapse;width:100%;margin:1rem 0}
th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}
th{background:#f1f5f9}
li{padding:6px 0;border-bottom:1px solid #f1f5f9}
pre{white-space:pre-wrap;font-size:13px}
</style>
</head>
<body>
<h1>Test Execution Report</h1>
<p>Generated: ${new Date().toISOString()}</p>
${body}
</body>
</html>`;
  }
}

const htmlReporter = new HtmlReporter();
export default htmlReporter;
