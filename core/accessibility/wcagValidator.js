import logger from "../logging/logger.js";

const WCAG_CRITERIA_MAP = {
  "image-alt": "1.1.1",
  "label": "1.3.1",
  "color-contrast": "1.4.3",
  "link-name": "2.4.4",
  "button-name": "4.1.2",
  "html-has-lang": "3.1.1",
  "document-title": "2.4.2",
  "duplicate-id": "4.1.1",
  "aria-roles": "4.1.2",
  "aria-valid-attr": "4.1.2",
  "bypass": "2.4.1",
  "meta-viewport": "1.4.4",
  "heading-order": "1.3.1",
  "tabindex": "2.4.3",
};

const LEVEL_MAP = {
  "1.1.1": "A", "1.3.1": "A", "1.4.3": "AA", "2.4.4": "A",
  "4.1.2": "A", "3.1.1": "A", "2.4.2": "A", "4.1.1": "A",
  "2.4.1": "A", "1.4.4": "AA", "2.4.3": "A", "1.4.6": "AAA",
};

class WcagValidator {
  /**
   * Validate scan results against a specific WCAG level.
   * @param {{violations: Array}} results
   * @param {string} level - 'A', 'AA', or 'AAA'
   * @returns {{compliant: boolean, failingCount: number, level: string}}
   */
  validateLevel(results, level) {
    const failing = this.getFailingCriteria(results, level);
    const compliant = failing.length === 0;
    logger.info(`WCAG ${level} validation: ${compliant ? "PASS" : "FAIL"} (${failing.length} failing criteria)`);
    return { compliant, failingCount: failing.length, level };
  }

  /**
   * Get the list of WCAG criteria that are failing for a given level.
   * @param {{violations: Array}} results
   * @param {string} level - 'A', 'AA', or 'AAA'
   * @returns {Array<{criterion: string, level: string, violations: Array}>}
   */
  getFailingCriteria(results, level) {
    const levelHierarchy = { A: ["A"], AA: ["A", "AA"], AAA: ["A", "AA", "AAA"] };
    const applicableLevels = levelHierarchy[level] || levelHierarchy.AA;
    const mapped = this.mapToWcag(results.violations);

    return mapped.filter(item => applicableLevels.includes(item.level));
  }

  /**
   * Map axe violation IDs to WCAG success criteria numbers.
   * @param {Array} violations
   * @returns {Array<{criterion: string, level: string, id: string, description: string, impact: string}>}
   */
  mapToWcag(violations) {
    return violations.map(v => {
      const criterion = WCAG_CRITERIA_MAP[v.id] || "unknown";
      const level = LEVEL_MAP[criterion] || "A";
      return {
        criterion,
        level,
        id: v.id,
        description: v.description,
        impact: v.impact,
      };
    });
  }

  /**
   * Generate a WCAG compliance report.
   * @param {{violations: Array}} results
   * @param {string} level - Target WCAG level
   * @returns {string}
   */
  generateComplianceReport(results, level) {
    const { compliant, failingCount } = this.validateLevel(results, level);
    const failing = this.getFailingCriteria(results, level);

    const lines = [
      `WCAG ${level} Compliance Report`,
      `Status: ${compliant ? "COMPLIANT" : "NON-COMPLIANT"}`,
      `Failing Criteria: ${failingCount}`,
      `Total Violations: ${results.violations.length}`,
      "",
    ];

    if (failing.length > 0) {
      lines.push("Failing Success Criteria:");
      for (const item of failing) {
        lines.push(`  SC ${item.criterion} (Level ${item.level}) - ${item.id}`);
        lines.push(`    ${item.description} [${item.impact}]`);
      }
    }

    return lines.join("\n");
  }
}

export default new WcagValidator();
