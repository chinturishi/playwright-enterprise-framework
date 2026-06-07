import logger from "../../core/logging/logger.js";

class ConsoleLogAnalyzer {
  constructor() {
    this._errors = [];
    this._warnings = [];
    this._logs = [];
    this._listener = null;
  }

  /**
   * Start capturing console messages from a Playwright page.
   * @param {object} page - Playwright page object
   */
  capture(page) {
    this._errors = [];
    this._warnings = [];
    this._logs = [];
    this._listener = (msg) => {
      const entry = { type: msg.type(), text: msg.text(), timestamp: new Date().toISOString() };
      if (msg.type() === "error") this._errors.push(entry);
      else if (msg.type() === "warning") this._warnings.push(entry);
      this._logs.push(entry);
    };
    page.on("console", this._listener);
    logger.debug("[ConsoleLogAnalyzer] Capture started");
  }

  /** @returns {Array} Captured error-level console messages */
  getErrors() {
    return [...this._errors];
  }

  /** @returns {Array} Captured warning-level console messages */
  getWarnings() {
    return [...this._warnings];
  }

  /**
   * Categorize and prioritize console output.
   * @param {Array<{ type: string, text: string }>} logs
   */
  analyze(logs) {
    const items = logs || this._logs;
    const errors = items.filter((l) => l.type === "error");
    const warnings = items.filter((l) => l.type === "warning");
    const jsErrors = errors.filter((e) => /uncaught|referenceerror|typeerror|syntaxerror/i.test(e.text));
    const networkErrors = errors.filter((e) => /failed to load|net::|cors/i.test(e.text));

    return {
      total: items.length,
      errors: errors.length,
      warnings: warnings.length,
      jsErrors: jsErrors.length,
      networkErrors: networkErrors.length,
      critical: jsErrors.concat(networkErrors),
    };
  }

  /**
   * Find console messages related to a specific test error.
   * @param {Array} logs @param {string} testError
   */
  findRelevant(logs, testError) {
    if (!testError) return [];
    const keywords = testError.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    return (logs || this._logs).filter((l) =>
      keywords.some((kw) => l.text.toLowerCase().includes(kw))
    );
  }
}

export default new ConsoleLogAnalyzer();
