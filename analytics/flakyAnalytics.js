import logger from "../core/logging/logger.js";

class FlakyAnalytics {
  /**
   * Compute flaky metrics from execution history.
   * @param {Array<{ name: string, status: string, retries?: number, duration?: number, timestamp?: string }>} history
   */
  calculate(history) {
    return {
      flakeRate: this.getFlakeRate(history),
      topFlaky: this.getTopFlaky(history, 10),
      flakeTrend: this.getFlakeTrend(history, 30),
      estimatedCost: this.getCost(history),
      total: history.length,
      flakyCount: history.filter((h) => h.retries > 0).length,
    };
  }

  /**
   * Overall flake percentage.
   * @param {Array} history
   */
  getFlakeRate(history) {
    if (!history.length) return 0;
    return Math.round((history.filter((h) => h.retries > 0).length / history.length) * 100 * 100) / 100;
  }

  /**
   * Top N flakiest tests.
   * @param {Array} history @param {number} [count=10]
   */
  getTopFlaky(history, count = 10) {
    const stats = {};
    for (const h of history) {
      stats[h.name] = stats[h.name] || { runs: 0, flakes: 0, totalRetries: 0 };
      stats[h.name].runs++;
      if (h.retries > 0) { stats[h.name].flakes++; stats[h.name].totalRetries += h.retries; }
    }
    return Object.entries(stats)
      .map(([name, s]) => ({ name, flakeRate: Math.round((s.flakes / s.runs) * 100 * 100) / 100, ...s }))
      .filter((s) => s.flakes > 0)
      .sort((a, b) => b.flakeRate - a.flakeRate)
      .slice(0, count);
  }

  /**
   * Daily flake counts over a time window.
   * @param {Array} history @param {number} [days=30]
   */
  getFlakeTrend(history, days = 30) {
    const cutoff = Date.now() - days * 86400000;
    const daily = {};
    for (const h of history) {
      const ts = h.timestamp ? new Date(h.timestamp).getTime() : 0;
      if (ts < cutoff) continue;
      const day = new Date(ts).toISOString().slice(0, 10);
      daily[day] = daily[day] || { total: 0, flaky: 0 };
      daily[day].total++;
      if (h.retries > 0) daily[day].flaky++;
    }
    return Object.entries(daily)
      .map(([date, d]) => ({ date, ...d, rate: d.total ? Math.round((d.flaky / d.total) * 100) : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Estimate CI time wasted on flaky retries.
   * @param {Array} history
   */
  getCost(history) {
    const retried = history.filter((h) => h.retries > 0);
    const wastedMs = retried.reduce((sum, h) => sum + (h.duration || 30000) * (h.retries || 1), 0);
    const wastedMinutes = Math.round(wastedMs / 60000);
    logger.info(`[FlakyAnalytics] Estimated ${wastedMinutes} minutes wasted on retries`);
    return { wastedMs, wastedMinutes, retriedTests: retried.length };
  }
}

export default new FlakyAnalytics();
