import logger from "../logging/logger.js";
import { HTTP_STATUS } from "../../config/constants/apiConstants.js";

class AuthHandler {
  #headers = {};
  #refreshFn = null;

  /** @param {string} token - Bearer token value */
  setBearerToken(token) {
    this.#headers.Authorization = `Bearer ${token}`;
    logger.info("Bearer token set");
  }

  /** @param {string} username @param {string} password */
  setBasicAuth(username, password) {
    const encoded = Buffer.from(`${username}:${password}`).toString("base64");
    this.#headers.Authorization = `Basic ${encoded}`;
    logger.info("Basic auth set");
  }

  /** @param {string} key @param {string} [headerName='x-api-key'] */
  setApiKey(key, headerName = "x-api-key") {
    this.#headers[headerName] = key;
    logger.info(`API key set on header ${headerName}`);
  }

  /** @param {Array<{name: string, value: string}>} cookies */
  setCookieAuth(cookies) {
    this.#headers.Cookie = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    logger.info("Cookie auth set");
  }

  /** @returns {object} Current auth headers */
  getAuthHeaders() {
    return { ...this.#headers };
  }

  /**
   * Register an async function to call when a 401 is received.
   * @param {function(): Promise<string>} refreshFn - Should return a new token
   */
  refreshToken(refreshFn) {
    this.#refreshFn = refreshFn;
    logger.info("Token refresh function registered");
  }

  clearAuth() {
    this.#headers = {};
    this.#refreshFn = null;
    logger.info("Auth cleared");
  }

  /**
   * Wrap an async request function to auto-attach auth headers and retry once on 401.
   * @param {function(object): Promise<{status: number, body: *, headers: object, responseTime: number}>} requestFn
   *   Receives merged options including auth headers.
   * @param {object} [options={}] - Extra request options
   * @returns {Promise<{status: number, body: *, headers: object, responseTime: number}>}
   */
  async wrapRequest(requestFn, options = {}) {
    const merged = { ...options, headers: { ...this.#headers, ...options.headers } };
    let result = await requestFn(merged);

    if (result.status === HTTP_STATUS.UNAUTHORIZED && this.#refreshFn) {
      logger.warn("Received 401 — attempting token refresh");
      const newToken = await this.#refreshFn();
      this.setBearerToken(newToken);
      const retryOpts = { ...options, headers: { ...this.#headers, ...options.headers } };
      result = await requestFn(retryOpts);
      logger.info(`Retry after refresh → ${result.status}`);
    }
    return result;
  }
}

export default new AuthHandler();
