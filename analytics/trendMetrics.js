import logger from "../core/logging/logger.js";

class TrendMetrics {
  /**
   * Compute all trend data from execution history.
   * @param {Array<{ timestamp?: string, tests?: Array<{ name: string, status: string, duration?: number }> }>} history
   */
  calculate(history) {
    return {
      passRate: this.getPassRateTrend(history, 30),
      duration: this.getDurationTrend(history, 30),
      testCount: this.getTestCountTrend(history, 30),
      degradation: this.detectDegradation(history),
    };
  }

  /**
   * Daily pass rate over a window.
   * @param {Array} history @param {number} [days=30]
   */
  getPassRateTrend(history, days = 30) {
    return this._aggregate(history, days, (run) => {
      const tests = run.tests || [];
      const passed = tests.filter((t) => t.status === "passed").length;
      return { value: tests.length ? Math.round((passed / tests.length) * 100) : 0, count: tests.length };
    });
  }

  /**
   * Daily average duration trend.
   * @param {Array} history @param {number} [days=30]
   */
  getDurationTrend(history, days = 30) {
    return this._aggregate(history, days, (run) => {
      const durations = (run.tests || []).filter((t) => t.duration).map((t) => t.duration);
      const avg = durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;
      return { value: avg, count: durations.length };
    });
  }

  /**
   * Daily test count trend.
   * @param {Array} history @param {number} [days=30]
   */
  getTestCountTrend(history, days = 30) {
    return this._aggregate(history, days, (run) => ({
      value: (run.tests || []).length,
      count: 1,
    }));
  }

  /**
   * Detect declining quality trends.
   * @param {Array} history
   */
  detectDegradation(history) {
    if (history.length < 6) return { degrading: false, message: "Insufficient data" };
    const passRates = history.map((run) => {
      const tests = run.tests || [];
      return tests.length ? (tests.filter((t) => t.status === "passed").length / tests.length) * 100 : 0;
    });
    const recentAvg = this._avg(passRates.slice(-3));
    const olderAvg = this._avg(passRates.slice(-6, -3));
    const declining = recentAvg < olderAvg - 5;
    if (declining) logger.warn(`[TrendMetrics] Quality degradation detected: ${olderAvg.toFixed(1)}% -> ${recentAvg.toFixed(1)}%`);
    return {
      degrading: declining,
      recentAvg: Math.round(recentAvg * 100) / 100,
      olderAvg: Math.round(olderAvg * 100) / 100,
      delta: Math.round((recentAvg - olderAvg) * 100) / 100,
      message: declining ? "Quality is declining — investigate recent changes" : "Quality is stable or improving",
    };
  }

  _aggregate(history, days, extractFn) {
    const cutoff = Date.now() - days * 86400000;
    const daily = {};
    for (const run of history) {
      const ts = run.timestamp ? new Date(run.timestamp).getTime() : 0;
      if (ts < cutoff) continue;
      const day = new Date(ts).toISOString().slice(0, 10);
      const { value, count } = extractFn(run);
      daily[day] = daily[day] || { sum: 0, count: 0 };
      daily[day].sum += value * count;
      daily[day].count += count;
    }
    return Object.entries(daily)
      .map(([date, d]) => ({ date, value: d.count ? Math.round(d.sum / d.count) : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  _avg(arr) {
    return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
  }
}

export default new TrendMetrics();
