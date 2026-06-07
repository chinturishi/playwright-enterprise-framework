import dotenv from "dotenv";
import logger from "../logging/logger.js";

class EnvUtils {
  #loaded = false;

  constructor() {
    if (EnvUtils._instance) return EnvUtils._instance;
    EnvUtils._instance = this;
  }

  /**
   * Loads environment variables from the given .env file path.
   * @param {string} [path=".env"]
   * @returns {EnvUtils}
   */
  load(path = ".env") {
    const result = dotenv.config({ path });
    if (result.error) {
      logger.warn(`Could not load env file at ${path}: ${result.error.message}`);
    } else {
      logger.info(`Environment loaded from ${path}`);
    }
    this.#loaded = true;
    return this;
  }

  /**
   * @param {string} key
   * @param {string} [defaultValue]
   * @returns {string|undefined}
   */
  get(key, defaultValue = undefined) {
    return process.env[key] ?? defaultValue;
  }

  /**
   * Returns the env variable or throws if missing.
   * @param {string} key
   * @returns {string}
   */
  getRequired(key) {
    const value = process.env[key];
    if (value === undefined || value === "") {
      throw new Error(`Required environment variable "${key}" is not set`);
    }
    return value;
  }

  /**
   * @param {string} key
   * @param {boolean} [defaultValue=false]
   * @returns {boolean}
   */
  getBoolean(key, defaultValue = false) {
    const raw = process.env[key];
    if (raw === undefined) return defaultValue;
    return raw === "true" || raw === "1";
  }

  /**
   * @param {string} key
   * @param {number} [defaultValue=0]
   * @returns {number}
   */
  getNumber(key, defaultValue = 0) {
    const raw = process.env[key];
    if (raw === undefined) return defaultValue;
    const num = Number(raw);
    return Number.isFinite(num) ? num : defaultValue;
  }

  /**
   * Parses a delimited env variable into an array.
   * @param {string} key
   * @param {string} [separator=","]
   * @returns {string[]}
   */
  getList(key, separator = ",") {
    const raw = process.env[key];
    if (!raw) return [];
    return raw.split(separator).map((s) => s.trim()).filter(Boolean);
  }
}

const envUtils = new EnvUtils();
export default envUtils;
