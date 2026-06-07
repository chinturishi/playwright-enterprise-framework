import logger from "../../core/logging/logger.js";

class TrendAnalyzer {
  /**
   * Identify quality trends from execution history.
   * @param {Array<{ timestamp?: string, passRate?: number, total?: number, failed?: number }>} history
   */
  analyze(history) {
    if (history.length < 2) return { trend: "insufficient_data", data: history };
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    const recentAvg = this._avgPassRate(recent);
    const olderAvg = this._avgPassRate(older);
    const delta = recentAvg - olderAvg;
    return {
      trend: delta > 2 ? "improving" : delta < -2 ? "declining" : "stable",
      recentAvgPassRate: Math.round(recentAvg),
      olderAvgPassRate: Math.round(olderAvg),
      delta: Math.round(delta * 100) / 100,
      dataPoints: history.length,
    };
  }

  /**
   * Predict next run pass rate using moving average.
   * @param {Array<{ passRate?: number }>} history @param {number} [window=5]
   */
  predictNextRun(history, window = 5) {
    const rates = history.map((h) => h.passRate ?? 0).slice(-window);
    if (!rates.length) return { predicted: 0, confidence: "none" };
    const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
    const variance = rates.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / rates.length;
    return {
      predicted: Math.round(avg * 100) / 100,
      confidence: variance < 25 ? "high" : variance < 100 ? "medium" : "low",
      basedOn: rates.length,
    };
  }

  /**
   * Flag unusual results (anomalies) in history.
   * @param {Array<{ passRate?: number, timestamp?: string }>} history
   */
  detectAnomalies(history) {
    if (history.length < 5) return [];
    const rates = history.map((h) => h.passRate ?? 0);
    const mean = rates.reduce((s, r) => s + r, 0) / rates.length;
    const stdDev = Math.sqrt(rates.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / rates.length);
    const threshold = 2 * stdDev;
    return history
      .filter((h) => Math.abs((h.passRate ?? 0) - mean) > threshold)
      .map((h) => ({ ...h, deviation: Math.round(Math.abs((h.passRate ?? 0) - mean) * 100) / 100, mean: Math.round(mean) }));
  }

  /** @param {Array} history */
  generateTrendReport(history) {
    const analysis = this.analyze(history);
    const prediction = this.predictNextRun(history);
    const anomalies = this.detectAnomalies(history);
    logger.info(`[TrendAnalyzer] Trend: ${analysis.trend}, predicted: ${prediction.predicted}%`);
    return { ...analysis, prediction, anomalies, generatedAt: new Date().toISOString() };
  }

  _avgPassRate(entries) {
    if (!entries.length) return 0;
    return entries.reduce((s, e) => s + (e.passRate ?? 0), 0) / entries.length;
  }
}

export default new TrendAnalyzer();
