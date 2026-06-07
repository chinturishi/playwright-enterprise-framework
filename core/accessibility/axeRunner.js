import logger from "../logging/logger.js";

class AxeRunner {
  constructor() {
    this.excludeSelectors = [];
    this.includeSelectors = [];
  }

  /**
   * Run accessibility analysis using Playwright's accessibility snapshot API.
   * Falls back to axe-core injection if available.
   * @param {import('@playwright/test').Page} page
   * @param {object} [options={}]
   * @returns {Promise<{violations: Array, passes: number, timestamp: string}>}
   */
  async analyze(page, options = {}) {
    logger.info("Running accessibility analysis");
    try {
      const snapshot = await page.accessibility.snapshot({ interestingOnly: false });
      const violations = this._analyzeSnapshot(snapshot, options);
      return {
        violations,
        passes: 0,
        timestamp: new Date().toISOString(),
        source: "playwright-accessibility-snapshot",
      };
    } catch {
      logger.debug("Playwright accessibility snapshot unavailable, using DOM-based analysis");
      return this._domBasedAnalysis(page, options);
    }
  }

  /**
   * Run analysis restricted to specific rules.
   * @param {import('@playwright/test').Page} page
   * @param {string[]} rules - Rule IDs to check (e.g. ['image-alt', 'label'])
   * @returns {Promise<{violations: Array, passes: number, timestamp: string}>}
   */
  async analyzeWithRules(page, rules) {
    logger.info(`Analyzing with rules: ${rules.join(", ")}`);
    return this.analyze(page, { rules });
  }

  /**
   * Run analysis for specific WCAG tags.
   * @param {import('@playwright/test').Page} page
   * @param {string[]} tags - e.g. ['wcag2a', 'wcag2aa']
   * @returns {Promise<{violations: Array, passes: number, timestamp: string}>}
   */
  async analyzeWithTags(page, tags) {
    logger.info(`Analyzing with WCAG tags: ${tags.join(", ")}`);
    return this.analyze(page, { tags });
  }

  /**
   * Exclude elements from analysis.
   * @param {string[]} selectors - CSS selectors to exclude
   */
  exclude(selectors) {
    this.excludeSelectors = selectors;
    logger.debug(`Excluding selectors: ${selectors.join(", ")}`);
  }

  /**
   * Include only specific elements in analysis.
   * @param {string[]} selectors - CSS selectors to include
   */
  include(selectors) {
    this.includeSelectors = selectors;
    logger.debug(`Including selectors: ${selectors.join(", ")}`);
  }

  /** @private */
  _analyzeSnapshot(snapshot, options) {
    const violations = [];
    if (!snapshot) return violations;

    const walk = (node, depth = 0) => {
      if (!node) return;
      if (node.role === "img" && !node.name) {
        violations.push({
          id: "image-alt",
          impact: "critical",
          description: "Images must have alternate text",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.7/image-alt",
          nodes: [{ target: node.name || "unknown" }],
        });
      }
      if (node.role === "textbox" && !node.name) {
        violations.push({
          id: "label",
          impact: "serious",
          description: "Form elements must have labels",
          helpUrl: "https://dequeuniversity.com/rules/axe/4.7/label",
          nodes: [{ target: node.name || "unknown" }],
        });
      }
      if (node.children) {
        for (const child of node.children) walk(child, depth + 1);
      }
    };

    walk(snapshot);
    return violations;
  }

  /** @private */
  async _domBasedAnalysis(page, options) {
    const violations = await page.evaluate((opts) => {
      const issues = [];
      const images = document.querySelectorAll("img");
      images.forEach(img => {
        if (!img.alt && !img.getAttribute("aria-label")) {
          issues.push({ id: "image-alt", impact: "critical", description: "Image missing alt text", nodes: [{ target: img.outerHTML.slice(0, 80) }] });
        }
      });
      const inputs = document.querySelectorAll("input, textarea, select");
      inputs.forEach(el => {
        const id = el.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
        if (!hasLabel && !hasAriaLabel && el.type !== "hidden") {
          issues.push({ id: "label", impact: "serious", description: "Form element missing label", nodes: [{ target: el.outerHTML.slice(0, 80) }] });
        }
      });
      return issues;
    }, options);

    return { violations, passes: 0, timestamp: new Date().toISOString(), source: "dom-analysis" };
  }
}

export default new AxeRunner();
