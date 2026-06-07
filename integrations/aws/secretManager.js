import logger from "../../core/logging/logger.js";

class SecretManager {
  #region = "";
  #cache = new Map();

  /** @param {string} region - AWS region */
  configure(region) {
    this.#region = region;
    logger.info(`Secret manager configured: region=${region}`);
  }

  /**
   * Placeholder: replace with AWS SDK SecretsManager.GetSecretValue
   * @param {string} secretName
   * @returns {Promise<string>} Secret string value
   */
  async getSecret(secretName) {
    const cached = this.#cache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      logger.debug(`Secret cache hit: ${secretName}`);
      return cached.value;
    }

    logger.info(`Fetching secret: ${secretName} (region=${this.#region})`);

    // Placeholder: actual AWS SDK call
    // const client = new SecretsManagerClient({ region: this.#region });
    // const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: secretName }));
    // return SecretString;

    logger.warn("AWS SDK not installed — getSecret is a no-op placeholder");
    return "";
  }

  /**
   * @param {string} secretName
   * @param {string} key - JSON key within the secret
   * @returns {Promise<string>}
   */
  async getSecretValue(secretName, key) {
    const raw = await this.getSecret(secretName);
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw);
      return parsed[key] ?? "";
    } catch {
      logger.error(`Secret ${secretName} is not valid JSON`);
      return "";
    }
  }

  /**
   * @param {string} secretName
   * @param {number} [ttlMs=300000] - Cache TTL in milliseconds (default 5 min)
   * @returns {Promise<string>}
   */
  async cacheSecret(secretName, ttlMs = 300_000) {
    const value = await this.getSecret(secretName);
    this.#cache.set(secretName, { value, expiresAt: Date.now() + ttlMs });
    logger.info(`Cached secret ${secretName} for ${ttlMs}ms`);
    return value;
  }
}

export default new SecretManager();
