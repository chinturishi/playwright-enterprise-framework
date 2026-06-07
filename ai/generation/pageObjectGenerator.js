import logger from "../../core/logging/logger.js";

class PageObjectGenerator {
  /**
   * Analyze a page and generate a Page Object class.
   * @param {object} page - Playwright page @param {string} pageName
   */
  async generate(page, pageName) {
    const elements = await page.$$eval("input, button, select, textarea, a[href], [data-testid]", (els) =>
      els.slice(0, 40).map((el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        name: el.name || "",
        testId: el.getAttribute("data-testid") || "",
        type: el.type || "",
        text: el.textContent?.trim().slice(0, 30) || "",
      }))
    );

    const locators = elements.map((el) => {
      const locName = this._toVarName(el.testId || el.name || el.id || el.text || el.tag);
      const selector = el.testId ? `[data-testid="${el.testId}"]` : el.id ? `#${el.id}` : el.name ? `[name="${el.name}"]` : el.tag;
      return { name: locName, selector, tag: el.tag, type: el.type };
    });

    const actions = await this.detectActions(page);
    const code = this.formatAsClass(pageName, locators, actions);
    logger.info(`[PageObjectGenerator] Generated PO "${pageName}" with ${locators.length} locators`);
    return { pageName, locators, actions, code };
  }

  /**
   * Build a Page Object class string.
   * @param {string} pageName
   * @param {Array<{ name: string, selector: string }>} locators
   * @param {Array<{ name: string, type: string }>} methods
   */
  formatAsClass(pageName, locators, methods) {
    const className = pageName.replace(/\s+/g, "") + "Page";
    const lines = [`export class ${className} {`, "  constructor(page) {", "    this.page = page;"];
    for (const l of locators) {
      lines.push(`    this.${l.name} = page.locator('${l.selector}');`);
    }
    lines.push("  }", "");
    for (const m of methods) {
      if (m.type === "click") {
        lines.push(`  async click${this._capitalize(m.name)}() {`, `    await this.${m.name}.click();`, "  }", "");
      } else if (m.type === "fill") {
        lines.push(`  async fill${this._capitalize(m.name)}(value) {`, `    await this.${m.name}.fill(value);`, "  }", "");
      }
    }
    lines.push("}", "");
    return lines.join("\n");
  }

  /** @param {object} page */
  async detectActions(page) {
    return page.$$eval("input, button, select, textarea, a", (els) =>
      els.slice(0, 30).map((el) => {
        const name = el.getAttribute("data-testid") || el.name || el.id || el.textContent?.trim().slice(0, 20) || el.tagName;
        const type = ["button", "a"].includes(el.tagName.toLowerCase()) || el.type === "submit" ? "click" : "fill";
        return { name: name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30) || "element", type };
      })
    );
  }

  _toVarName(str) {
    return (str || "element").replace(/[^a-zA-Z0-9]/g, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "element";
  }

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default new PageObjectGenerator();
