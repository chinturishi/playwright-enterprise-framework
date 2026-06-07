import logger from "../logging/logger.js";

class PageMetrics {
  /**
   * Collect Core Web Vitals (LCP, FID, CLS, FCP, TTFB) from the page.
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<{lcp: number|null, fid: number|null, cls: number|null, fcp: number|null, ttfb: number|null}>}
   */
  async collectWebVitals(page) {
    const vitals = await page.evaluate(() => {
      const result = { lcp: null, fid: null, cls: null, fcp: null, ttfb: null };
      const entries = performance.getEntriesByType("paint");
      const fcp = entries.find(e => e.name === "first-contentful-paint");
      if (fcp) result.fcp = fcp.startTime;

      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        result.ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
      }

      const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
      if (lcpEntries.length > 0) {
        result.lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }

      const layoutShifts = performance.getEntriesByType("layout-shift");
      if (layoutShifts.length > 0) {
        result.cls = layoutShifts
          .filter(e => !e.hadRecentInput)
          .reduce((sum, e) => sum + e.value, 0);
      }

      return result;
    });

    logger.info(`Web Vitals - LCP: ${vitals.lcp}ms, FCP: ${vitals.fcp}ms, CLS: ${vitals.cls}, TTFB: ${vitals.ttfb}ms`);
    return vitals;
  }

  /**
   * Collect Navigation Timing API data.
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<object>}
   */
  async getNavigationTiming(page) {
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      if (!nav) return null;
      return {
        dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
        tcpConnection: nav.connectEnd - nav.connectStart,
        tlsNegotiation: nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0,
        serverResponse: nav.responseStart - nav.requestStart,
        contentDownload: nav.responseEnd - nav.responseStart,
        domParsing: nav.domInteractive - nav.responseEnd,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        pageLoad: nav.loadEventEnd - nav.loadEventStart,
        totalDuration: nav.duration,
      };
    });

    logger.debug("Navigation timing collected");
    return timing;
  }

  /**
   * Collect resource loading timing data.
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<Array<{name: string, type: string, duration: number, size: number}>>}
   */
  async getResourceTiming(page) {
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType("resource").map(r => ({
        name: r.name,
        type: r.initiatorType,
        duration: r.duration,
        size: r.transferSize || 0,
        startTime: r.startTime,
      }));
    });

    logger.debug(`Collected timing for ${resources.length} resources`);
    return resources;
  }

  /**
   * Navigate to a URL and measure the full page load metrics.
   * @param {import('@playwright/test').Page} page
   * @param {string} url
   * @returns {Promise<{vitals: object, navigation: object, resourceCount: number, totalLoadTime: number}>}
   */
  async measurePageLoad(page, url) {
    const startTime = Date.now();
    await page.goto(url, { waitUntil: "load" });
    const totalLoadTime = Date.now() - startTime;

    const vitals = await this.collectWebVitals(page);
    const navigation = await this.getNavigationTiming(page);
    const resources = await this.getResourceTiming(page);

    logger.info(`Page load for ${url}: ${totalLoadTime}ms, ${resources.length} resources`);
    return { vitals, navigation, resourceCount: resources.length, totalLoadTime };
  }

  /**
   * Get JavaScript heap memory usage (Chromium only).
   * @param {import('@playwright/test').Page} page
   * @returns {Promise<{usedJSHeapSize: number, totalJSHeapSize: number, jsHeapSizeLimit: number}|null>}
   */
  async getMemoryUsage(page) {
    const memory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (memory) {
      logger.debug(`Memory: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB used of ${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`);
    } else {
      logger.debug("Memory API not available (non-Chromium browser)");
    }
    return memory;
  }
}

export default new PageMetrics();
