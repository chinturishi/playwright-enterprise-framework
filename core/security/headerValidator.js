import logger from "../logging/logger.js";

const RECOMMENDED_HEADERS = {
  "strict-transport-security": { required: true, minMaxAge: 31536000 },
  "content-security-policy": { required: true },
  "x-frame-options": { required: true, validValues: ["DENY", "SAMEORIGIN"] },
  "x-content-type-options": { required: true, expectedValue: "nosniff" },
  "referrer-policy": { required: true },
  "permissions-policy": { required: false },
  "x-xss-protection": { required: false },
};

class HeaderValidator {
  /**
   * Validate all standard security headers on a response.
   * @param {import('@playwright/test').Response} response
   * @returns {{passed: boolean, findings: Array<{header: string, status: string, detail: string}>}}
   */
  validateSecurityHeaders(response) {
    const headers = response.headers();
    const findings = [];

    for (const [header, config] of Object.entries(RECOMMENDED_HEADERS)) {
      const value = headers[header];
      if (!value) {
        findings.push({ header, status: config.required ? "FAIL" : "WARN", detail: "Missing" });
      } else {
        findings.push({ header, status: "PASS", detail: value });
      }
    }

    const passed = findings.every(f => f.status !== "FAIL");
    logger.info(`Security headers validation: ${passed ? "PASS" : "FAIL"} (${findings.filter(f => f.status === "FAIL").length} failures)`);
    return { passed, findings };
  }

  /**
   * Check if a specific header is present with an expected value.
   * @param {import('@playwright/test').Response} response
   * @param {string} name - Header name (case-insensitive)
   * @param {string} [expectedValue] - Optional expected value
   * @returns {{present: boolean, matches: boolean, actual: string|null}}
   */
  hasHeader(response, name, expectedValue) {
    const actual = response.headers()[name.toLowerCase()] || null;
    const present = actual !== null;
    const matches = expectedValue ? actual === expectedValue : present;
    return { present, matches, actual };
  }

  /**
   * Validate Content-Security-Policy header.
   * @param {import('@playwright/test').Response} response
   * @returns {{present: boolean, hasDefaultSrc: boolean, hasScriptSrc: boolean, allowsUnsafeInline: boolean, allowsUnsafeEval: boolean, value: string|null}}
   */
  checkCSP(response) {
    const value = response.headers()["content-security-policy"] || null;
    if (!value) return { present: false, hasDefaultSrc: false, hasScriptSrc: false, allowsUnsafeInline: false, allowsUnsafeEval: false, value };

    return {
      present: true,
      hasDefaultSrc: value.includes("default-src"),
      hasScriptSrc: value.includes("script-src"),
      allowsUnsafeInline: value.includes("'unsafe-inline'"),
      allowsUnsafeEval: value.includes("'unsafe-eval'"),
      value,
    };
  }

  /**
   * Validate Strict-Transport-Security header.
   * @param {import('@playwright/test').Response} response
   * @returns {{present: boolean, maxAge: number|null, includesSubdomains: boolean, preload: boolean}}
   */
  checkHSTS(response) {
    const value = response.headers()["strict-transport-security"] || null;
    if (!value) return { present: false, maxAge: null, includesSubdomains: false, preload: false };

    const maxAgeMatch = value.match(/max-age=(\d+)/);
    return {
      present: true,
      maxAge: maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : null,
      includesSubdomains: value.includes("includeSubDomains"),
      preload: value.includes("preload"),
    };
  }

  /**
   * @param {import('@playwright/test').Response} response
   */
  checkXFrameOptions(response) {
    const value = response.headers()["x-frame-options"] || null;
    const valid = value ? ["DENY", "SAMEORIGIN"].includes(value.toUpperCase()) : false;
    return { present: !!value, valid, value };
  }

  /**
   * @param {import('@playwright/test').Response} response
   */
  checkXContentType(response) {
    const value = response.headers()["x-content-type-options"] || null;
    return { present: !!value, valid: value === "nosniff", value };
  }

  /**
   * @param {import('@playwright/test').Response} response
   */
  checkReferrerPolicy(response) {
    const value = response.headers()["referrer-policy"] || null;
    const validPolicies = ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"];
    return { present: !!value, valid: value ? validPolicies.includes(value) : false, value };
  }

  /**
   * Generate a formatted security header audit report.
   * @param {{passed: boolean, findings: Array}} results
   * @returns {string}
   */
  generateReport(results) {
    const lines = [
      "Security Headers Report",
      `Overall: ${results.passed ? "PASS" : "FAIL"}`,
      "",
    ];
    for (const f of results.findings) {
      const icon = f.status === "PASS" ? "[PASS]" : f.status === "WARN" ? "[WARN]" : "[FAIL]";
      lines.push(`${icon} ${f.header}: ${f.detail}`);
    }
    return lines.join("\n");
  }
}

export default new HeaderValidator();
