import logger from "../../core/logging/logger.js";

class StoryAnalyzer {
  /**
   * Parse a user story into structured components.
   * @param {string} storyText
   */
  parse(storyText) {
    const asA = storyText.match(/as\s+(?:a|an)\s+(.+?)(?:,|\s+i\s+want)/i)?.[1]?.trim() || "";
    const iWant = storyText.match(/i\s+want\s+(?:to\s+)?(.+?)(?:,|\s+so\s+that)/i)?.[1]?.trim() || "";
    const soThat = storyText.match(/so\s+that\s+(.+)/i)?.[1]?.trim() || "";
    return { asA, iWant, soThat, valid: !!(asA && iWant) };
  }

  /**
   * Extract acceptance criteria from story text.
   * @param {string} storyText
   */
  extractAcceptanceCriteria(storyText) {
    const criteria = [];
    const acSection = storyText.match(/acceptance\s+criteria[:\s]*([\s\S]*?)(?=\n\n|$)/i)?.[1] || "";
    const lines = acSection.split("\n").map((l) => l.replace(/^[-*•\d.)\]]+\s*/, "").trim()).filter(Boolean);
    if (lines.length) return lines.map((l, i) => ({ id: `AC-${i + 1}`, text: l }));

    const givenWhens = storyText.match(/(?:given|when|then|and)\s+.+/gi) || [];
    for (const gw of givenWhens) criteria.push({ id: `AC-${criteria.length + 1}`, text: gw.trim() });
    return criteria.length ? criteria : [{ id: "AC-1", text: "Acceptance criteria not explicitly defined in story" }];
  }

  /**
   * Score how testable a story is (0-100).
   * @param {{ asA: string, iWant: string, soThat: string }} story
   */
  assessTestability(story) {
    let score = 0;
    if (story.asA) score += 15;
    if (story.iWant) score += 25;
    if (story.soThat) score += 15;
    const action = (story.iWant || "").toLowerCase();
    if (/click|submit|fill|select|navigate|upload|download/.test(action)) score += 20;
    if (/see|view|display|show|receive|get/.test(action)) score += 15;
    if (action.length > 10) score += 10;
    logger.debug(`[StoryAnalyzer] Testability score: ${Math.min(score, 100)}`);
    return { score: Math.min(score, 100), testable: score >= 50 };
  }

  /**
   * Recommend test cases for a user story.
   * @param {{ asA: string, iWant: string, soThat: string }} story
   */
  suggestTestCases(story) {
    const cases = [];
    if (story.iWant) {
      cases.push({ type: "positive", description: `Verify user can ${story.iWant}` });
      cases.push({ type: "negative", description: `Verify proper error when ${story.iWant} fails` });
    }
    if (/form|input|submit/.test(story.iWant || "")) {
      cases.push({ type: "validation", description: "Verify form validation for required fields" });
      cases.push({ type: "boundary", description: "Verify field length and format constraints" });
    }
    if (/login|auth|access/.test(story.iWant || "")) {
      cases.push({ type: "security", description: "Verify unauthorized access is prevented" });
    }
    return cases;
  }
}

export default new StoryAnalyzer();
