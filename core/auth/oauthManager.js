import { randomUUID } from "crypto";
import logger from "../logging/logger.js";

class OAuthManager {
  /**
   * Build an OAuth 2.0 authorization URL.
   * @param {{
   *   authorizeUrl: string,
   *   clientId: string,
   *   redirectUri: string,
   *   scope?: string,
   *   state?: string,
   *   extras?: Record<string, string>
   * }} config
   * @returns {string}
   */
  getAuthorizationUrl(config) {
    const url = new URL(config.authorizeUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set("redirect_uri", config.redirectUri);
    if (config.scope) url.searchParams.set("scope", config.scope);
    url.searchParams.set("state", config.state ?? randomUUID());
    if (config.extras) {
      for (const [k, v] of Object.entries(config.extras)) url.searchParams.set(k, v);
    }
    logger.info(`Authorization URL built → ${url.origin}${url.pathname}`);
    return url.toString();
  }

  /**
   * Exchange an authorization code for tokens.
   * @param {object} apiClient
   * @param {string} tokenEndpoint
   * @param {string} code
   * @param {{ clientId: string, clientSecret: string, redirectUri: string }} config
   * @returns {Promise<{status: number, body: *}>}
   */
  async exchangeCode(apiClient, tokenEndpoint, code, config) {
    logger.info("Exchanging authorization code for tokens");
    return apiClient.post(tokenEndpoint, {
      grant_type: "authorization_code",
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    });
  }

  /**
   * Refresh an access token using a refresh token.
   * @param {object} apiClient
   * @param {string} tokenEndpoint
   * @param {string} refreshToken
   * @param {{ clientId: string, clientSecret: string }} config
   * @returns {Promise<{status: number, body: *}>}
   */
  async refreshAccessToken(apiClient, tokenEndpoint, refreshToken, config) {
    logger.info("Refreshing access token");
    return apiClient.post(tokenEndpoint, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });
  }

  /**
   * Obtain a token via the client credentials grant (server-to-server).
   * @param {object} apiClient
   * @param {string} tokenEndpoint
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {string} [scope]
   * @returns {Promise<{status: number, body: *}>}
   */
  async getClientCredentialsToken(apiClient, tokenEndpoint, clientId, clientSecret, scope) {
    logger.info("Requesting client credentials token");
    const data = { grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret };
    if (scope) data.scope = scope;
    return apiClient.post(tokenEndpoint, data);
  }
}

export default new OAuthManager();
