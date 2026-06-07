import logger from "../../core/logging/logger.js";

class FlakyDashboard {
  /**
   * Compute all dashboard data from execution history.
   * @param {Array<{ name: string, status: string, retries?: number, duration?: number, file?: string, timestamp?: string }>} history
   */
  generateData(history) {
    return {
      topFlaky: this.getTopFlaky(history, 10),
      moduleStability: this.getModuleStability(history),
      trendData: this.getTrendData(history, 30),
      summary: {
        total: history.length,
        flaky: history.filter((h) => h.retries > 0).length,
        flakyRate: history.length
          ? Math.round((history.filter((h) => h.retries > 0).length / history.length) * 100 * 100) / 100
          : 0,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get the top N flakiest tests.
   * @param {Array} history @param {number} [count=10]
   */
  getTopFlaky(history, count = 10) {
    const stats = {};
    for (const h of history) {
      stats[h.name] = stats[h.name] || { runs: 0, flakes: 0 };
      stats[h.name].runs++;
      if (h.retries > 0) stats[h.name].flakes++;
    }
    return Object.entries(stats)
      .map(([name, s]) => ({ name, flakeRate: Math.round((s.flakes / s.runs) * 100 * 100) / 100, runs: s.runs, flakes: s.flakes }))
      .sort((a, b) => b.flakeRate - a.flakeRate)
      .slice(0, count);
  }

  /**
   * Calculate stability per module (file/directory).
   * @param {Array} history
   */
  getModuleStability(history) {
    const modules = {};
    for (const h of history) {
      const mod = h.file || "unknown";
      modules[mod] = modules[mod] || { total: 0, passed: 0, flaky: 0 };
      modules[mod].total++;
      if (h.status === "passed") modules[mod].passed++;
      if (h.retries > 0) modules[mod].flaky++;
    }
    return Object.entries(modules).map(([name, m]) => ({
      module: name,
      stability: m.total ? Math.round((m.passed / m.total) * 100) : 0,
      flakyRate: m.total ? Math.round((m.flaky / m.total) * 100 * 100) / 100 : 0,
    }));
  }

  /**
   * Compute daily flake counts over a window.
   * @param {Array} history @param {number} [days=30]
   */
  getTrendData(history, days = 30) {
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
      .map(([date, d]) => ({ date, ...d, flakyRate: d.total ? Math.round((d.flaky / d.total) * 100 * 100) / 100 : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export default new FlakyDashboard();
