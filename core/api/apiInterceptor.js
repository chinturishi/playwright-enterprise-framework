import { request } from "@playwright/test";
import logger from "../logging/logger.js";
import { DEFAULT_API_TIMEOUT_MS, CONTENT_TYPES } from "../../config/constants/apiConstants.js";

class ApiInterceptor {
  #baseURL = "";
  #defaultHeaders = { "Content-Type": CONTENT_TYPES.JSON };
  #context = null;

  /**
   * @param {string} baseURL
   * @param {object} [options] - Extra options forwarded to Playwright's APIRequestContext
   * @returns {Promise<import('@playwright/test').APIRequestContext>}
   */
  async createClient(baseURL, options = {}) {
    this.#baseURL = baseURL;
    this.#context = await request.newContext({
      baseURL,
      extraHTTPHeaders: { ...this.#defaultHeaders, ...options.headers },
      timeout: options.timeout ?? DEFAULT_API_TIMEOUT_MS,
      ...options,
    });
    logger.info(`API client created for ${baseURL}`);
    return this.#context;
  }

  /** @param {string} url @param {object} [options] */
  async get(url, options = {}) {
    return this.#send("GET", url, undefined, options);
  }

  /** @param {string} url @param {*} data @param {object} [options] */
  async post(url, data, options = {}) {
    return this.#send("POST", url, data, options);
  }

  /** @param {string} url @param {*} data @param {object} [options] */
  async put(url, data, options = {}) {
    return this.#send("PUT", url, data, options);
  }

  /** @param {string} url @param {*} data @param {object} [options] */
  async patch(url, data, options = {}) {
    return this.#send("PATCH", url, data, options);
  }

  /** @param {string} url @param {object} [options] */
  async delete(url, options = {}) {
    return this.#send("DELETE", url, undefined, options);
  }

  /** @param {object} headers - Merged with existing default headers */
  setDefaultHeaders(headers) {
    this.#defaultHeaders = { ...this.#defaultHeaders, ...headers };
  }

  /** @param {string} url */
  setBaseURL(url) {
    this.#baseURL = url;
  }

  /**
   * Intercept network requests matching a URL pattern.
   * @param {import('@playwright/test').Page} page
   * @param {string|RegExp} urlPattern
   * @param {function} handler - Receives the Route object
   */
  async interceptRoute(page, urlPattern, handler) {
    await page.route(urlPattern, handler);
    logger.info(`Route intercepted: ${urlPattern}`);
  }

  /**
   * Mock an API response for matching requests.
   * @param {import('@playwright/test').Page} page
   * @param {string|RegExp} urlPattern
   * @param {{status?: number, body?: *, contentType?: string, headers?: object}} response
   */
  async mockResponse(page, urlPattern, response) {
    await page.route(urlPattern, (route) =>
      route.fulfill({
        status: response.status ?? 200,
        contentType: response.contentType ?? CONTENT_TYPES.JSON,
        headers: response.headers,
        body: typeof response.body === "string" ? response.body : JSON.stringify(response.body),
      })
    );
    logger.info(`Mocked response for ${urlPattern} → status ${response.status ?? 200}`);
  }

  /**
   * Record all requests matching a pattern for later assertion.
   * @param {import('@playwright/test').Page} page
   * @param {string|RegExp} urlPattern
   * @returns {Array<{url: string, method: string, postData: string|null, headers: object}>}
   */
  recordRequests(page, urlPattern) {
    const recorded = [];
    page.on("request", (req) => {
      const url = req.url();
      if (typeof urlPattern === "string" ? url.includes(urlPattern) : urlPattern.test(url)) {
        recorded.push({
          url,
          method: req.method(),
          postData: req.postData(),
          headers: req.headers(),
        });
      }
    });
    logger.info(`Recording requests matching ${urlPattern}`);
    return recorded;
  }

  async #send(method, url, data, options) {
    this.#ensureClient();
    const fullUrl = url.startsWith("http") ? url : url;
    logger.info(`→ ${method} ${fullUrl}`);
    if (data !== undefined) logger.debug(`  body: ${JSON.stringify(data).slice(0, 500)}`);

    const start = Date.now();
    const fetchOptions = { headers: { ...this.#defaultHeaders, ...options.headers }, ...options };
    if (data !== undefined) fetchOptions.data = data;

    const response = await this.#context[method.toLowerCase()](fullUrl, fetchOptions);
    const responseTime = Date.now() - start;
    const status = response.status();

    let body;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }

    logger.info(`← ${status} ${method} ${fullUrl} (${responseTime}ms)`);
    return { status, body, headers: response.headers(), responseTime };
  }

  #ensureClient() {
    if (!this.#context) throw new Error("API client not initialized — call createClient() first");
  }
}

export default new ApiInterceptor();
