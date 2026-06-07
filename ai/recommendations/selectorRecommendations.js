import logger from "../../core/logging/logger.js";

const STABILITY_TIERS = {
  "data-testid": { score: 95, tier: "excellent" },
  role: { score: 90, tier: "excellent" },
  "aria-label": { score: 85, tier: "good" },
  placeholder: { score: 70, tier: "fair" },
  id: { score: 65, tier: "fair" },
  css_class: { score: 40, tier: "poor" },
  xpath: { score: 25, tier: "fragile" },
};

class SelectorRecommendations {
  /**
   * Score a list of selectors for stability.
   * @param {string[]} selectors
   */
  analyze(selectors) {
    return selectors.map((s) => {
      const type = this._detectType(s);
      const tier = STABILITY_TIERS[type] || { score: 30, tier: "unknown" };
      return { selector: s, type, score: tier.score, tier: tier.tier };
    });
  }

  /**
   * Suggest a better selector based on context.
   * @param {string} selector @param {{ testId?: string, role?: string, ariaLabel?: string, id?: string }} context
   */
  recommend(selector, context = {}) {
    if (context.testId) return { recommended: `[data-testid="${context.testId}"]`, reason: "data-testid is the most stable selector strategy" };
    if (context.role && context.ariaLabel) return { recommended: `role=${context.role}[name="${context.ariaLabel}"]`, reason: "Role-based selectors are accessible and stable" };
    if (context.ariaLabel) return { recommended: `[aria-label="${context.ariaLabel}"]`, reason: "aria-label selectors are accessibility-friendly" };
    if (context.id) return { recommended: `#${context.id}`, reason: "ID selectors are fairly stable" };
    return { recommended: selector, reason: "No better alternative found; add data-testid to the element" };
  }

  /**
   * Get accessible alternatives preferring role/label/testid.
   * @param {string} selector
   */
  getAccessibleAlternatives(selector) {
    const type = this._detectType(selector);
    const alternatives = [];
    if (type !== "data-testid") alternatives.push({ strategy: "data-testid", example: '[data-testid="unique-id"]', priority: 1 });
    if (type !== "role") alternatives.push({ strategy: "role", example: "getByRole('button', { name: 'Submit' })", priority: 2 });
    if (type !== "aria-label") alternatives.push({ strategy: "aria-label", example: "getByLabel('Email')", priority: 3 });
    logger.debug(`[SelectorRecommendations] ${alternatives.length} alternatives for ${type} selector`);
    return alternatives.sort((a, b) => a.priority - b.priority);
  }

  _detectType(selector) {
    if (/data-testid/.test(selector)) return "data-testid";
    if (/^role=|getByRole/.test(selector)) return "role";
    if (/aria-label|getByLabel/.test(selector)) return "aria-label";
    if (/placeholder|getByPlaceholder/.test(selector)) return "placeholder";
    if (/^#[\w-]+$/.test(selector)) return "id";
    if (/^\/\/|^xpath=/.test(selector)) return "xpath";
    return "css_class";
  }
}

export default new SelectorRecommendations();
