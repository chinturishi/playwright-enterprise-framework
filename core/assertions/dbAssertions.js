import { expect } from "@playwright/test";
import logger from "../logging/logger.js";

class DbAssertions {
  /**
   * Assert that a query returns exactly `expectedCount` rows.
   * @param {import('../db/queryExecutor.js').default} queryExecutor
   * @param {string} query
   * @param {number} expectedCount
   * @param {Array} [params]
   */
  async assertRowCount(queryExecutor, query, expectedCount, params = []) {
    logger.info(`Asserting row count = ${expectedCount}`);
    const rows = await queryExecutor.execute(query, params);
    const count = Array.isArray(rows) ? rows.length : 0;
    expect(count).toBe(expectedCount);
    logger.info(`Row count assertion passed (${count})`);
  }

  /**
   * Assert that a query returns at least one row.
   * @param {import('../db/queryExecutor.js').default} queryExecutor
   * @param {string} query
   * @param {Array} [params]
   */
  async assertRowExists(queryExecutor, query, params = []) {
    logger.info("Asserting row exists");
    const rows = await queryExecutor.execute(query, params);
    const count = Array.isArray(rows) ? rows.length : 0;
    expect(count).toBeGreaterThan(0);
    logger.info("Row exists assertion passed");
  }

  /**
   * Assert that a query returns zero rows.
   * @param {import('../db/queryExecutor.js').default} queryExecutor
   * @param {string} query
   * @param {Array} [params]
   */
  async assertRowNotExists(queryExecutor, query, params = []) {
    logger.info("Asserting row does not exist");
    const rows = await queryExecutor.execute(query, params);
    const count = Array.isArray(rows) ? rows.length : 0;
    expect(count).toBe(0);
    logger.info("Row-not-exists assertion passed");
  }

  /**
   * Assert that a specific field in the first returned row equals an expected value.
   * @param {import('../db/queryExecutor.js').default} queryExecutor
   * @param {string} query
   * @param {Array} params
   * @param {string} fieldName
   * @param {*} expectedValue
   */
  async assertFieldValue(queryExecutor, query, params, fieldName, expectedValue) {
    logger.info(`Asserting field "${fieldName}" = ${JSON.stringify(expectedValue)}`);
    const rows = await queryExecutor.execute(query, params);
    expect(Array.isArray(rows) && rows.length).toBeTruthy();
    expect(rows[0][fieldName]).toEqual(expectedValue);
    logger.info(`Field value assertion passed — "${fieldName}"`);
  }

  /**
   * Assert that a field in the first returned row contains a substring.
   * @param {import('../db/queryExecutor.js').default} queryExecutor
   * @param {string} query
   * @param {Array} params
   * @param {string} fieldName
   * @param {string} substring
   */
  async assertFieldContains(queryExecutor, query, params, fieldName, substring) {
    logger.info(`Asserting field "${fieldName}" contains "${substring}"`);
    const rows = await queryExecutor.execute(query, params);
    expect(Array.isArray(rows) && rows.length).toBeTruthy();
    expect(String(rows[0][fieldName])).toContain(substring);
    logger.info(`Field-contains assertion passed — "${fieldName}"`);
  }

  /**
   * Execute a soft assertion that records failure without stopping the test.
   * @param {Function} assertion - Synchronous or async assertion callback
   * @param {string} message - Description for logging
   */
  async softAssert(assertion, message) {
    logger.info(`Soft DB assertion: ${message}`);
    try {
      await assertion();
      logger.info(`Soft assertion passed: ${message}`);
    } catch (err) {
      logger.warn(`Soft assertion failed: ${message} — ${err.message}`);
    }
  }
}

const dbAssertions = new DbAssertions();
export default dbAssertions;
