import logger from "../logging/logger.js";

/**
 * Playwright custom reporter that logs suite lifecycle events through
 * the framework's Winston logger. Playwright instantiates this class
 * directly — do NOT export a singleton.
 *
 * @example
 * // playwright.config.js
 * reporter: [['./core/reporting/customReporter.js']]
 *
 * @implements {import('@playwright/test/reporter').Reporter}
 */
class CustomReporter {
  #totalTests = 0;
  #passed = 0;
  #failed = 0;
  #skipped = 0;
  #startTime = 0;

  /**
   * Called once before running tests.
   * @param {import('@playwright/test/reporter').FullConfig} config
   * @param {import('@playwright/test/reporter').Suite} suite
   */
  onBegin(config, suite) {
    this.#totalTests = suite.allTests().length;
    this.#startTime = Date.now();
    logger.info(`Test suite started — ${this.#totalTests} test(s) across ${config.projects.length} project(s)`);
  }

  /**
   * Called before an individual test runs.
   * @param {import('@playwright/test/reporter').TestCase} test
   */
  onTestBegin(test) {
    logger.info(`▶ START  ${test.titlePath().join(" › ")}`);
  }

  /**
   * Called after an individual test completes.
   * @param {import('@playwright/test/reporter').TestCase} test
   * @param {import('@playwright/test/reporter').TestResult} result
   */
  onTestEnd(test, result) {
    const duration = `${(result.duration / 1000).toFixed(2)}s`;
    const title = test.titlePath().join(" › ");

    switch (result.status) {
      case "passed":
        this.#passed++;
        logger.info(`✓ PASSED ${title} (${duration})`);
        break;
      case "failed":
      case "timedOut":
        this.#failed++;
        logger.error(`✗ FAILED ${title} (${duration})`);
        for (const error of result.errors) {
          logger.error(`  ${error.message?.split("\n")[0] ?? "Unknown error"}`);
        }
        break;
      case "skipped":
        this.#skipped++;
        logger.warn(`⊘ SKIPPED ${title}`);
        break;
      case "interrupted":
        this.#failed++;
        logger.error(`⚠ INTERRUPTED ${title}`);
        break;
    }
  }

  /**
   * Called when an unhandled error occurs outside of tests.
   * @param {import('@playwright/test/reporter').TestError} error
   */
  onError(error) {
    logger.error(`Unhandled error: ${error.message ?? error}`);
    if (error.stack) {
      logger.debug(error.stack);
    }
  }

  /**
   * Called after all tests have run.
   * @param {import('@playwright/test/reporter').FullResult} result
   */
  onEnd(result) {
    const elapsed = ((Date.now() - this.#startTime) / 1000).toFixed(2);
    logger.info("─".repeat(60));
    logger.info(`Suite finished — status: ${result.status}`);
    logger.info(`  Total: ${this.#totalTests}  Passed: ${this.#passed}  Failed: ${this.#failed}  Skipped: ${this.#skipped}`);
    logger.info(`  Duration: ${elapsed}s`);
    logger.info("─".repeat(60));
  }
}

export default CustomReporter;
