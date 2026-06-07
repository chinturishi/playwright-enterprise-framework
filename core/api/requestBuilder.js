import logger from "../logging/logger.js";
import { CONTENT_TYPES } from "../../config/constants/apiConstants.js";

class RequestBuilder {
  #method = "GET";
  #url = "";
  #headers = {};
  #body = null;
  #params = {};
  #timeout = undefined;

  /**
   * Create a new RequestBuilder starting from a URL.
   * @param {string} url
   * @returns {RequestBuilder}
   */
  static create(url) {
    const builder = new RequestBuilder();
    builder.#url = url;
    return builder;
  }

  /**
   * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method
   * @returns {RequestBuilder}
   */
  setMethod(method) {
    this.#method = method.toUpperCase();
    return this;
  }

  /**
   * @param {string} url
   * @returns {RequestBuilder}
   */
  setUrl(url) {
    this.#url = url;
    return this;
  }

  /**
   * @param {string} name
   * @param {string} value
   * @returns {RequestBuilder}
   */
  setHeader(name, value) {
    this.#headers[name] = value;
    return this;
  }

  /**
   * Merge multiple headers at once.
   * @param {Record<string, string>} headers
   * @returns {RequestBuilder}
   */
  setHeaders(headers) {
    Object.assign(this.#headers, headers);
    return this;
  }

  /**
   * Set a Bearer token in the Authorization header.
   * @param {string} token
   * @returns {RequestBuilder}
   */
  setBearerToken(token) {
    this.#headers["Authorization"] = `Bearer ${token}`;
    return this;
  }

  /**
   * @param {object | string} body
   * @returns {RequestBuilder}
   */
  setBody(body) {
    this.#body = body;
    if (typeof body === "object" && !this.#headers["Content-Type"]) {
      this.#headers["Content-Type"] = CONTENT_TYPES?.JSON || "application/json";
    }
    return this;
  }

  /**
   * Set a single query parameter.
   * @param {string} name
   * @param {string | number | boolean} value
   * @returns {RequestBuilder}
   */
  setParam(name, value) {
    this.#params[name] = String(value);
    return this;
  }

  /**
   * Merge multiple query parameters.
   * @param {Record<string, string | number | boolean>} params
   * @returns {RequestBuilder}
   */
  setParams(params) {
    for (const [k, v] of Object.entries(params)) {
      this.#params[k] = String(v);
    }
    return this;
  }

  /**
   * @param {number} ms
   * @returns {RequestBuilder}
   */
  setTimeout(ms) {
    this.#timeout = ms;
    return this;
  }

  /**
   * Build the final request configuration object compatible with Playwright's
   * APIRequestContext or the framework's apiInterceptor.
   * @returns {{ method: string, url: string, headers: object, data?: *, params?: object, timeout?: number }}
   */
  build() {
    const query = Object.keys(this.#params).length
      ? "?" + new URLSearchParams(this.#params).toString()
      : "";

    const config = {
      method: this.#method,
      url: `${this.#url}${query}`,
      headers: { ...this.#headers },
    };

    if (this.#body !== null && this.#body !== undefined) {
      config.data = this.#body;
    }
    if (this.#timeout !== undefined) {
      config.timeout = this.#timeout;
    }

    logger.debug(`Request built: ${config.method} ${config.url}`);
    return config;
  }
}

export default RequestBuilder;
