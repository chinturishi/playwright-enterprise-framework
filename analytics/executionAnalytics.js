import logger from "../core/logging/logger.js";

class ExecutionAnalytics {
  constructor() {
    this.runs = [];
  }

  /**
   * Record execution run data.
   * @param {{ runId?: string, timestamp?: string, tests: Array<{ name: string, status: string, duration?: number }>, duration?: number }} runData
   */
  track(runData) {
    this.runs.push({
      runId: runData.runId || `run-${Date.now()}`,
      timestamp: runData.timestamp || new Date().toISOString(),
      ...runData,
    });
    logger.debug(`[ExecutionAnalytics] Tracked run with ${runData.tests?.length || 0} tests`);
  }

  /**
   * Calculate overall pass rate from history.
   * @param {Array} [history]
   */
  getPassRate(history) {
    const runs = history || this.runs;
    let total = 0, passed = 0;
    for (const run of runs) {
      for (const t of run.tests || []) {
        total++;
        if (t.status === "passed") passed++;
      }
    }
    return total ? Math.round((passed / total) * 100 * 100) / 100 : 0;
  }

  /**
   * Calculate average test duration.
   * @param {Array} [history]
   */
  getAverageDuration(history) {
    const runs = history || this.runs;
    let total = 0, count = 0;
    for (const run of runs) {
      for (const t of run.tests || []) {
        if (t.duration) { total += t.duration; count++; }
      }
    }
    return count ? Math.round(total / count) : 0;
  }

  /**
   * Group executions by date.
   * @param {Array} [history]
   */
  getExecutionsByDate(history) {
    const runs = history || this.runs;
    const byDate = {};
    for (const run of runs) {
      const date = (run.timestamp || "").slice(0, 10) || "unknown";
      byDate[date] = byDate[date] || { runs: 0, tests: 0, passed: 0, failed: 0 };
      byDate[date].runs++;
      for (const t of run.tests || []) {
        byDate[date].tests++;
        if (t.status === "passed") byDate[date].passed++;
        else if (t.status === "failed") byDate[date].failed++;
      }
    }
    return Object.entries(byDate)
      .map(([date, data]) => ({ date, ...data, passRate: data.tests ? Math.round((data.passed / data.tests) * 100) : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /** @param {Array} [history] */
  generateReport(history) {
    const runs = history || this.runs;
    const report = {
      totalRuns: runs.length,
      passRate: this.getPassRate(runs),
      averageDuration: this.getAverageDuration(runs),
      byDate: this.getExecutionsByDate(runs),
      generatedAt: new Date().toISOString(),
    };
    logger.info(`[ExecutionAnalytics] Report: ${report.totalRuns} runs, ${report.passRate}% pass rate`);
    return report;
  }
}

export default new ExecutionAnalytics();
