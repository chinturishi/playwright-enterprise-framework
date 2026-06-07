import logger from "../../core/logging/logger.js";

const STABILITY_WEIGHTS = {
  testid: 95,
  role: 90,
  label: 85,
  placeholder: 70,
  id: 65,
  css_class: 40,
  xpath_absolute: 15,
  xpath_relative: 50,
  text: 60,
  nth: 20,
};

class SelectorAnalyzer {
  /**
   * Parse and assess a selector's type and stability.
   * @param {string} selector
   * @returns {{ type: string, stability: number, details: object }}
   */
  analyze(selector) {
    const type = this._detectType(selector);
    const stability = this.getStabilityScore(selector);
    return { selector, type, stability, fragile: stability < 50 };
  }

  /**
   * Suggest a more stable replacement for a selector.
   * @param {string} selector @param {{ tagName?: string, attributes?: object }} element
   */
  suggestImprovement(selector, element = {}) {
    const attrs = element.attributes || {};
    if (attrs["data-testid"]) return `[data-testid="${attrs["data-testid"]}"]`;
    if (attrs.role && attrs.name) return `role=${attrs.role}[name="${attrs.name}"]`;
    if (attrs["aria-label"]) return `[aria-label="${attrs["aria-label"]}"]`;
    if (attrs.id) return `#${attrs.id}`;
    logger.debug(`[SelectorAnalyzer] No improvement found for: ${selector}`);
    return selector;
  }

  /**
   * Score a selector 0-100 for robustness.
   * @param {string} selector
   */
  getStabilityScore(selector) {
    const type = this._detectType(selector);
    let score = STABILITY_WEIGHTS[type] || 30;
    if (/\[\d+\]/.test(selector)) score -= 15;
    if (selector.split(">").length > 4) score -= 10;
    if (/nth-child|nth-of-type/.test(selector)) score -= 10;
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Sort selectors by stability descending.
   * @param {string[]} selectors
   */
  rankSelectors(selectors) {
    return [...selectors]
      .map((s) => ({ selector: s, score: this.getStabilityScore(s) }))
      .sort((a, b) => b.score - a.score);
  }

  _detectType(selector) {
    if (/data-testid/.test(selector)) return "testid";
    if (/^role=/.test(selector) || /getByRole/.test(selector)) return "role";
    if (/aria-label/.test(selector)) return "label";
    if (/placeholder/.test(selector)) return "placeholder";
    if (/^#[\w-]+$/.test(selector)) return "id";
    if (/^\/\//.test(selector) || selector.startsWith("xpath=")) {
      return selector.startsWith("//html") || /^\/html/.test(selector) ? "xpath_absolute" : "xpath_relative";
    }
    if (/text=/.test(selector) || /getByText/.test(selector)) return "text";
    if (/nth/.test(selector)) return "nth";
    return "css_class";
  }
}

export default new SelectorAnalyzer();
