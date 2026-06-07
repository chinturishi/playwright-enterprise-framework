import logger from "../logging/logger.js";
import { MAX_RETRIES, RETRY_DELAY_MS } from "../../config/constants/apiConstants.js";

/**
 * Database-agnostic query executor that wraps any DB client.
 */
class QueryExecutor {
  #client;

  /** @param {object} dbClient - Any DB client instance that exposes `.query(sql, params)` */
  constructor(dbClient) {
    this.#client = dbClient;
  }

  /**
   * Execute a single query through the underlying client.
   * @param {string} query
   * @param {Array} [params]
   * @returns {Promise<*>}
   */
  async execute(query, params = []) {
    logger.debug(`QueryExecutor: ${query.slice(0, 200)}`);
    const start = Date.now();
    const result = await this.#client.query(query, params);
    logger.info(`Query executed in ${Date.now() - start}ms`);
    return result;
  }

  /**
   * Execute an ordered list of queries sequentially.
   * @param {Array<{query: string, params?: Array}>} queries
   * @returns {Promise<Array<*>>}
   */
  async executeMany(queries) {
    const results = [];
    for (const { query, params } of queries) {
      results.push(await this.execute(query, params));
    }
    return results;
  }

  /**
   * Retry a query on transient failures.
   * @param {string} query
   * @param {Array} [params]
   * @param {number} [retries]
   * @returns {Promise<*>}
   */
  async executeWithRetry(query, params = [], retries = MAX_RETRIES) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.execute(query, params);
      } catch (err) {
        lastError = err;
        logger.warn(`Query attempt ${attempt}/${retries} failed: ${err.message}`);
        if (attempt < retries) await this.#sleep(RETRY_DELAY_MS * attempt);
      }
    }
    throw lastError;
  }

  #sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

export default QueryExecutor;
