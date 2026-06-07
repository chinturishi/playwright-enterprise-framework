import logger from "../../core/logging/logger.js";

class StacktraceAnalyzer {
  /**
   * Parse a stack trace into structured frames.
   * @param {string} stacktrace
   * @returns {Array<{ file: string, line: number, column: number, fn: string }>}
   */
  parse(stacktrace) {
    if (!stacktrace) return [];
    return stacktrace
      .split("\n")
      .filter((line) => line.includes("at "))
      .map((line) => {
        const match = line.match(/at\s+(?:(.+?)\s+)?\(?(.+?):(\d+):(\d+)\)?/);
        if (!match) return null;
        return { fn: match[1] || "<anonymous>", file: match[2], line: parseInt(match[3], 10), column: parseInt(match[4], 10) };
      })
      .filter(Boolean);
  }

  /**
   * Identify the most relevant frame (first non-framework, non-node_modules frame).
   * @param {string} stacktrace
   */
  findRootCause(stacktrace) {
    const frames = this.parse(stacktrace);
    const userFrame = frames.find(
      (f) => !f.file.includes("node_modules") && !f.file.includes("internal/") && !f.file.includes("playwright/lib")
    );
    return userFrame || frames[0] || null;
  }

  /**
   * Check if the error originates in framework code vs user test code.
   * @param {string} stacktrace
   */
  isFrameworkError(stacktrace) {
    const root = this.findRootCause(stacktrace);
    if (!root) return false;
    return root.file.includes("core/") || root.file.includes("node_modules");
  }

  /**
   * Remove noisy frames, keep only relevant ones.
   * @param {string} stacktrace
   */
  simplify(stacktrace) {
    const frames = this.parse(stacktrace);
    const simplified = frames.filter(
      (f) => !f.file.includes("node_modules") && !f.file.includes("internal/") && !f.fn.includes("processTicksAndRejections")
    );
    logger.debug(`[StacktraceAnalyzer] Simplified ${frames.length} -> ${simplified.length} frames`);
    return simplified;
  }
}

export default new StacktraceAnalyzer();
