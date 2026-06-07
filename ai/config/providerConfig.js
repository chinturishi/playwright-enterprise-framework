const providerConfig = {
  providers: {
    claude: {
      apiKey: process.env.CLAUDE_API_KEY || "",
      baseUrl: process.env.CLAUDE_BASE_URL || "https://api.anthropic.com/v1",
      model: "claude-sonnet-4-20250514",
      rateLimit: { requestsPerMinute: 50, tokensPerMinute: 100000 },
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: "gpt-4o",
      rateLimit: { requestsPerMinute: 60, tokensPerMinute: 150000 },
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || "",
      baseUrl: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1",
      model: "gemini-2.0-flash",
      rateLimit: { requestsPerMinute: 60, tokensPerMinute: 120000 },
    },
  },

  /** @param {string} name - Provider name */
  get(name) {
    return this.providers[name] || null;
  },

  /** @param {string} name */
  hasValidKey(name) {
    const p = this.providers[name];
    return p && p.apiKey && p.apiKey.length > 0;
  },

  getConfigured() {
    return Object.keys(this.providers).filter((n) => this.hasValidKey(n));
  },
};

export default providerConfig;
