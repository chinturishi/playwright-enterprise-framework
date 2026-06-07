import logger from "../../core/logging/logger.js";

class FrameworkOptimization {
  /**
   * Analyze execution results for optimization opportunities.
   * @param {Array<{ name: string, duration: number, status: string, file?: string, workers?: number }>} results
   */
  analyzeExecution(results) {
    const totalDuration = results.reduce((s, r) => s + (r.duration || 0), 0);
    const avgDuration = results.length ? totalDuration / results.length : 0;
    const slowTests = results.filter((r) => r.duration > avgDuration * 2);
    const parallelSuggestions = this.suggestParallelization(results);
    const splitSuggestions = this.suggestTestSplitting(results);
    return {
      totalTests: results.length,
      totalDuration,
      averageDuration: Math.round(avgDuration),
      slowTests: slowTests.map((t) => ({ name: t.name, duration: t.duration })),
      parallelSuggestions,
      splitSuggestions,
    };
  }

  /**
   * Identify tests that can safely run in parallel.
   * @param {Array<{ name: string, file?: string, duration?: number }>} results
   */
  suggestParallelization(results) {
    const byFile = {};
    for (const r of results) {
      const file = r.file || "unknown";
      byFile[file] = byFile[file] || [];
      byFile[file].push(r);
    }
    return Object.entries(byFile)
      .filter(([, tests]) => tests.length > 1)
      .map(([file, tests]) => ({
        file,
        testCount: tests.length,
        totalDuration: tests.reduce((s, t) => s + (t.duration || 0), 0),
        suggestion: tests.length >= 5 ? "Split into separate files for parallel execution" : "Can run tests within file in parallel with test.describe.parallel()",
      }));
  }

  /**
   * Identify tests that are too long and should be split.
   * @param {Array<{ name: string, duration?: number }>} results @param {number} [maxDuration=60000]
   */
  suggestTestSplitting(results, maxDuration = 60000) {
    return results
      .filter((r) => (r.duration || 0) > maxDuration)
      .map((r) => ({
        name: r.name,
        duration: r.duration,
        suggestion: `Test takes ${Math.round(r.duration / 1000)}s — consider splitting into smaller, focused tests`,
      }));
  }

  /** @param {object} analyses */
  generateReport(analyses) {
    logger.info(`[FrameworkOptimization] Report: ${analyses.totalTests} tests, ${analyses.slowTests?.length || 0} slow`);
    return {
      ...analyses,
      recommendations: [
        ...(analyses.slowTests?.length ? ["Optimize slow tests or increase parallelism"] : []),
        ...(analyses.splitSuggestions?.length ? ["Split long-running tests into smaller units"] : []),
        ...(analyses.parallelSuggestions?.length ? ["Enable parallel execution for independent test files"] : []),
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

export default new FrameworkOptimization();
