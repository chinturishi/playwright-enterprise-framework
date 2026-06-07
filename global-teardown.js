import logger from "./core/logging/logger.js";

/**
 * Playwright globalTeardown hook.
 * Runs after all tests complete — use for cleanup of shared resources.
 */
async function globalTeardown() {
  logger.info("Global teardown complete");
}

export default globalTeardown;
