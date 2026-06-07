import logger from "./logger.js";
import { LogFormatter } from "./logFormatter.js";

export class ExecutionLogger {
  #currentTest = null;
  #currentSuite = null;
  #testStartTime = null;
  #steps = [];

  /**
   * @param {string} [suiteName]
   */
  constructor(suiteName) {
    this.#currentSuite = suiteName || null;
  }

  /**
   * Marks the beginning of a test and logs the formatted header.
   * @param {string} testName
   */
  startTest(testName) {
    this.#currentTest = testName;
    this.#testStartTime = Date.now();
    this.#steps = [];
    logger.info(LogFormatter.formatTestStart(testName));
  }

  /**
   * Marks the end of a test, logs the formatted footer with duration.
   * @param {string} testName
   * @param {string} status - passed | failed | skipped | timedOut
   */
  endTest(testName, status) {
    const duration = this.#testStartTime ? Date.now() - this.#testStartTime : 0;
    logger.info(LogFormatter.formatTestEnd(testName, status, duration));
    logger.info(
      LogFormatter.toJSON({
        event: "testEnd",
        test: testName,
        suite: this.#currentSuite,
        status,
        duration,
        steps: this.#steps.length
      })
    );
    this.#currentTest = null;
    this.#testStartTime = null;
    this.#steps = [];
  }

  /**
   * Logs an execution step within the current test.
   * @param {string} message
   */
  step(message) {
    this.#steps.push({ message, timestamp: Date.now() });
    logger.info(LogFormatter.formatStep(message));
  }

  /**
   * Logs an attachment reference (screenshot, video, trace).
   * @param {string} name
   * @param {string} filePath
   */
  attachment(name, filePath) {
    logger.info(`  📎 Attachment: ${name} → ${filePath}`);
  }

  /**
   * Logs an error within the current test context.
   * @param {Error} error
   */
  error(error) {
    logger.error(LogFormatter.formatError(error));
  }

  /** @returns {string|null} */
  get currentTest() {
    return this.#currentTest;
  }

  /** @returns {string|null} */
  get currentSuite() {
    return this.#currentSuite;
  }

  /** @param {string} suiteName */
  set suite(suiteName) {
    this.#currentSuite = suiteName;
  }
}
