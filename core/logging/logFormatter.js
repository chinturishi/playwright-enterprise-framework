export class LogFormatter {
  /**
   * @param {string} testName
   * @returns {string}
   */
  static formatTestStart(testName) {
    const separator = "=".repeat(60);
    return `\n${separator}\n▶ TEST START: ${testName}\n  Time: ${new Date().toISOString()}\n${separator}`;
  }

  /**
   * @param {string} testName
   * @param {string} status - passed | failed | skipped | timedOut
   * @param {number} duration - milliseconds
   * @returns {string}
   */
  static formatTestEnd(testName, status, duration) {
    const icon = status === "passed" ? "✓" : status === "failed" ? "✗" : "⊘";
    const separator = "-".repeat(60);
    return `${separator}\n${icon} TEST END: ${testName}\n  Status: ${status.toUpperCase()}  Duration: ${duration}ms\n${separator}`;
  }

  /**
   * @param {string} stepName
   * @returns {string}
   */
  static formatStep(stepName) {
    return `  → Step: ${stepName}`;
  }

  /**
   * @param {Error} error
   * @returns {string}
   */
  static formatError(error) {
    const stack = error.stack ? `\n  Stack: ${error.stack.split("\n").slice(1, 4).join("\n        ")}` : "";
    return `  ✗ Error: ${error.message}${stack}`;
  }

  /**
   * @param {string} method - HTTP method
   * @param {string} url
   * @returns {string}
   */
  static formatApiRequest(method, url) {
    return `  → API Request: ${method.toUpperCase()} ${url}`;
  }

  /**
   * @param {number} status - HTTP status code
   * @param {number} duration - milliseconds
   * @returns {string}
   */
  static formatApiResponse(status, duration) {
    return `  ← API Response: ${status} (${duration}ms)`;
  }

  /**
   * Converts a structured log entry to a JSON string.
   * @param {object} logEntry
   * @returns {string}
   */
  static toJSON(logEntry) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      ...logEntry
    });
  }
}
