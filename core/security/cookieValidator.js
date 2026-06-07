import logger from "../logging/logger.js";

class CookieValidator {
  /**
   * Validate a single cookie's security attributes.
   * @param {object} cookie - Playwright cookie object
   * @returns {{name: string, findings: Array<{check: string, passed: boolean, detail: string}>}}
   */
  validateCookie(cookie) {
    const findings = [
      { check: "HttpOnly", ...this.checkHttpOnly(cookie) },
      { check: "Secure", ...this.checkSecure(cookie) },
      { check: "SameSite", ...this.checkSameSite(cookie) },
      { check: "Expiry", ...this.checkExpiry(cookie) },
    ];
    logger.debug(`Cookie "${cookie.name}": ${findings.filter(f => f.passed).length}/${findings.length} checks passed`);
    return { name: cookie.name, findings };
  }

  /**
   * Verify the HttpOnly flag is set.
   * @param {object} cookie
   * @returns {{passed: boolean, detail: string}}
   */
  checkHttpOnly(cookie) {
    const passed = cookie.httpOnly === true;
    return { passed, detail: passed ? "HttpOnly flag is set" : "HttpOnly flag is missing" };
  }

  /**
   * Verify the Secure flag is set.
   * @param {object} cookie
   * @returns {{passed: boolean, detail: string}}
   */
  checkSecure(cookie) {
    const passed = cookie.secure === true;
    return { passed, detail: passed ? "Secure flag is set" : "Secure flag is missing" };
  }

  /**
   * Verify the SameSite attribute.
   * @param {object} cookie
   * @param {string} [expected] - Expected value: 'Strict', 'Lax', or 'None'
   * @returns {{passed: boolean, detail: string}}
   */
  checkSameSite(cookie, expected) {
    const value = cookie.sameSite || "None";
    if (expected) {
      const passed = value.toLowerCase() === expected.toLowerCase();
      return { passed, detail: `SameSite=${value} (expected: ${expected})` };
    }
    const passed = value !== "None";
    return { passed, detail: `SameSite=${value}` };
  }

  /**
   * Verify the cookie has a reasonable expiry (not excessively long).
   * @param {object} cookie
   * @returns {{passed: boolean, detail: string}}
   */
  checkExpiry(cookie) {
    if (cookie.expires === -1 || !cookie.expires) {
      return { passed: true, detail: "Session cookie (no expiry)" };
    }
    const maxAcceptableDays = 365;
    const expiresDate = new Date(cookie.expires * 1000);
    const daysUntilExpiry = (expiresDate - Date.now()) / (1000 * 60 * 60 * 24);
    const passed = daysUntilExpiry <= maxAcceptableDays;
    return {
      passed,
      detail: passed
        ? `Expires in ${Math.round(daysUntilExpiry)} days`
        : `Excessive expiry: ${Math.round(daysUntilExpiry)} days (max recommended: ${maxAcceptableDays})`,
    };
  }

  /**
   * Audit an array of cookies and return consolidated findings.
   * @param {Array} cookies - Array of Playwright cookie objects
   * @returns {{totalCookies: number, issues: number, results: Array}}
   */
  auditCookies(cookies) {
    const results = cookies.map(c => this.validateCookie(c));
    const issues = results.reduce((count, r) => count + r.findings.filter(f => !f.passed).length, 0);
    logger.info(`Cookie audit: ${cookies.length} cookie(s), ${issues} issue(s) found`);
    return { totalCookies: cookies.length, issues, results };
  }

  /**
   * Generate a formatted cookie security report.
   * @param {{totalCookies: number, issues: number, results: Array}} auditResults
   * @returns {string}
   */
  generateReport(auditResults) {
    const lines = [
      "Cookie Security Report",
      `Total Cookies: ${auditResults.totalCookies}`,
      `Issues Found: ${auditResults.issues}`,
      "",
    ];

    for (const result of auditResults.results) {
      const failCount = result.findings.filter(f => !f.passed).length;
      lines.push(`Cookie: "${result.name}" ${failCount === 0 ? "(OK)" : `(${failCount} issue(s))`}`);
      for (const f of result.findings) {
        lines.push(`  ${f.passed ? "[PASS]" : "[FAIL]"} ${f.check}: ${f.detail}`);
      }
    }
    return lines.join("\n");
  }
}

export default new CookieValidator();
