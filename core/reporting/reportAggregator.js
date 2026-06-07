import fs from "fs-extra";
import logger from "../logging/logger.js";

class ReportAggregator {
  /**
   * Read and merge multiple JSON result files into a single results array.
   * @param {string[]} resultFiles - Paths to JSON result files
   * @returns {Promise<Array<object>>}
   */
  async aggregate(resultFiles) {
    logger.info(`Aggregating ${resultFiles.length} result file(s)`);
    const merged = [];
    for (const file of resultFiles) {
      try {
        const data = await fs.readJson(file);
        const tests = Array.isArray(data) ? data : data.tests || data.results || [data];
        merged.push(...tests);
      } catch (err) {
        logger.warn(`Failed to read result file ${file}: ${err.message}`);
      }
    }
    logger.info(`Aggregated ${merged.length} test result(s)`);
    return merged;
  }

  /**
   * Compute aggregate statistics from a results array.
   * @param {Array<{ status: string, duration?: number, retry?: number }>} results
   * @returns {{ total: number, passed: number, failed: number, skipped: number, flaky: number, duration: number }}
   */
  calculateStats(results) {
    const stats = { total: results.length, passed: 0, failed: 0, skipped: 0, flaky: 0, duration: 0 };
    for (const r of results) {
      stats.duration += r.duration || 0;
      if (r.status === "passed" && r.retry > 0) {
        stats.flaky++;
        stats.passed++;
      } else if (r.status === "passed") {
        stats.passed++;
      } else if (r.status === "failed" || r.status === "timedOut") {
        stats.failed++;
      } else if (r.status === "skipped") {
        stats.skipped++;
      }
    }
    return stats;
  }

  /**
   * Filter results to only failed tests, including error details.
   * @param {Array<{ status: string, title?: string, error?: string }>} results
   * @returns {Array<object>}
   */
  getFailedTests(results) {
    return results.filter((r) => r.status === "failed" || r.status === "timedOut");
  }

  /**
   * Identify flaky tests — those that passed only after one or more retries.
   * @param {Array<{ status: string, retry?: number }>} results
   * @returns {Array<object>}
   */
  getFlakyTests(results) {
    return results.filter((r) => r.status === "passed" && r.retry > 0);
  }

  /**
   * Return the top N slowest tests sorted by duration descending.
   * @param {Array<{ duration?: number }>} results
   * @param {number} [count=10]
   * @returns {Array<object>}
   */
  getSlowestTests(results, count = 10) {
    return [...results]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, count);
  }

  /**
   * Build a full summary object containing stats plus categorised test lists.
   * @param {Array<object>} results
   * @returns {{ stats: object, failed: Array, flaky: Array, slowest: Array }}
   */
  generateSummary(results) {
    const stats = this.calculateStats(results);
    const summary = {
      stats,
      failed: this.getFailedTests(results),
      flaky: this.getFlakyTests(results),
      slowest: this.getSlowestTests(results),
    };
    logger.info(
      `Summary — total: ${stats.total}, passed: ${stats.passed}, failed: ${stats.failed}, ` +
        `skipped: ${stats.skipped}, flaky: ${stats.flaky}, duration: ${(stats.duration / 1000).toFixed(2)}s`
    );
    return summary;
  }
}

const reportAggregator = new ReportAggregator();
export default reportAggregator;
