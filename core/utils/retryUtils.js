import logger from "../logging/logger.js";

class RetryUtils {
  constructor() {
    if (RetryUtils._instance) return RetryUtils._instance;
    RetryUtils._instance = this;
  }

  /**
   * Retries an async function with configurable backoff.
   * @param {() => Promise<*>} fn
   * @param {{ maxRetries?: number, delay?: number, backoff?: number, shouldRetry?: (err: Error) => boolean, label?: string }} [options]
   * @returns {Promise<*>}
   */
  async retry(fn, options = {}) {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = 2,
      shouldRetry = () => true,
      label = "operation"
    } = options;

    let lastError;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await fn();
        if (attempt > 1) {
          logger.info(`${label} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (err) {
        lastError = err;
        if (attempt > maxRetries || !shouldRetry(err)) {
          logger.error(`${label} failed after ${attempt} attempt(s): ${err.message}`);
          throw err;
        }
        const waitMs = delay * Math.pow(backoff, attempt - 1);
        logger.warn(
          `${label} attempt ${attempt} failed: ${err.message}. Retrying in ${waitMs}ms...`
        );
        await this.#sleep(waitMs);
      }
    }
    throw lastError;
  }

  /**
   * Polls an async predicate function until it returns a truthy value or times out.
   * @param {() => Promise<*>} fn - Should return a truthy value when done
   * @param {{ timeout?: number, interval?: number, label?: string }} [options]
   * @returns {Promise<*>} The truthy result
   */
  async poll(fn, options = {}) {
    const {
      timeout = 30_000,
      interval = 500,
      label = "poll"
    } = options;

    const deadline = Date.now() + timeout;
    let attempts = 0;

    while (Date.now() < deadline) {
      attempts++;
      try {
        const result = await fn();
        if (result) {
          logger.debug(`${label} resolved after ${attempts} poll(s)`);
          return result;
        }
      } catch (err) {
        logger.debug(`${label} poll attempt ${attempts} threw: ${err.message}`);
      }
      if (Date.now() + interval >= deadline) break;
      await this.#sleep(interval);
    }

    throw new Error(
      `${label} timed out after ${timeout}ms (${attempts} attempts)`
    );
  }

  #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const retryUtils = new RetryUtils();
export default retryUtils;
