import logger from "../../core/logging/logger.js";

const aiConfig = {
  enabled: process.env.AI_ENABLED === "true",
  provider: process.env.AI_PROVIDER || "claude",
  maxTokens: parseInt(process.env.AI_MAX_TOKENS, 10) || 4096,
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.3,
  features: {
    healing: process.env.AI_HEALING_ENABLED !== "false",
    flakyDetection: process.env.AI_FLAKY_DETECTION_ENABLED !== "false",
    debugging: process.env.AI_DEBUGGING_ENABLED !== "false",
    generation: process.env.AI_GENERATION_ENABLED !== "false",
  },

  /** @returns {boolean} Whether AI features are globally enabled */
  isEnabled() {
    return this.enabled;
  },

  /** @param {string} feature - Feature name to check */
  isFeatureEnabled(feature) {
    if (!this.enabled) return false;
    return this.features[feature] === true;
  },

  /** @param {object} overrides - Partial config to merge */
  merge(overrides) {
    Object.assign(this, overrides);
    if (overrides.features) {
      Object.assign(this.features, overrides.features);
    }
    logger.info(`AI config updated: provider=${this.provider}, enabled=${this.enabled}`);
  },
};

export default aiConfig;
