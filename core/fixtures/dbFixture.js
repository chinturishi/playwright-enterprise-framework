import { test as baseTest, expect } from "./baseFixture.js";
import logger from "../logging/logger.js";
import configLoader from "../../config/global/configLoader.js";
import PostgresClient from "../db/postgresClient.js";
import MysqlClient from "../db/mysqlClient.js";
import MongoClient from "../db/mongoClient.js";
import QueryExecutor from "../db/queryExecutor.js";

const DB_FACTORIES = {
  postgres: () => new PostgresClient(),
  mysql: () => new MysqlClient(),
  mongo: () => new MongoClient(),
};

/**
 * @param {string} type
 * @returns {object} A new database client instance
 */
function createClient(type) {
  const factory = DB_FACTORIES[type];
  if (!factory) {
    throw new Error(`Unsupported DB type "${type}". Supported: ${Object.keys(DB_FACTORIES).join(", ")}`);
  }
  return factory();
}

/**
 * Extended test object providing auto-managed database connections.
 * The `dbClient` fixture connects before each test and disconnects after.
 * `queryExecutor` wraps the client with retry and batch capabilities.
 */
export const test = baseTest.extend({
  /** DB type override — set via `test.use({ dbType: 'mysql' })`. */
  dbType: ["postgres", { option: true }],

  /** Optional seed callback invoked after connection. */
  dbSeed: [null, { option: true }],

  /** Optional teardown callback invoked before disconnect. */
  dbTeardown: [null, { option: true }],

  /**
   * A connected database client. Type is determined by the `dbType` option.
   * Auto-connects using config values from `db.<dbType>` and disconnects
   * after the test completes.
   */
  dbClient: async ({ dbType, config, dbSeed, dbTeardown }, use) => {
    config.load();
    const dbConfig = config.get(`db.${dbType}`, {});
    const client = createClient(dbType);

    logger.info(`Connecting ${dbType} database`);
    if (dbType === "mongo") {
      await client.connect(dbConfig.connectionString || dbConfig.uri || "");
    } else {
      await client.connect(dbConfig);
    }

    if (typeof dbSeed === "function") {
      logger.info("Running DB seed function");
      await dbSeed(client);
    }

    await use(client);

    if (typeof dbTeardown === "function") {
      logger.info("Running DB teardown function");
      await dbTeardown(client);
    }

    await client.close();
    logger.info(`${dbType} database disconnected`);
  },

  /**
   * A QueryExecutor instance wrapping the current `dbClient`.
   * Provides `.execute()`, `.executeMany()`, and `.executeWithRetry()`.
   */
  queryExecutor: async ({ dbClient }, use) => {
    const executor = new QueryExecutor(dbClient);
    await use(executor);
  },
});

export { expect };
