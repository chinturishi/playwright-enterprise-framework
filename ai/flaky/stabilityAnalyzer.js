import logger from "../../core/logging/logger.js";

class StabilityAnalyzer {
  /**
   * Calculate stability score (0-100) for a test based on history.
   * @param {string} testName
   * @param {Array<{ name: string, status: string, retries?: number }>} history
   */
  calculateScore(testName, history) {
    const runs = history.filter((h) => h.name === testName);
    if (!runs.length) return 100;
    const passed = runs.filter((r) => r.status === "passed" && !r.retries).length;
    return Math.round((passed / runs.length) * 100);
  }

  /**
   * Determine if a test's stability is improving, declining, or stable.
   * @param {string} testName @param {Array} history @param {number} [windowSize=5]
   */
  getTrend(testName, history, windowSize = 5) {
    const runs = history.filter((h) => h.name === testName);
    if (runs.length < windowSize * 2) return "insufficient_data";

    const recent = runs.slice(-windowSize);
    const older = runs.slice(-windowSize * 2, -windowSize);
    const recentRate = recent.filter((r) => r.status === "passed").length / recent.length;
    const olderRate = older.filter((r) => r.status === "passed").length / older.length;
    const delta = recentRate - olderRate;

    if (delta > 0.1) return "improving";
    if (delta < -0.1) return "declining";
    return "stable";
  }

  /**
   * Get tests scoring below a stability threshold.
   * @param {Array} history @param {number} [threshold=70]
   */
  getUnstableTests(history, threshold = 70) {
    const testNames = [...new Set(history.map((h) => h.name))];
    return testNames
      .map((name) => ({ name, score: this.calculateScore(name, history) }))
      .filter((t) => t.score < threshold)
      .sort((a, b) => a.score - b.score);
  }

  /** @param {Array} history */
  generateStabilityReport(history) {
    const tests = [...new Set(history.map((h) => h.name))];
    const entries = tests.map((name) => ({
      name,
      score: this.calculateScore(name, history),
      trend: this.getTrend(name, history),
    }));
    const avg = entries.length ? Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length) : 100;
    logger.info(`[StabilityAnalyzer] Report: ${tests.length} tests, avg score ${avg}`);
    return { averageScore: avg, tests: entries, generatedAt: new Date().toISOString() };
  }
}

export default new StabilityAnalyzer();
