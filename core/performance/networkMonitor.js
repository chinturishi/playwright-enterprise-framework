import fs from "fs-extra";
import logger from "../logging/logger.js";

class NetworkMonitor {
  constructor() {
    this.requests = [];
    this.monitoring = false;
    this._page = null;
    this._onRequest = null;
    this._onResponse = null;
  }

  /**
   * Start monitoring network requests on the given page.
   * @param {import('@playwright/test').Page} page
   */
  startMonitoring(page) {
    this.requests = [];
    this.monitoring = true;
    this._page = page;

    this._onRequest = (request) => {
      this.requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        headers: request.headers(),
        startTime: Date.now(),
        response: null,
      });
    };

    this._onResponse = (response) => {
      const entry = this.requests.find(r => r.url === response.url() && !r.response);
      if (entry) {
        entry.response = {
          status: response.status(),
          headers: response.headers(),
          endTime: Date.now(),
          duration: Date.now() - entry.startTime,
        };
        entry.transferSize = parseInt(response.headers()["content-length"] || "0", 10);
      }
    };

    page.on("request", this._onRequest);
    page.on("response", this._onResponse);
    logger.info("Network monitoring started");
  }

  /**
   * Stop monitoring and return collected network data.
   * @returns {Array} All captured request/response entries
   */
  stopMonitoring() {
    if (this._page && this._onRequest) {
      this._page.removeListener("request", this._onRequest);
      this._page.removeListener("response", this._onResponse);
    }
    this.monitoring = false;
    logger.info(`Network monitoring stopped. Captured ${this.requests.length} request(s)`);
    return this.requests;
  }

  /**
   * Get all captured requests.
   * @returns {Array}
   */
  getRequests() {
    return this.requests;
  }

  /**
   * Get requests that exceeded the given duration threshold.
   * @param {number} thresholdMs
   * @returns {Array}
   */
  getSlowRequests(thresholdMs) {
    return this.requests.filter(r => r.response && r.response.duration > thresholdMs);
  }

  /**
   * Get requests that received non-2xx responses.
   * @returns {Array}
   */
  getFailedRequests() {
    return this.requests.filter(r => r.response && (r.response.status < 200 || r.response.status >= 300));
  }

  /**
   * Filter requests by resource type.
   * @param {string} type - 'document' | 'xhr' | 'fetch' | 'image' | 'stylesheet' | 'script' | 'font'
   * @returns {Array}
   */
  getRequestsByType(type) {
    return this.requests.filter(r => r.resourceType === type);
  }

  /**
   * Calculate the total transfer size of all responses.
   * @returns {number} Total bytes transferred
   */
  getTotalTransferSize() {
    return this.requests.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  }

  /**
   * Generate a HAR-format file from captured requests.
   * @param {import('@playwright/test').Page} page
   * @param {string} outputPath
   * @returns {Promise<string>} The output file path
   */
  async generateHAR(page, outputPath) {
    const har = {
      log: {
        version: "1.2",
        creator: { name: "playwright-enterprise-framework", version: "1.0" },
        entries: this.requests.map(r => ({
          startedDateTime: new Date(r.startTime).toISOString(),
          time: r.response?.duration || 0,
          request: { method: r.method, url: r.url },
          response: {
            status: r.response?.status || 0,
            content: { size: r.transferSize || 0 },
          },
        })),
      },
    };

    await fs.ensureDir(outputPath.substring(0, outputPath.lastIndexOf("/")));
    await fs.writeJson(outputPath, har, { spaces: 2 });
    logger.info(`HAR file generated: ${outputPath}`);
    return outputPath;
  }
}

export default new NetworkMonitor();
