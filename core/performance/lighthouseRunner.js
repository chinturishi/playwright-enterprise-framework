import logger from "../logging/logger.js";

class LighthouseRunner {
  /**
   * Run a Lighthouse audit on the given URL.
   * NOTE: Requires 'lighthouse' package to be installed separately.
   * @param {string} url - URL to audit
   * @param {object} [options={}] - { port, categories, formFactor }
   * @returns {Promise<object>} Lighthouse results (or placeholder)
   */
  async run(url, options = {}) {
    logger.info(`Running Lighthouse audit for: ${url}`);

    try {
      const { default: lighthouse } = await import("lighthouse");
      const chromeLauncher = await import("chrome-launcher");

      const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
      const result = await lighthouse(url, {
        port: chrome.port,
        output: "json",
        onlyCategories: options.categories || ["performance", "accessibility", "best-practices", "seo"],
        formFactor: options.formFactor || "desktop",
        ...options,
      });
      await chrome.kill();

      logger.info(`Lighthouse audit completed for ${url}`);
      return result.lhr;
    } catch {
      logger.warn("Lighthouse package not available. Returning placeholder result.");
      return {
        categories: {
          performance: { score: null, title: "Performance" },
          accessibility: { score: null, title: "Accessibility" },
          "best-practices": { score: null, title: "Best Practices" },
          seo: { score: null, title: "SEO" },
        },
        audits: {},
        fetchTime: new Date().toISOString(),
        requestedUrl: url,
        _placeholder: true,
      };
    }
  }

  /**
   * Extract the score for a given category from Lighthouse results.
   * @param {object} results - Lighthouse LHR object
   * @param {string} category - 'performance' | 'accessibility' | 'best-practices' | 'seo'
   * @returns {number|null} Score from 0 to 1, or null if unavailable
   */
  getScore(results, category) {
    const cat = results?.categories?.[category];
    if (!cat) {
      logger.warn(`Category "${category}" not found in results`);
      return null;
    }
    return cat.score;
  }

  /**
   * Generate a formatted report from Lighthouse results.
   * @param {object} results - Lighthouse LHR object
   * @param {string} [format='json'] - 'json' or 'html'
   * @returns {string}
   */
  generateReport(results, format = "json") {
    if (format === "html") {
      // TODO: Use lighthouse's report generator when package is available
      const categories = results?.categories || {};
      const lines = ["<html><body><h1>Lighthouse Report</h1>"];
      for (const [key, cat] of Object.entries(categories)) {
        const score = cat.score !== null ? Math.round(cat.score * 100) : "N/A";
        lines.push(`<p><strong>${cat.title}:</strong> ${score}</p>`);
      }
      lines.push("</body></html>");
      return lines.join("\n");
    }

    return JSON.stringify(results, null, 2);
  }
}

export default new LighthouseRunner();
