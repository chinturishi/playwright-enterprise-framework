const modelConfig = {
  models: {
    claude: "claude-sonnet-4-20250514",
    openai: "gpt-4o",
    gemini: "gemini-2.0-flash",
  },
  defaultProvider: "claude",
  maxRetries: parseInt(process.env.AI_MAX_RETRIES, 10) || 3,
  timeout: parseInt(process.env.AI_TIMEOUT_MS, 10) || 30000,
  costTracking: {
    enabled: process.env.AI_COST_TRACKING === "true",
    budgetPerRun: parseFloat(process.env.AI_BUDGET_PER_RUN) || 1.0,
    currency: "USD",
  },

  /** @param {string} provider - Provider name */
  getModel(provider) {
    return this.models[provider] || this.models[this.defaultProvider];
  },

  /** @param {string} provider @param {string} model */
  setModel(provider, model) {
    this.models[provider] = model;
  },

  getAvailableProviders() {
    return Object.keys(this.models);
  },
};

export default modelConfig;
