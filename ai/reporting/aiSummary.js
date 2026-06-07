import logger from "../../core/logging/logger.js";

class AISummary {
  /**
   * Generate a natural language summary of a test run.
   * Placeholder: would use AI provider for richer summaries.
   * @param {Array<{ name: string, status: string, duration?: number, error?: string }>} results
   */
  async generate(results) {
    const total = results.length;
    const passed = results.filter((r) => r.status === "passed").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const passRate = total ? Math.round((passed / total) * 100) : 0;
    const totalDuration = results.reduce((s, r) => s + (r.duration || 0), 0);
    const issues = this.highlightIssues(results);

    const summary = [
      `Test run completed: ${passed}/${total} passed (${passRate}%).`,
      failed ? `${failed} test(s) failed.` : "",
      skipped ? `${skipped} test(s) skipped.` : "",
      `Total duration: ${Math.round(totalDuration / 1000)}s.`,
      issues.length ? `Key issues: ${issues.map((i) => i.summary).join("; ")}` : "No critical issues detected.",
    ].filter(Boolean).join(" ");

    logger.info(`[AISummary] ${summary.slice(0, 100)}...`);
    return { summary, passRate, total, passed, failed, skipped, duration: totalDuration, issues };
  }

  /**
   * Extract key issues from results.
   * @param {Array} results
   */
  highlightIssues(results) {
    const failures = results.filter((r) => r.status === "failed");
    const errorGroups = {};
    for (const f of failures) {
      const key = (f.error || "Unknown error").split("\n")[0].slice(0, 80);
      errorGroups[key] = errorGroups[key] || [];
      errorGroups[key].push(f.name);
    }
    return Object.entries(errorGroups).map(([error, tests]) => ({
      summary: `${error} (${tests.length} test${tests.length > 1 ? "s" : ""})`,
      error,
      affectedTests: tests,
    }));
  }

  /**
   * Compare current run to a previous run.
   * @param {Array} current @param {Array} previous
   */
  compareToPrevious(current, previous) {
    const curPassed = current.filter((r) => r.status === "passed").length;
    const prevPassed = previous.filter((r) => r.status === "passed").length;
    const curRate = current.length ? (curPassed / current.length) * 100 : 0;
    const prevRate = previous.length ? (prevPassed / previous.length) * 100 : 0;
    const delta = Math.round((curRate - prevRate) * 100) / 100;
    return {
      currentPassRate: Math.round(curRate),
      previousPassRate: Math.round(prevRate),
      delta,
      trend: delta > 1 ? "improving" : delta < -1 ? "declining" : "stable",
      newFailures: current.filter((c) => c.status === "failed" && previous.find((p) => p.name === c.name)?.status === "passed").map((c) => c.name),
      newPasses: current.filter((c) => c.status === "passed" && previous.find((p) => p.name === c.name)?.status === "failed").map((c) => c.name),
    };
  }
}

export default new AISummary();
