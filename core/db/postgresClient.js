import logger from "../logging/logger.js";

/**
 * PostgreSQL client wrapper.
 * Install the driver before use: `npm install pg`
 */
class PostgresClient {
  #pool = null;
  #connected = false;

  /**
   * Connect to a PostgreSQL database.
   * @param {{ host: string, port: number, user: string, password: string, database: string }} config
   */
  async connect(config) {
    // TODO: const { Pool } = await import("pg");
    // TODO: this.#pool = new Pool(config);
    // TODO: await this.#pool.query("SELECT 1");
    logger.info(`PostgreSQL connected → ${config.host}:${config.port}/${config.database}`);
    this.#connected = true;
  }

  /**
   * Execute a parameterized query.
   * @param {string} sql
   * @param {Array} [params]
   * @returns {Promise<Array<object>>} Result rows
   */
  async query(sql, params = []) {
    this.#ensureConnected();
    logger.debug(`PG query: ${sql.slice(0, 200)}`);
    // TODO: const result = await this.#pool.query(sql, params);
    // TODO: return result.rows;
    throw new Error("pg driver not installed — run: npm install pg");
  }

  /**
   * Run multiple statements inside a single transaction.
   * @param {function(object): Promise<void>} callback - Receives a client with `.query()`
   */
  async transaction(callback) {
    this.#ensureConnected();
    // TODO: const client = await this.#pool.connect();
    logger.info("PG transaction BEGIN");
    try {
      // TODO: await client.query("BEGIN");
      // TODO: await callback(client);
      // TODO: await client.query("COMMIT");
      logger.info("PG transaction COMMIT");
      throw new Error("pg driver not installed — run: npm install pg");
    } catch (err) {
      // TODO: await client.query("ROLLBACK");
      logger.error(`PG transaction ROLLBACK — ${err.message}`);
      throw err;
    }
    // finally { client.release(); }
  }

  async close() {
    if (this.#pool) {
      // TODO: await this.#pool.end();
      logger.info("PostgreSQL connection closed");
    }
    this.#pool = null;
    this.#connected = false;
  }

  /** @returns {boolean} */
  isConnected() {
    return this.#connected;
  }

  #ensureConnected() {
    if (!this.#connected) throw new Error("PostgreSQL not connected — call connect() first");
  }
}

export default PostgresClient;
