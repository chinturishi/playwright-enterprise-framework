import logger from "../../core/logging/logger.js";
import fs from "fs";
import path from "path";

const STORE_DIR = ".ai-store/history";
const STORE_FILE = path.join(STORE_DIR, "runs.json");

class ExecutionHistoryStore {
  constructor() {
    this.runs = [];
    this._load();
  }

  /**
   * Store an execution run.
   * @param {{ runId?: string, timestamp?: string, tests: Array, duration?: number, passRate?: number }} runData
   */
  async addRun(runData) {
    const entry = {
      runId: runData.runId || `run-${Date.now()}`,
      timestamp: runData.timestamp || new Date().toISOString(),
      tests: runData.tests || [],
      duration: runData.duration || 0,
      passRate: runData.passRate ?? null,
    };
    this.runs.push(entry);
    this._persist();
    logger.debug(`[ExecutionHistory] Stored run ${entry.runId}`);
  }

  /**
   * Get past runs for a specific test.
   * @param {string} testName @param {number} [limit=20]
   */
  async getHistory(testName, limit = 20) {
    const matching = [];
    for (const run of this.runs) {
      const test = run.tests.find((t) => t.name === testName);
      if (test) matching.push({ ...test, runId: run.runId, runTimestamp: run.timestamp });
    }
    return matching.slice(-limit);
  }

  /**
   * Aggregate trends over recent days.
   * @param {number} [days=30]
   */
  async getOverallTrends(days = 30) {
    const cutoff = Date.now() - days * 86400000;
    const recent = this.runs.filter((r) => new Date(r.timestamp).getTime() > cutoff);
    const daily = {};
    for (const run of recent) {
      const day = run.timestamp.slice(0, 10);
      daily[day] = daily[day] || { runs: 0, totalTests: 0, passed: 0, totalDuration: 0 };
      daily[day].runs++;
      daily[day].totalTests += run.tests.length;
      daily[day].passed += run.tests.filter((t) => t.status === "passed").length;
      daily[day].totalDuration += run.duration;
    }
    return Object.entries(daily)
      .map(([date, d]) => ({ date, ...d, passRate: d.totalTests ? Math.round((d.passed / d.totalTests) * 100) : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Remove runs older than specified days.
   * @param {number} olderThanDays
   */
  async prune(olderThanDays) {
    const cutoff = Date.now() - olderThanDays * 86400000;
    const before = this.runs.length;
    this.runs = this.runs.filter((r) => new Date(r.timestamp).getTime() > cutoff);
    this._persist();
    logger.info(`[ExecutionHistory] Pruned ${before - this.runs.length} old runs`);
    return { removed: before - this.runs.length, remaining: this.runs.length };
  }

  _persist() {
    if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(this.runs, null, 2));
  }

  _load() {
    if (fs.existsSync(STORE_FILE)) {
      try { this.runs = JSON.parse(fs.readFileSync(STORE_FILE, "utf-8")); } catch { this.runs = []; }
    }
  }
}

export default new ExecutionHistoryStore();
