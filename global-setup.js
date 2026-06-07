import dotenv from "dotenv";
import logger from "./core/logging/logger.js";
import configLoader from "./config/global/configLoader.js";

/**
 * Playwright globalSetup hook.
 * Loads environment variables and framework configuration before any tests run.
 */
async function globalSetup() {
  dotenv.config();
  configLoader.load();

  logger.info("Global setup complete");
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`Base URL: ${configLoader.get("browser.baseUrl", "not set")}`);
}

export default globalSetup;
