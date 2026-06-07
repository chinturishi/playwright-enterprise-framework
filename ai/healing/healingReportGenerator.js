import logger from "../../core/logging/logger.js";

class HealingReportGenerator {
  constructor() {
    this.healings = [];
  }

  /**
   * Record a healing event.
   * @param {string} original @param {string} healed @param {string} page @param {string} [timestamp]
   */
  addHealing(original, healed, page, timestamp) {
    this.healings.push({
      original,
      healed,
      page: typeof page === "string" ? page : page?.url?.() || "unknown",
      timestamp: timestamp || new Date().toISOString(),
      success: !!healed,
    });
  }

  /** @returns {{ total: number, successful: number, failed: number, rate: number, items: Array }} */
  generateReport() {
    const successful = this.healings.filter((h) => h.success).length;
    const failed = this.healings.length - successful;
    const report = {
      total: this.healings.length,
      successful,
      failed,
      rate: this.healings.length ? (successful / this.healings.length) * 100 : 0,
      items: this.healings,
      generatedAt: new Date().toISOString(),
    };
    logger.info(`[HealingReport] ${report.total} healings, ${report.rate.toFixed(1)}% success`);
    return report;
  }

  /** @returns {number} */
  getHealingCount() {
    return this.healings.length;
  }

  /** @returns {number} Percentage 0-100 */
  getSuccessRate() {
    if (!this.healings.length) return 0;
    return (this.healings.filter((h) => h.success).length / this.healings.length) * 100;
  }

  toJSON() {
    return { healings: this.healings, summary: this.generateReport() };
  }
}

export default new HealingReportGenerator();
