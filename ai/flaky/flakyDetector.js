import logger from "../../core/logging/logger.js";

class FlakyDetector {
  /**
   * Identify flaky tests from a set of results (tests that passed on retry).
   * @param {Array<{ name: string, status: string, retries?: number }>} testResults
   */
  analyze(testResults) {
    const flaky = testResults.filter((t) => t.retries > 0 && t.status === "passed");
    const broken = testResults.filter((t) => t.status === "failed");
    logger.info(`[FlakyDetector] ${flaky.length} flaky, ${broken.length} broken out of ${testResults.length}`);
    return {
      flaky: flaky.map((t) => t.name),
      broken: broken.map((t) => t.name),
      stable: testResults.filter((t) => t.status === "passed" && !t.retries).map((t) => t.name),
      total: testResults.length,
    };
  }

  /**
   * Detect common flaky patterns across execution history.
   * @param {Array<{ name: string, status: string, error?: string }>} history
   */
  detectPatterns(history) {
    const patterns = { timing: [], data: [], network: [], resource: [], unknown: [] };
    const errorMap = {};
    for (const entry of history) {
      if (!entry.error) continue;
      const msg = entry.error.toLowerCase();
      const bucket = msg.includes("timeout") ? "timing"
        : msg.includes("network") || msg.includes("fetch") ? "network"
        : msg.includes("data") || msg.includes("null") ? "data"
        : msg.includes("memory") || msg.includes("resource") ? "resource"
        : "unknown";
      patterns[bucket].push(entry.name);
      errorMap[entry.name] = (errorMap[entry.name] || 0) + 1;
    }
    return { patterns, frequency: errorMap };
  }

  /**
   * Calculate flake rate for a specific test.
   * @param {string} testName
   * @param {Array<{ name: string, status: string, retries?: number }>} history
   */
  getFlakeRate(testName, history) {
    const runs = history.filter((h) => h.name === testName);
    if (!runs.length) return 0;
    const flakes = runs.filter((r) => r.retries > 0).length;
    return (flakes / runs.length) * 100;
  }

  /**
   * Classify a single test result.
   * @param {{ status: string, retries?: number }} testResult
   * @returns {"stable"|"flaky"|"broken"}
   */
  classify(testResult) {
    if (testResult.status === "failed") return "broken";
    if (testResult.retries > 0) return "flaky";
    return "stable";
  }
}

export default new FlakyDetector();
