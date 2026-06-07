import logger from "../../core/logging/logger.js";

class NetworkAnalyzer {
  constructor() {
    this._requests = [];
    this._responses = [];
  }

  /**
   * Start capturing network traffic on a Playwright page.
   * @param {object} page - Playwright page object
   */
  capture(page) {
    this._requests = [];
    this._responses = [];
    page.on("request", (req) => {
      this._requests.push({
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType(),
        timestamp: Date.now(),
      });
    });
    page.on("response", (res) => {
      this._responses.push({
        url: res.url(),
        status: res.status(),
        timing: Date.now(),
      });
    });
    logger.debug("[NetworkAnalyzer] Capture started");
  }

  /** @returns {Array} Requests that returned 4xx or 5xx */
  getFailedRequests() {
    return this._responses.filter((r) => r.status >= 400);
  }

  /**
   * Get requests slower than threshold.
   * @param {number} [threshold=3000] - Milliseconds
   */
  getSlowRequests(threshold = 3000) {
    const responseMap = new Map(this._responses.map((r) => [r.url, r.timing]));
    return this._requests
      .filter((req) => {
        const respTime = responseMap.get(req.url);
        return respTime && respTime - req.timestamp > threshold;
      })
      .map((req) => ({
        ...req,
        duration: responseMap.get(req.url) - req.timestamp,
      }));
  }

  /**
   * Find network issues related to a test failure.
   * @param {Array} requests @param {string} testError
   */
  findRelevant(requests, testError) {
    const reqs = requests || this._responses;
    const failed = reqs.filter((r) => r.status >= 400);
    if (!testError) return failed;
    const keywords = testError.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    return failed.filter((r) => keywords.some((kw) => r.url.toLowerCase().includes(kw)));
  }

  /**
   * Overall network health assessment.
   * @param {Array} [requests]
   */
  analyze(requests) {
    const reqs = requests || this._requests;
    const resps = this._responses;
    const failed = resps.filter((r) => r.status >= 400);
    return {
      totalRequests: reqs.length,
      totalResponses: resps.length,
      failedCount: failed.length,
      failureRate: resps.length ? Math.round((failed.length / resps.length) * 100 * 100) / 100 : 0,
      statusBreakdown: this._groupByStatus(resps),
      healthy: failed.length === 0,
    };
  }

  _groupByStatus(responses) {
    const groups = {};
    for (const r of responses) {
      const bucket = `${Math.floor(r.status / 100)}xx`;
      groups[bucket] = (groups[bucket] || 0) + 1;
    }
    return groups;
  }
}

export default new NetworkAnalyzer();
