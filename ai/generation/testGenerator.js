import logger from "../../core/logging/logger.js";

class TestGenerator {
  /**
   * Generate test code from a natural language description.
   * Placeholder: would use AI provider in production.
   * @param {string} description @param {{ baseUrl?: string, suiteName?: string }} [options]
   */
  async generate(description, options = {}) {
    logger.info(`[TestGenerator] Generating test for: ${description.slice(0, 80)}`);
    const steps = this._descriptionToSteps(description);
    const code = this.formatAsPlaywright(steps, options);
    return { description, steps, code, generatedAt: new Date().toISOString() };
  }

  /**
   * Analyze a page and generate a test skeleton for its interactive elements.
   * @param {object} page - Playwright page @param {{ suiteName?: string }} [options]
   */
  async generateFromPage(page, options = {}) {
    const title = await page.title();
    const url = page.url();
    const inputs = await page.$$eval("input, select, textarea, button, a[href]", (els) =>
      els.slice(0, 30).map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.type || "",
        id: el.id || "",
        name: el.name || "",
        text: el.textContent?.trim().slice(0, 50) || "",
      }))
    );
    const steps = inputs.map((el) => {
      if (el.tag === "button" || el.tag === "a") return { action: "click", target: el.text || el.id };
      if (el.tag === "input" && el.type !== "submit") return { action: "fill", target: el.name || el.id, value: "test" };
      if (el.tag === "select") return { action: "select", target: el.name || el.id };
      return { action: "interact", target: el.tag };
    });
    return { url, title, elements: inputs.length, steps, code: this.formatAsPlaywright(steps, { ...options, suiteName: title }) };
  }

  /**
   * Convert steps to a Playwright test code string.
   * @param {Array<{ action: string, target: string, value?: string }>} steps
   * @param {{ suiteName?: string }} [options]
   */
  formatAsPlaywright(steps, options = {}) {
    const suite = options.suiteName || "Generated Test";
    const lines = [`import { test, expect } from '@playwright/test';`, "", `test.describe('${suite}', () => {`];
    lines.push(`  test('should complete flow', async ({ page }) => {`);
    for (const step of steps) {
      if (step.action === "click") lines.push(`    await page.getByRole('button', { name: '${step.target}' }).click();`);
      else if (step.action === "fill") lines.push(`    await page.getByLabel('${step.target}').fill('${step.value || "test"}');`);
      else if (step.action === "navigate") lines.push(`    await page.goto('${step.target}');`);
      else lines.push(`    // TODO: ${step.action} on ${step.target}`);
    }
    lines.push("  });", "});", "");
    return lines.join("\n");
  }

  _descriptionToSteps(description) {
    const steps = [];
    const sentences = description.split(/[.;,]/).map((s) => s.trim()).filter(Boolean);
    for (const s of sentences) {
      const lower = s.toLowerCase();
      if (lower.includes("navigate") || lower.includes("go to") || lower.includes("open")) {
        steps.push({ action: "navigate", target: s.match(/["']([^"']+)["']/)?.[1] || "/" });
      } else if (lower.includes("click")) {
        steps.push({ action: "click", target: s.replace(/click\s*(on)?\s*/i, "").trim() });
      } else if (lower.includes("fill") || lower.includes("type") || lower.includes("enter")) {
        steps.push({ action: "fill", target: s.replace(/fill|type|enter/i, "").trim(), value: "test data" });
      } else if (lower.includes("verify") || lower.includes("check") || lower.includes("assert")) {
        steps.push({ action: "assert", target: s });
      } else {
        steps.push({ action: "step", target: s });
      }
    }
    return steps;
  }
}

export default new TestGenerator();
