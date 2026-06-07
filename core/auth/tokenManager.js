import logger from "../logging/logger.js";

class TokenManager {
  #token = null;
  #expiresAt = 0;
  #refreshToken = null;
  #listeners = [];

  /**
   * Store an access token with an optional expiry.
   * @param {string} token
   * @param {number} [expiresInMs=3600000] - Lifetime in milliseconds (default 1 hour)
   */
  setToken(token, expiresInMs = 3_600_000) {
    this.#token = token;
    this.#expiresAt = Date.now() + expiresInMs;
    logger.info(`Token set (expires in ${expiresInMs}ms)`);
  }

  /**
   * Return the current token if it has not expired, otherwise null.
   * @returns {string|null}
   */
  getToken() {
    if (this.isExpired()) {
      logger.warn("Token requested but expired");
      return null;
    }
    return this.#token;
  }

  /** @returns {boolean} */
  isExpired() {
    return !this.#token || Date.now() >= this.#expiresAt;
  }

  /**
   * Call the supplied async function to obtain a new token, then store it.
   * @param {function(): Promise<{token: string, expiresInMs?: number}>} refreshFn
   */
  async refresh(refreshFn) {
    logger.info("Refreshing token…");
    const { token, expiresInMs } = await refreshFn();
    this.setToken(token, expiresInMs);
    this.#listeners.forEach((cb) => cb(token));
    logger.info("Token refreshed");
  }

  /** @param {string} refreshToken */
  setRefreshToken(refreshToken) {
    this.#refreshToken = refreshToken;
  }

  /** @returns {string|null} */
  getRefreshToken() {
    return this.#refreshToken;
  }

  clearTokens() {
    this.#token = null;
    this.#expiresAt = 0;
    this.#refreshToken = null;
    logger.info("All tokens cleared");
  }

  /**
   * Register a callback invoked whenever the token is refreshed.
   * @param {function(string): void} callback
   */
  onTokenRefreshed(callback) {
    this.#listeners.push(callback);
  }
}

export default new TokenManager();
