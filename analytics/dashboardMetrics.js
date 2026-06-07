import logger from "../core/logging/logger.js";

class DashboardMetrics {
  /**
   * Compute all dashboard metrics from test results.
   * @param {Array<{ name: string, status: string, duration?: number, file?: string, environment?: string }>} results
   */
  calculate(results) {
    return {
      health: this.getHealthScore(results),
      total: results.length,
      passed: results.filter((r) => r.status === "passed").length,
      failed: results.filter((r) => r.status === "failed").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      passRate: results.length ? Math.round((results.filter((r) => r.status === "passed").length / results.length) * 100 * 100) / 100 : 0,
      avgDuration: this._avgDuration(results),
      moduleBreakdown: this.getModuleBreakdown(results),
      environmentBreakdown: this.getEnvironmentBreakdown(results),
    };
  }

  /**
   * Calculate an overall health score 0-100.
   * @param {Array} results
   */
  getHealthScore(results) {
    if (!results.length) return 0;
    const passRate = results.filter((r) => r.status === "passed").length / results.length;
    const skipPenalty = (results.filter((r) => r.status === "skipped").length / results.length) * 10;
    return Math.max(0, Math.round(passRate * 100 - skipPenalty));
  }

  /**
   * Break down results by module/file.
   * @param {Array} results
   */
  getModuleBreakdown(results) {
    const modules = {};
    for (const r of results) {
      const mod = r.file || "unknown";
      modules[mod] = modules[mod] || { total: 0, passed: 0, failed: 0, duration: 0 };
      modules[mod].total++;
      if (r.status === "passed") modules[mod].passed++;
      else if (r.status === "failed") modules[mod].failed++;
      modules[mod].duration += r.duration || 0;
    }
    return Object.entries(modules).map(([name, m]) => ({
      module: name,
      ...m,
      passRate: m.total ? Math.round((m.passed / m.total) * 100) : 0,
    }));
  }

  /**
   * Break down results by environment.
   * @param {Array} results
   */
  getEnvironmentBreakdown(results) {
    const envs = {};
    for (const r of results) {
      const env = r.environment || "default";
      envs[env] = envs[env] || { total: 0, passed: 0, failed: 0 };
      envs[env].total++;
      if (r.status === "passed") envs[env].passed++;
      else if (r.status === "failed") envs[env].failed++;
    }
    return Object.entries(envs).map(([name, e]) => ({
      environment: name,
      ...e,
      passRate: e.total ? Math.round((e.passed / e.total) * 100) : 0,
    }));
  }

  /**
   * Serialize metrics to dashboard-ready JSON.
   * @param {object} metrics
   */
  toJSON(metrics) {
    return { ...metrics, generatedAt: new Date().toISOString() };
  }

  _avgDuration(results) {
    const durations = results.filter((r) => r.duration).map((r) => r.duration);
    return durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;
  }
}

export default new DashboardMetrics();
