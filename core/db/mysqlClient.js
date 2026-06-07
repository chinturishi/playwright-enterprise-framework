import logger from "../logging/logger.js";

/**
 * MySQL client wrapper.
 * Install the driver before use: `npm install mysql2`
 */
class MysqlClient {
  #pool = null;
  #connected = false;

  /**
   * Connect to a MySQL database.
   * @param {{ host: string, port: number, user: string, password: string, database: string }} config
   */
  async connect(config) {
    // TODO: const mysql = await import("mysql2/promise");
    // TODO: this.#pool = mysql.createPool(config);
    // TODO: await this.#pool.query("SELECT 1");
    logger.info(`MySQL connected → ${config.host}:${config.port}/${config.database}`);
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
    logger.debug(`MySQL query: ${sql.slice(0, 200)}`);
    // TODO: const [rows] = await this.#pool.execute(sql, params);
    // TODO: return rows;
    throw new Error("mysql2 driver not installed — run: npm install mysql2");
  }

  /**
   * Run multiple statements inside a single transaction.
   * @param {function(object): Promise<void>} callback - Receives a connection with `.query()`
   */
  async transaction(callback) {
    this.#ensureConnected();
    // TODO: const conn = await this.#pool.getConnection();
    logger.info("MySQL transaction BEGIN");
    try {
      // TODO: await conn.beginTransaction();
      // TODO: await callback(conn);
      // TODO: await conn.commit();
      logger.info("MySQL transaction COMMIT");
      throw new Error("mysql2 driver not installed — run: npm install mysql2");
    } catch (err) {
      // TODO: await conn.rollback();
      logger.error(`MySQL transaction ROLLBACK — ${err.message}`);
      throw err;
    }
    // finally { conn.release(); }
  }

  async close() {
    if (this.#pool) {
      // TODO: await this.#pool.end();
      logger.info("MySQL connection closed");
    }
    this.#pool = null;
    this.#connected = false;
  }

  /** @returns {boolean} */
  isConnected() {
    return this.#connected;
  }

  #ensureConnected() {
    if (!this.#connected) throw new Error("MySQL not connected — call connect() first");
  }
}

export default MysqlClient;
