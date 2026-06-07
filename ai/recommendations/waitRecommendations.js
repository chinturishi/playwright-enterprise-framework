import logger from "../../core/logging/logger.js";

const WAIT_ANTIPATTERNS = [
  { pattern: /page\.waitForTimeout\(\d+\)/g, name: "hardcoded_timeout", severity: "high" },
  { pattern: /await\s+new\s+Promise.*setTimeout/g, name: "promise_timeout", severity: "high" },
  { pattern: /sleep\(\d+\)/g, name: "sleep_call", severity: "high" },
  { pattern: /waitForSelector.*timeout:\s*\d{5,}/g, name: "excessive_timeout", severity: "medium" },
];

class WaitRecommendations {
  /**
   * Analyze test code for wait anti-patterns.
   * @param {string} testCode
   */
  analyze(testCode) {
    const issues = [];
    for (const ap of WAIT_ANTIPATTERNS) {
      const matches = testCode.match(ap.pattern);
      if (matches) {
        issues.push({ name: ap.name, severity: ap.severity, occurrences: matches.length, matches });
      }
    }
    logger.info(`[WaitRecommendations] Found ${issues.length} anti-patterns`);
    return { issues, hasIssues: issues.length > 0 };
  }

  /**
   * Suggest replacements for wait anti-patterns.
   * @param {Array<{ name: string }>} issues
   */
  suggestSmartWaits(issues) {
    const suggestions = {
      hardcoded_timeout: "Replace page.waitForTimeout() with await expect(locator).toBeVisible() or page.waitForLoadState()",
      promise_timeout: "Use Playwright's built-in auto-waiting instead of manual Promise timeouts",
      sleep_call: "Replace sleep() with condition-based waits like page.waitForResponse() or expect().toHaveText()",
      excessive_timeout: "Reduce timeout and use more specific wait conditions (waitForResponse, waitForLoadState)",
    };
    return issues.map((i) => ({ issue: i.name, recommendation: suggestions[i.name] || "Review and replace with condition-based wait" }));
  }

  /**
   * Based on timeout failures, suggest wait improvements.
   * @param {Array<{ name: string, error?: string, duration?: number }>} testResults
   */
  getRecommendations(testResults) {
    const timeouts = testResults.filter((t) => t.error?.toLowerCase().includes("timeout"));
    if (!timeouts.length) return { recommendations: [], message: "No timeout issues detected" };
    const grouped = {};
    for (const t of timeouts) {
      const key = t.error.split("\n")[0].slice(0, 80);
      grouped[key] = grouped[key] || [];
      grouped[key].push(t.name);
    }
    return {
      recommendations: Object.entries(grouped).map(([error, tests]) => ({
        error,
        affectedTests: tests,
        suggestion: error.includes("locator") ? "Use more specific locators and add explicit visibility waits"
          : error.includes("navigation") ? "Add page.waitForLoadState('networkidle') after navigation"
          : "Increase actionTimeout or add condition-based waits",
      })),
    };
  }
}

export default new WaitRecommendations();
