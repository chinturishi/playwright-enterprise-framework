import logger from "../../core/logging/logger.js";

class AcceptanceCriteriaParser {
  /**
   * Extract acceptance criteria from free-form text.
   * @param {string} text
   * @returns {Array<{ id: string, criterion: string, type: string }>}
   */
  parse(text) {
    const criteria = [];
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      const cleaned = line.replace(/^[-*•\d.)\]]+\s*/, "").replace(/^(AC|ac|Ac)[-:\s]*\d*[-:\s]*/i, "").trim();
      if (!cleaned || cleaned.length < 5) continue;

      const type = this._classifyCriterion(cleaned);
      criteria.push({ id: `AC-${criteria.length + 1}`, criterion: cleaned, type });
    }

    if (!criteria.length) {
      const sentences = text.split(/[.;]/).map((s) => s.trim()).filter((s) => s.length > 10);
      for (const s of sentences) {
        criteria.push({ id: `AC-${criteria.length + 1}`, criterion: s, type: this._classifyCriterion(s) });
      }
    }

    logger.info(`[AcceptanceCriteriaParser] Extracted ${criteria.length} criteria`);
    return criteria;
  }

  /**
   * Convert acceptance criteria into test case descriptions.
   * @param {Array<{ id: string, criterion: string, type: string }>} criteria
   */
  toTestCases(criteria) {
    return criteria.map((ac) => ({
      id: ac.id,
      testCase: `Verify: ${ac.criterion}`,
      type: ac.type,
      priority: ac.type === "functional" ? "high" : ac.type === "validation" ? "high" : "medium",
    }));
  }

  _classifyCriterion(text) {
    const lower = text.toLowerCase();
    if (/should\s+(see|display|show|view|appear)/.test(lower)) return "functional";
    if (/error|invalid|fail|reject|not\s+allow/.test(lower)) return "validation";
    if (/perform|fast|load|within|seconds/.test(lower)) return "performance";
    if (/role|permission|auth|secure|encrypt/.test(lower)) return "security";
    if (/accessible|screen\s+reader|keyboard|aria/.test(lower)) return "accessibility";
    return "functional";
  }
}

export default new AcceptanceCriteriaParser();
