import logger from "../../core/logging/logger.js";

const WEAK_ASSERTION_PATTERNS = [
  { pattern: /expect\(.+\)\.toBeTruthy\(\)/g, name: "toBeTruthy", suggestion: "Use a specific assertion like toBeVisible(), toHaveText(), or toEqual()" },
  { pattern: /expect\(.+\)\.toBeDefined\(\)/g, name: "toBeDefined", suggestion: "Assert the specific value instead of just checking definition" },
  { pattern: /expect\(.+\)\.not\.toBeNull\(\)/g, name: "notNull", suggestion: "Use a positive assertion on the expected value" },
  { pattern: /expect\(true\)/g, name: "hardcoded_true", suggestion: "Assert against actual dynamic values, not hardcoded booleans" },
  { pattern: /expect\(.+\.length\)\.toBeGreaterThan\(0\)/g, name: "length_gt_zero", suggestion: "Assert specific expected count or use toContain() for content" },
];

class AssertionRecommendations {
  /**
   * Find weak assertions in test code.
   * @param {string} testCode
   */
  analyze(testCode) {
    const issues = [];
    for (const p of WEAK_ASSERTION_PATTERNS) {
      const matches = testCode.match(p.pattern);
      if (matches) {
        issues.push({ name: p.name, occurrences: matches.length, suggestion: p.suggestion });
      }
    }
    logger.info(`[AssertionRecommendations] Found ${issues.length} weak assertion patterns`);
    return { issues, score: Math.max(0, 100 - issues.length * 15) };
  }

  /**
   * Recommend a stronger assertion.
   * @param {string} assertion
   */
  suggestStronger(assertion) {
    if (assertion.includes("toBeTruthy")) return { original: assertion, stronger: assertion.replace("toBeTruthy()", "toBeVisible()"), reason: "toBeVisible() is specific to element visibility" };
    if (assertion.includes("toBeDefined")) return { original: assertion, stronger: assertion.replace("toBeDefined()", "toEqual(expectedValue)"), reason: "Assert the exact expected value" };
    if (assertion.includes("not.toBeNull")) return { original: assertion, stronger: assertion.replace("not.toBeNull()", "toEqual(expectedValue)"), reason: "Positive assertions are clearer" };
    if (assertion.includes("toHaveLength")) return { original: assertion, stronger: assertion, reason: "toHaveLength is already specific" };
    return { original: assertion, stronger: assertion, reason: "Assertion is acceptable" };
  }

  /**
   * Identify test steps that should have assertions but don't.
   * @param {Array<{ action: string, target: string }>} testSteps
   */
  detectMissing(testSteps) {
    const missing = [];
    for (let i = 0; i < testSteps.length; i++) {
      const step = testSteps[i];
      const nextStep = testSteps[i + 1];
      if (step.action === "click" && (!nextStep || nextStep.action !== "assert")) {
        missing.push({ afterStep: i, action: step.action, target: step.target, suggestion: `Add assertion after clicking "${step.target}" to verify the expected outcome` });
      }
      if (step.action === "fill" && (!nextStep || nextStep.action !== "assert")) {
        missing.push({ afterStep: i, action: step.action, target: step.target, suggestion: `Verify the field "${step.target}" accepted the input value` });
      }
      if (step.action === "navigate" && (!nextStep || nextStep.action !== "assert")) {
        missing.push({ afterStep: i, action: step.action, target: step.target, suggestion: "Assert the page loaded correctly (title, URL, or key element visibility)" });
      }
    }
    return missing;
  }
}

export default new AssertionRecommendations();
