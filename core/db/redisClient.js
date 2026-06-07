import logger from "../logging/logger.js";

/**
 * Redis client wrapper.
 * Install the driver before use: `npm install redis`
 */
class RedisClient {
  #client = null;
  #connected = false;

  /**
   * @param {{ host?: string, port?: number, password?: string }} [config]
   */
  async connect(config = {}) {
    const { host = "127.0.0.1", port = 6379 } = config;
    // TODO: const redis = await import("redis");
    // TODO: this.#client = redis.createClient({ url: `redis://${host}:${port}`, password: config.password });
    // TODO: await this.#client.connect();
    logger.info(`Redis connected → ${host}:${port}`);
    this.#connected = true;
  }

  /** @param {string} key @returns {Promise<string|null>} */
  async get(key) {
    this.#ensureConnected();
    logger.debug(`Redis GET ${key}`);
    // TODO: return this.#client.get(key);
    throw new Error("redis driver not installed — run: npm install redis");
  }

  /** @param {string} key @param {string} value @param {number} [ttl] - TTL in seconds */
  async set(key, value, ttl) {
    this.#ensureConnected();
    logger.debug(`Redis SET ${key}${ttl ? ` TTL=${ttl}s` : ""}`);
    // TODO: if (ttl) return this.#client.set(key, value, { EX: ttl });
    // TODO: return this.#client.set(key, value);
    throw new Error("redis driver not installed — run: npm install redis");
  }

  /** @param {string} key */
  async delete(key) {
    this.#ensureConnected();
    logger.debug(`Redis DEL ${key}`);
    // TODO: return this.#client.del(key);
    throw new Error("redis driver not installed — run: npm install redis");
  }

  /** @param {string} key @returns {Promise<boolean>} */
  async exists(key) {
    this.#ensureConnected();
    // TODO: return (await this.#client.exists(key)) === 1;
    throw new Error("redis driver not installed — run: npm install redis");
  }

  async flushAll() {
    this.#ensureConnected();
    logger.warn("Redis FLUSHALL");
    // TODO: return this.#client.flushAll();
    throw new Error("redis driver not installed — run: npm install redis");
  }

  async close() {
    if (this.#client) {
      // TODO: await this.#client.quit();
      logger.info("Redis connection closed");
    }
    this.#client = null;
    this.#connected = false;
  }

  #ensureConnected() {
    if (!this.#connected) throw new Error("Redis not connected — call connect() first");
  }
}

export default RedisClient;
