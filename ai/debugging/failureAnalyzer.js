import logger from "../../core/logging/logger.js";

class FailureAnalyzer {
  /**
   * Analyze a test failure: categorize, assess, and suggest fixes.
   * @param {{ name: string, error?: string, stacktrace?: string, screenshot?: string, duration?: number }} testResult
   */
  async analyze(testResult) {
    const category = this.categorize(testResult.error || "");
    const suggestion = this.suggestFix({ category, error: testResult.error });
    logger.info(`[FailureAnalyzer] ${testResult.name}: ${category}`);
    return {
      testName: testResult.name,
      category,
      error: testResult.error || "No error message",
      suggestion,
      screenshot: testResult.screenshot || null,
      duration: testResult.duration,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Categorize an error message.
   * @param {string} error
   * @returns {"locator"|"timeout"|"assertion"|"network"|"unknown"}
   */
  categorize(error) {
    const msg = (error || "").toLowerCase();
    if (msg.includes("locator") || msg.includes("selector") || msg.includes("no element")) return "locator";
    if (msg.includes("timeout") || msg.includes("exceeded")) return "timeout";
    if (msg.includes("expect") || msg.includes("assert") || msg.includes("toequal") || msg.includes("tobetruthy")) return "assertion";
    if (msg.includes("net::") || msg.includes("fetch") || msg.includes("network") || msg.includes("econnrefused")) return "network";
    return "unknown";
  }

  /**
   * Suggest a fix based on failure analysis.
   * @param {{ category: string, error?: string }} analysis
   */
  suggestFix(analysis) {
    const suggestions = {
      locator: "Check if the element's selector changed. Use data-testid or role-based selectors for stability.",
      timeout: "Increase timeout or add explicit waits for the expected condition. Check if the app is loading slowly.",
      assertion: "Verify the expected value. Check if the app state matches expectations before asserting.",
      network: "Check if the API server is running. Verify network conditions and add request interception if needed.",
      unknown: "Review the error message and stack trace. Check recent code changes in the affected area.",
    };
    return suggestions[analysis.category] || suggestions.unknown;
  }

  /**
   * Generate a failure report from multiple analyses.
   * @param {Array} analyses
   */
  async generateReport(analyses) {
    const byCategory = {};
    for (const a of analyses) {
      byCategory[a.category] = byCategory[a.category] || [];
      byCategory[a.category].push(a);
    }
    return {
      total: analyses.length,
      byCategory,
      topIssues: Object.entries(byCategory)
        .map(([cat, items]) => ({ category: cat, count: items.length }))
        .sort((a, b) => b.count - a.count),
      generatedAt: new Date().toISOString(),
    };
  }
}

export default new FailureAnalyzer();
