import logger from "../../core/logging/logger.js";

class RetryInsights {
  constructor() {
    this._retryCount = 0;
    this._totalTests = 0;
  }

  /**
   * Analyze retry patterns across test data.
   * @param {Array<{ name: string, retries?: number, status: string, error?: string }>} retryData
   */
  analyze(retryData) {
    this._totalTests = retryData.length;
    const retried = retryData.filter((t) => t.retries > 0);
    this._retryCount = retried.length;

    const totalRetries = retried.reduce((sum, t) => sum + (t.retries || 0), 0);
    const avgRetries = retried.length ? totalRetries / retried.length : 0;
    const maxRetries = retried.reduce((max, t) => Math.max(max, t.retries || 0), 0);

    logger.info(`[RetryInsights] ${retried.length}/${retryData.length} tests needed retries`);
    return {
      totalTests: retryData.length,
      retriedTests: retried.length,
      totalRetries,
      averageRetries: Math.round(avgRetries * 100) / 100,
      maxRetries,
    };
  }

  /** @returns {number} Percentage of tests needing at least one retry */
  getRetryRate() {
    return this._totalTests ? (this._retryCount / this._totalTests) * 100 : 0;
  }

  /**
   * Group retried tests by their error message.
   * @param {Array<{ name: string, error?: string, retries?: number }>} retryData
   */
  getCommonRetryReasons(retryData) {
    const reasons = {};
    for (const t of retryData.filter((r) => r.retries > 0 && r.error)) {
      const key = t.error.split("\n")[0].slice(0, 120);
      reasons[key] = reasons[key] || [];
      reasons[key].push(t.name);
    }
    return Object.entries(reasons)
      .map(([reason, tests]) => ({ reason, count: tests.length, tests }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Recommend a retry count based on observed data.
   * @param {Array} retryData
   */
  recommendRetryStrategy(retryData) {
    const retried = retryData.filter((t) => t.retries > 0);
    if (!retried.length) return { recommendedRetries: 0, reason: "No retries observed" };

    const passedOnRetry = retried.filter((t) => t.status === "passed");
    const successRate = retried.length ? passedOnRetry.length / retried.length : 0;
    const maxNeeded = passedOnRetry.reduce((max, t) => Math.max(max, t.retries || 1), 1);

    return {
      recommendedRetries: Math.min(maxNeeded, 3),
      retrySuccessRate: Math.round(successRate * 100),
      reason: successRate > 0.8 ? "Retries are effective, keep current strategy"
        : successRate > 0.5 ? "Moderate effectiveness — investigate root causes"
        : "Low effectiveness — fix underlying issues rather than retrying",
    };
  }
}

export default new RetryInsights();
