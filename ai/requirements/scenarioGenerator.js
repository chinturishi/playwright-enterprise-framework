import logger from "../../core/logging/logger.js";

class ScenarioGenerator {
  /**
   * Generate test scenarios from a requirement description.
   * Placeholder: would use AI for richer generation.
   * @param {string} requirement
   */
  async generate(requirement) {
    const keywords = requirement.toLowerCase();
    const scenarios = [];

    scenarios.push({ title: `Verify ${requirement.slice(0, 60)}`, type: "positive", steps: this._generateSteps(requirement, "positive") });
    scenarios.push({ title: `Verify error handling for ${requirement.slice(0, 50)}`, type: "negative", steps: this._generateSteps(requirement, "negative") });

    if (keywords.includes("form") || keywords.includes("input")) {
      scenarios.push({ title: "Validate required field errors", type: "validation", steps: this._generateSteps(requirement, "validation") });
    }
    if (keywords.includes("list") || keywords.includes("table") || keywords.includes("search")) {
      scenarios.push({ title: "Verify empty state", type: "boundary", steps: this._generateSteps(requirement, "boundary") });
    }

    logger.info(`[ScenarioGenerator] Generated ${scenarios.length} scenarios`);
    return scenarios;
  }

  /**
   * Parse a user story and generate scenarios from it.
   * @param {{ asA: string, iWant: string, soThat: string }} story
   */
  async generateFromUserStory(story) {
    const description = `${story.asA} wants to ${story.iWant} so that ${story.soThat}`;
    return this.generate(description);
  }

  /**
   * Format scenarios as Gherkin syntax.
   * @param {Array<{ title: string, steps: Array }>} scenarios
   */
  formatAsGherkin(scenarios) {
    return scenarios.map((s) => {
      const lines = [`Scenario: ${s.title}`];
      for (const step of s.steps) lines.push(`  ${step.keyword} ${step.text}`);
      return lines.join("\n");
    }).join("\n\n");
  }

  /**
   * Format scenarios as Playwright test skeletons.
   * @param {Array<{ title: string, steps: Array }>} scenarios
   */
  formatAsPlaywright(scenarios) {
    const lines = [`import { test, expect } from '@playwright/test';`, ""];
    for (const s of scenarios) {
      lines.push(`test('${s.title}', async ({ page }) => {`);
      for (const step of s.steps) lines.push(`  // ${step.keyword} ${step.text}`);
      lines.push("});", "");
    }
    return lines.join("\n");
  }

  _generateSteps(requirement, type) {
    const base = [{ keyword: "Given", text: "the user is on the application" }];
    if (type === "positive") {
      base.push({ keyword: "When", text: `the user performs the action: ${requirement.slice(0, 60)}` });
      base.push({ keyword: "Then", text: "the expected result is displayed" });
    } else if (type === "negative") {
      base.push({ keyword: "When", text: "the user provides invalid input" });
      base.push({ keyword: "Then", text: "an appropriate error message is shown" });
    } else if (type === "validation") {
      base.push({ keyword: "When", text: "the user submits without required fields" });
      base.push({ keyword: "Then", text: "validation errors are displayed" });
    } else {
      base.push({ keyword: "When", text: "there is no data available" });
      base.push({ keyword: "Then", text: "an empty state message is shown" });
    }
    return base;
  }
}

export default new ScenarioGenerator();
