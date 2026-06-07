import logger from "../logging/logger.js";
import axeRunner from "./axeRunner.js";

class AccessibilityScanner {
  /**
   * Run a full accessibility audit on the page.
   * @param {import('@playwright/test').Page} page
   * @param {object} [options={}] - { rules, tags, exclude }
   * @returns {Promise<{violations: Array, passes: number, timestamp: string}>}
   */
  async scan(page, options = {}) {
    logger.info("Running accessibility scan");
    const results = await axeRunner.analyze(page, options);
    logger.info(`Scan complete: ${results.violations.length} violation(s) found`);
    return results;
  }

  /**
   * Audit a specific element on the page.
   * @param {import('@playwright/test').Locator} locator
   * @param {object} [options={}]
   * @returns {Promise<{violations: Array, passes: number}>}
   */
  async scanElement(locator, options = {}) {
    const page = locator.page();
    const selector = await locator.evaluate(el => {
      if (el.id) return `#${el.id}`;
      if (el.className) return `.${el.className.split(" ")[0]}`;
      return el.tagName.toLowerCase();
    });
    logger.info(`Scanning element: ${selector}`);
    return axeRunner.analyze(page, { ...options, include: [selector] });
  }

  /**
   * Filter violations by severity level.
   * @param {{violations: Array}} results - Scan results
   * @param {string} severity - 'critical' | 'serious' | 'moderate' | 'minor'
   * @returns {Array} Filtered violations
   */
  getViolations(results, severity) {
    if (!severity) return results.violations;
    return results.violations.filter(v => v.impact === severity);
  }

  /**
   * Format violations into a human-readable report.
   * @param {{violations: Array}} results
   * @returns {string}
   */
  generateReport(results) {
    const { violations } = results;
    if (violations.length === 0) {
      return "Accessibility Report: No violations found. Page is compliant.";
    }

    const lines = [`Accessibility Report: ${violations.length} violation(s) found\n`];
    const bySeverity = { critical: [], serious: [], moderate: [], minor: [] };

    for (const v of violations) {
      const bucket = bySeverity[v.impact] || bySeverity.minor;
      bucket.push(v);
    }

    for (const [severity, items] of Object.entries(bySeverity)) {
      if (items.length === 0) continue;
      lines.push(`[${severity.toUpperCase()}] (${items.length})`);
      for (const item of items) {
        lines.push(`  - ${item.id}: ${item.description}`);
        lines.push(`    Help: ${item.helpUrl || "N/A"}`);
        lines.push(`    Affected: ${item.nodes?.length || 0} element(s)`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }

  /**
   * Check if the page meets a WCAG compliance level.
   * @param {import('@playwright/test').Page} page
   * @param {string} [level='AA'] - 'A', 'AA', or 'AAA'
   * @returns {Promise<boolean>}
   */
  async isCompliant(page, level = "AA") {
    const tagMap = { A: ["wcag2a"], AA: ["wcag2a", "wcag2aa"], AAA: ["wcag2a", "wcag2aa", "wcag2aaa"] };
    const tags = tagMap[level] || tagMap.AA;
    const results = await axeRunner.analyzeWithTags(page, tags);
    const compliant = results.violations.length === 0;
    logger.info(`WCAG ${level} compliance: ${compliant ? "PASS" : "FAIL"}`);
    return compliant;
  }
}

export default new AccessibilityScanner();
