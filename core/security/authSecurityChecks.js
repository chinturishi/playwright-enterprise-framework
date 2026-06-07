import logger from "../logging/logger.js";

class AuthSecurityChecks {
  /**
   * Verify that protected URLs redirect unauthenticated users to a login page.
   * @param {import('@playwright/test').Page} page
   * @param {string[]} protectedUrls - URLs that should require authentication
   * @returns {Promise<{passed: boolean, results: Array<{url: string, redirected: boolean, finalUrl: string}>}>}
   */
  async checkUnauthorizedAccess(page, protectedUrls) {
    const results = [];

    for (const url of protectedUrls) {
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      const finalUrl = page.url();
      const status = response?.status() || 0;
      const redirected = finalUrl !== url || status === 401 || status === 403;
      results.push({ url, redirected, finalUrl, status });
    }

    const passed = results.every(r => r.redirected);
    logger.info(`Unauthorized access check: ${passed ? "PASS" : "FAIL"} (${results.filter(r => !r.redirected).length} unprotected)`);
    return { passed, results };
  }

  /**
   * Verify that session ID changes after login (protection against session fixation).
   * @param {import('@playwright/test').Page} page
   * @param {Function} loginFn - Async function that performs login on the page
   * @returns {Promise<{passed: boolean, preLoginSession: string|null, postLoginSession: string|null}>}
   */
  async checkSessionFixation(page, loginFn) {
    const getCookieValues = async () => {
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c =>
        c.name.toLowerCase().includes("session") || c.name.toLowerCase().includes("sid")
      );
      return sessionCookie?.value || null;
    };

    const preLoginSession = await getCookieValues();
    await loginFn(page);
    const postLoginSession = await getCookieValues();

    const passed = !preLoginSession || preLoginSession !== postLoginSession;
    logger.info(`Session fixation check: ${passed ? "PASS" : "FAIL"}`);
    return { passed, preLoginSession, postLoginSession };
  }

  /**
   * Verify that no sensitive tokens are exposed in the URL.
   * @param {import('@playwright/test').Page} page
   * @returns {{passed: boolean, findings: Array<{pattern: string, found: boolean}>}}
   */
  checkTokenInURL(page) {
    const url = page.url();
    const sensitivePatterns = [
      { pattern: "token=", regex: /[?&]token=/i },
      { pattern: "access_token=", regex: /[?&]access_token=/i },
      { pattern: "api_key=", regex: /[?&]api_key=/i },
      { pattern: "secret=", regex: /[?&]secret=/i },
      { pattern: "password=", regex: /[?&]password=/i },
      { pattern: "session_id=", regex: /[?&]session_id=/i },
    ];

    const findings = sensitivePatterns.map(({ pattern, regex }) => ({
      pattern,
      found: regex.test(url),
    }));

    const passed = findings.every(f => !f.found);
    if (!passed) {
      logger.warn(`Token in URL detected: ${findings.filter(f => f.found).map(f => f.pattern).join(", ")}`);
    }
    return { passed, findings };
  }

  /**
   * Check for sensitive data patterns exposed in page source.
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<{passed: boolean, findings: Array<{type: string, found: boolean}>}>}
   */
  async checkSensitiveDataExposure(page) {
    const content = await page.content();
    const patterns = [
      { type: "SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/ },
      { type: "Credit Card", regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/ },
      { type: "Private Key", regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
      { type: "AWS Key", regex: /AKIA[0-9A-Z]{16}/ },
      { type: "JWT Token", regex: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/ },
    ];

    const findings = patterns.map(({ type, regex }) => ({
      type,
      found: regex.test(content),
    }));

    const passed = findings.every(f => !f.found);
    if (!passed) {
      logger.warn(`Sensitive data exposure detected: ${findings.filter(f => f.found).map(f => f.type).join(", ")}`);
    }
    return { passed, findings };
  }

  /**
   * Generate a consolidated authentication security report.
   * @param {object} results - Object containing results from various checks
   * @returns {string}
   */
  generateReport(results) {
    const lines = ["Authentication Security Report", ""];

    if (results.unauthorizedAccess) {
      lines.push(`[${results.unauthorizedAccess.passed ? "PASS" : "FAIL"}] Unauthorized Access Protection`);
      for (const r of results.unauthorizedAccess.results) {
        lines.push(`  ${r.redirected ? "[OK]" : "[EXPOSED]"} ${r.url} -> ${r.finalUrl}`);
      }
      lines.push("");
    }

    if (results.sessionFixation) {
      lines.push(`[${results.sessionFixation.passed ? "PASS" : "FAIL"}] Session Fixation Protection`);
      lines.push("");
    }

    if (results.tokenInURL) {
      lines.push(`[${results.tokenInURL.passed ? "PASS" : "FAIL"}] Token in URL`);
      for (const f of results.tokenInURL.findings.filter(x => x.found)) {
        lines.push(`  [EXPOSED] ${f.pattern}`);
      }
      lines.push("");
    }

    if (results.sensitiveData) {
      lines.push(`[${results.sensitiveData.passed ? "PASS" : "FAIL"}] Sensitive Data Exposure`);
      for (const f of results.sensitiveData.findings.filter(x => x.found)) {
        lines.push(`  [EXPOSED] ${f.type}`);
      }
    }

    return lines.join("\n");
  }
}

export default new AuthSecurityChecks();
