import logger from "../../core/logging/logger.js";

class JiraParser {
  /**
   * Extract testable requirements from a Jira issue object.
   * @param {{ key: string, fields: { summary?: string, description?: string, issuetype?: { name: string }, acceptance_criteria?: string, customfield_acceptance_criteria?: string } }} jiraData
   */
  parseTicket(jiraData) {
    const fields = jiraData.fields || {};
    const description = fields.description || "";
    const ac = this.getAcceptanceCriteria(jiraData);
    const steps = this.extractSteps(description);

    logger.info(`[JiraParser] Parsed ${jiraData.key}: ${ac.length} AC, ${steps.length} steps`);
    return {
      key: jiraData.key,
      summary: fields.summary || "",
      type: fields.issuetype?.name || "unknown",
      acceptanceCriteria: ac,
      testSteps: steps,
      testable: ac.length > 0 || steps.length > 0,
    };
  }

  /**
   * Extract test steps from Jira description text.
   * @param {string} description
   */
  extractSteps(description) {
    if (!description) return [];
    const steps = [];
    const lines = description.split("\n").map((l) => l.trim()).filter(Boolean);

    let inSteps = false;
    for (const line of lines) {
      if (/^(steps|test\s+steps|how\s+to\s+test|reproduction)/i.test(line)) { inSteps = true; continue; }
      if (inSteps && /^(acceptance|expected|notes|description)/i.test(line)) { inSteps = false; continue; }
      if (inSteps) {
        const cleaned = line.replace(/^[-*•\d.)\]]+\s*/, "").trim();
        if (cleaned.length > 3) steps.push(cleaned);
      }
    }

    if (!steps.length) {
      const numbered = lines.filter((l) => /^\d+[.)]\s+/.test(l));
      for (const n of numbered) steps.push(n.replace(/^\d+[.)]\s*/, "").trim());
    }
    return steps;
  }

  /**
   * Extract acceptance criteria from Jira data (checking common field patterns).
   * @param {object} jiraData
   */
  getAcceptanceCriteria(jiraData) {
    const fields = jiraData.fields || {};
    const acField = fields.acceptance_criteria || fields.customfield_acceptance_criteria || "";
    if (acField) {
      return acField.split("\n").map((l) => l.replace(/^[-*•\d.)\]]+\s*/, "").trim()).filter((l) => l.length > 3);
    }

    const desc = fields.description || "";
    const acMatch = desc.match(/acceptance\s+criteria[:\s]*([\s\S]*?)(?=\n\n|steps|$)/i);
    if (acMatch) {
      return acMatch[1].split("\n").map((l) => l.replace(/^[-*•\d.)\]]+\s*/, "").trim()).filter((l) => l.length > 3);
    }
    return [];
  }
}

export default new JiraParser();
