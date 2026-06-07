import dotenv from "dotenv";
import logger from "../../core/logging/logger.js";
import { frameworkConfig } from "./framework.config.js";

class ConfigLoader {
  #config = {};
  #loaded = false;

  constructor() {
    if (ConfigLoader._instance) {
      return ConfigLoader._instance;
    }
    ConfigLoader._instance = this;
  }

  /**
   * Loads environment variables and merges framework defaults with optional team overrides.
   * @param {{ teamConfig?: object, envPath?: string }} [options]
   * @returns {ConfigLoader}
   */
  load(options = {}) {
    if (this.#loaded) return this;

    dotenv.config({ path: options.envPath || ".env" });

    this.#config = this.#deepMerge({}, frameworkConfig);

    if (options.teamConfig) {
      this.#config = this.#deepMerge(this.#config, options.teamConfig);
    }

    this.#applyEnvOverrides();
    this.#loaded = true;
    logger.info("Configuration loaded successfully");
    return this;
  }

  /**
   * Retrieves a config value by dot-separated key path.
   * @param {string} key
   * @param {*} [defaultValue]
   * @returns {*}
   */
  get(key, defaultValue = undefined) {
    const parts = key.split(".");
    let current = this.#config;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return defaultValue;
      current = current[part];
    }
    return current !== undefined ? current : defaultValue;
  }

  /** @returns {object} Full merged configuration snapshot */
  getAll() {
    return structuredClone(this.#config);
  }

  /** Resets internal state so config can be reloaded (useful in tests). */
  reset() {
    this.#config = {};
    this.#loaded = false;
  }

  #applyEnvOverrides() {
    const envMap = {
      BASE_URL: "browser.baseUrl",
      BROWSER: "browser.name",
      HEADLESS: "browser.headless",
      TIMEOUT: "timeouts.default",
      WORKERS: "parallel.workers",
      RETRIES: "retry.count",
      LOG_LEVEL: "logging.level"
    };

    for (const [envKey, configPath] of Object.entries(envMap)) {
      const value = process.env[envKey];
      if (value === undefined) continue;
      this.#setByPath(configPath, this.#coerce(value));
    }
  }

  #setByPath(path, value) {
    const parts = path.split(".");
    let current = this.#config;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts.at(-1)] = value;
  }

  #coerce(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
  }

  #deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.#deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
}

const configLoader = new ConfigLoader();
export default configLoader;
