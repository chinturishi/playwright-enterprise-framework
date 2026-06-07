import logger from "../logging/logger.js";

class ApiPerformance {
  /**
   * Execute an API call and measure the response time.
   * @param {object} apiClient - Client with request methods (get, post, etc.)
   * @param {string} method - HTTP method (get, post, put, delete)
   * @param {string} url - Request URL
   * @param {object} [options={}] - Request options (data, headers, params)
   * @returns {Promise<{responseTime: number, status: number, size: number}>}
   */
  async measure(apiClient, method, url, options = {}) {
    const start = performance.now();
    const response = await apiClient[method.toLowerCase()](url, options);
    const responseTime = performance.now() - start;

    const size = JSON.stringify(response.data || response.body || "").length;
    logger.debug(`API ${method.toUpperCase()} ${url}: ${responseTime.toFixed(2)}ms (status: ${response.status})`);

    return { responseTime, status: response.status, size };
  }

  /**
   * Run multiple iterations of an API call and compute statistics.
   * @param {object} apiClient
   * @param {string} method
   * @param {string} url
   * @param {number} iterations - Number of times to execute
   * @param {object} [options={}]
   * @returns {Promise<{min: number, max: number, avg: number, p95: number, p99: number, iterations: number, times: number[]}>}
   */
  async benchmark(apiClient, method, url, iterations, options = {}) {
    logger.info(`Benchmarking ${method.toUpperCase()} ${url} (${iterations} iterations)`);
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const { responseTime } = await this.measure(apiClient, method, url, options);
      times.push(responseTime);
    }

    times.sort((a, b) => a - b);
    const min = times[0];
    const max = times[times.length - 1];
    const avg = times.reduce((s, t) => s + t, 0) / times.length;
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];

    logger.info(`Benchmark results - min: ${min.toFixed(2)}ms, max: ${max.toFixed(2)}ms, avg: ${avg.toFixed(2)}ms, p95: ${p95.toFixed(2)}ms`);
    return { min, max, avg, p95, p99, iterations, times };
  }

  /**
   * Assert that a response time is within the acceptable threshold.
   * @param {number} actual - Actual response time in ms
   * @param {number} maxMs - Maximum acceptable response time
   * @returns {{passed: boolean, actual: number, threshold: number, margin: number}}
   */
  assertResponseTime(actual, maxMs) {
    const passed = actual <= maxMs;
    const margin = maxMs - actual;
    if (!passed) {
      logger.warn(`Response time assertion FAILED: ${actual.toFixed(2)}ms > ${maxMs}ms`);
    }
    return { passed, actual, threshold: maxMs, margin };
  }

  /**
   * Generate a formatted performance report from benchmark results.
   * @param {{min: number, max: number, avg: number, p95: number, p99: number, iterations: number}} benchmarkResults
   * @returns {string}
   */
  generateReport(benchmarkResults) {
    const { min, max, avg, p95, p99, iterations } = benchmarkResults;
    return [
      "API Performance Report",
      `Iterations: ${iterations}`,
      `Min: ${min.toFixed(2)}ms`,
      `Max: ${max.toFixed(2)}ms`,
      `Average: ${avg.toFixed(2)}ms`,
      `P95: ${p95.toFixed(2)}ms`,
      `P99: ${p99.toFixed(2)}ms`,
      `Range: ${(max - min).toFixed(2)}ms`,
    ].join("\n");
  }
}

export default new ApiPerformance();
