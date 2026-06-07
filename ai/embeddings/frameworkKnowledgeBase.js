import logger from "../../core/logging/logger.js";
import VectorStore from "./vectorStore.js";

class FrameworkKnowledgeBase {
  constructor() {
    this.store = new VectorStore(".ai-store/knowledge");
  }

  /**
   * Store a test failure for learning.
   * @param {{ testName: string, error: string, category?: string, fix?: string }} failure
   */
  async addFailure(failure) {
    const id = `failure-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await this.store.add(id, `${failure.testName}: ${failure.error}`, {
      type: "failure",
      category: failure.category,
      fix: failure.fix,
      timestamp: new Date().toISOString(),
    });
    logger.debug(`[KnowledgeBase] Stored failure: ${failure.testName}`);
  }

  /**
   * Store a locator change for learning.
   * @param {{ original: string, replacement: string, page?: string }} change
   */
  async addLocatorChange(change) {
    const id = `locator-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await this.store.add(id, `Locator changed: ${change.original} -> ${change.replacement}`, {
      type: "locator_change",
      ...change,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Store a flaky pattern for learning.
   * @param {{ testName: string, pattern: string, frequency: number }} pattern
   */
  async addFlakyPattern(pattern) {
    const id = `flaky-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await this.store.add(id, `Flaky: ${pattern.testName} - ${pattern.pattern}`, {
      type: "flaky_pattern",
      ...pattern,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Search the knowledge base for relevant entries.
   * @param {string} query @param {number} [topK=5]
   */
  async search(query, topK = 5) {
    return this.store.search(query, topK);
  }

  /** @returns {Promise<object>} Summary of learned patterns */
  async getInsights() {
    const all = await this.store.getAll();
    const byType = {};
    for (const entry of all) {
      const type = entry.metadata?.type || "other";
      byType[type] = (byType[type] || 0) + 1;
    }
    logger.info(`[KnowledgeBase] ${all.length} total entries`);
    return { totalEntries: all.length, byType, lastUpdated: all[all.length - 1]?.addedAt || null };
  }
}

export default new FrameworkKnowledgeBase();
