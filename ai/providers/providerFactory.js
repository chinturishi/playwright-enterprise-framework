import logger from "../../core/logging/logger.js";
import ClaudeProvider from "./claudeProvider.js";
import providerConfig from "../config/providerConfig.js";

const registry = new Map();
registry.set("claude", ClaudeProvider);

class ProviderFactory {
  /**
   * Create a provider instance by name.
   * @param {string} providerName
   * @param {object} [config] - Override config (otherwise pulled from providerConfig)
   * @returns {object} Provider instance
   */
  static create(providerName, config) {
    const ProviderClass = registry.get(providerName);
    if (!ProviderClass) {
      throw new Error(`Unknown AI provider: "${providerName}". Available: ${[...registry.keys()].join(", ")}`);
    }
    const merged = { ...providerConfig.get(providerName), ...config };
    logger.info(`[ProviderFactory] Creating provider: ${providerName}`);
    return new ProviderClass(merged);
  }

  /** @returns {string[]} Registered provider names */
  static getAvailableProviders() {
    return [...registry.keys()];
  }

  /**
   * Register a new provider class.
   * @param {string} name @param {Function} providerClass
   */
  static registerProvider(name, providerClass) {
    registry.set(name, providerClass);
    logger.info(`[ProviderFactory] Registered provider: ${name}`);
  }
}

export default ProviderFactory;
