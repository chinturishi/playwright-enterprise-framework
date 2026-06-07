import logger from "../../core/logging/logger.js";

class RootCauseReporter {
  /**
   * Group failures by root cause.
   * @param {Array<{ name: string, error?: string, category?: string }>} failures
   */
  async analyze(failures) {
    const groups = {};
    for (const f of failures) {
      const rootCause = this._extractRootCause(f.error || "");
      groups[rootCause] = groups[rootCause] || [];
      groups[rootCause].push(f);
    }
    const categorized = this.categorize(failures);
    logger.info(`[RootCauseReporter] ${Object.keys(groups).length} root causes from ${failures.length} failures`);
    return { rootCauses: groups, categories: categorized, totalFailures: failures.length };
  }

  /**
   * Categorize failures into environment/code/data/timing buckets.
   * @param {Array<{ error?: string }>} failures
   */
  categorize(failures) {
    const categories = { environment: [], code: [], data: [], timing: [], unknown: [] };
    for (const f of failures) {
      const msg = (f.error || "").toLowerCase();
      if (msg.includes("econnrefused") || msg.includes("env") || msg.includes("config") || msg.includes("permission")) {
        categories.environment.push(f);
      } else if (msg.includes("assert") || msg.includes("expect") || msg.includes("typeerror") || msg.includes("referenceerror")) {
        categories.code.push(f);
      } else if (msg.includes("null") || msg.includes("undefined") || msg.includes("data") || msg.includes("not found")) {
        categories.data.push(f);
      } else if (msg.includes("timeout") || msg.includes("deadline") || msg.includes("slow")) {
        categories.timing.push(f);
      } else {
        categories.unknown.push(f);
      }
    }
    return Object.fromEntries(
      Object.entries(categories).map(([cat, items]) => [cat, { count: items.length, tests: items.map((f) => f.name) }])
    );
  }

  /** @param {{ rootCauses: object, categories: object, totalFailures: number }} analyses */
  generateReport(analyses) {
    return {
      ...analyses,
      topRootCauses: Object.entries(analyses.rootCauses)
        .map(([cause, tests]) => ({ cause, count: tests.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      generatedAt: new Date().toISOString(),
    };
  }

  _extractRootCause(error) {
    const firstLine = error.split("\n")[0].trim();
    return firstLine.replace(/\s*(at\s+.*|Error:?\s*)/g, "").slice(0, 100) || "Unknown";
  }
}

export default new RootCauseReporter();
