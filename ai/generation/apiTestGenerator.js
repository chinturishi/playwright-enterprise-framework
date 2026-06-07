import logger from "../../core/logging/logger.js";
import fs from "fs";

class ApiTestGenerator {
  /**
   * Generate an API test from endpoint info.
   * @param {string} endpoint @param {string} method @param {{ baseUrl?: string, body?: object, headers?: object }} [options]
   */
  async generate(endpoint, method = "GET", options = {}) {
    logger.info(`[ApiTestGenerator] Generating ${method} ${endpoint}`);
    const tests = [{ endpoint, method, expectedStatus: method === "POST" ? 201 : 200, body: options.body || null }];
    return { endpoint, method, code: this.formatAsPlaywright(tests, options), generatedAt: new Date().toISOString() };
  }

  /**
   * Parse an OpenAPI spec and generate tests for all endpoints.
   * @param {string} specPath - Path to OpenAPI JSON/YAML file
   */
  async generateFromOpenAPI(specPath) {
    if (!fs.existsSync(specPath)) {
      return { error: `Spec file not found: ${specPath}`, tests: [] };
    }
    const content = fs.readFileSync(specPath, "utf-8");
    let spec;
    try { spec = JSON.parse(content); } catch { return { error: "Failed to parse spec as JSON", tests: [] }; }

    const tests = [];
    const paths = spec.paths || {};
    for (const [path, methods] of Object.entries(paths)) {
      for (const method of Object.keys(methods)) {
        if (["get", "post", "put", "patch", "delete"].includes(method)) {
          tests.push({ endpoint: path, method: method.toUpperCase(), expectedStatus: method === "post" ? 201 : 200 });
        }
      }
    }
    logger.info(`[ApiTestGenerator] Generated ${tests.length} tests from OpenAPI spec`);
    return { specPath, tests, code: this.formatAsPlaywright(tests) };
  }

  /**
   * Convert API test definitions to Playwright API testing code.
   * @param {Array<{ endpoint: string, method: string, expectedStatus: number, body?: object }>} tests
   * @param {{ baseUrl?: string }} [options]
   */
  formatAsPlaywright(tests, options = {}) {
    const base = options.baseUrl || "process.env.BASE_URL";
    const lines = [`import { test, expect } from '@playwright/test';`, ""];
    lines.push(`test.describe('API Tests', () => {`);
    for (const t of tests) {
      lines.push(`  test('${t.method} ${t.endpoint}', async ({ request }) => {`);
      if (t.method === "GET") {
        lines.push(`    const response = await request.get(\`\${${base}}${t.endpoint}\`);`);
      } else {
        const body = t.body ? JSON.stringify(t.body) : "{}";
        lines.push(`    const response = await request.${t.method.toLowerCase()}(\`\${${base}}${t.endpoint}\`, { data: ${body} });`);
      }
      lines.push(`    expect(response.status()).toBe(${t.expectedStatus});`);
      lines.push("  });", "");
    }
    lines.push("});", "");
    return lines.join("\n");
  }
}

export default new ApiTestGenerator();
