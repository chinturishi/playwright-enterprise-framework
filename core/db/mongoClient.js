import logger from "../logging/logger.js";

/**
 * MongoDB client wrapper.
 * Install the driver before use: `npm install mongodb`
 */
class MongoClient {
  #client = null;
  #connected = false;

  /**
   * @param {string} connectionString - e.g. "mongodb://localhost:27017"
   */
  async connect(connectionString) {
    // TODO: const { MongoClient: Driver } = await import("mongodb");
    // TODO: this.#client = new Driver(connectionString);
    // TODO: await this.#client.connect();
    logger.info(`MongoDB connected → ${connectionString.replace(/\/\/.*@/, "//***@")}`);
    this.#connected = true;
  }

  /**
   * @param {string} dbName
   * @param {string} collectionName
   * @returns {object} Collection handle
   */
  getCollection(dbName, collectionName) {
    this.#ensureConnected();
    // TODO: return this.#client.db(dbName).collection(collectionName);
    throw new Error("mongodb driver not installed — run: npm install mongodb");
  }

  /** @param {object} collection @param {object} filter @param {object} [options] */
  async find(collection, filter, options = {}) {
    this.#ensureConnected();
    logger.debug(`Mongo find: ${JSON.stringify(filter).slice(0, 200)}`);
    // TODO: return collection.find(filter, options).toArray();
    throw new Error("mongodb driver not installed — run: npm install mongodb");
  }

  /** @param {object} collection @param {object} filter */
  async findOne(collection, filter) {
    this.#ensureConnected();
    logger.debug(`Mongo findOne: ${JSON.stringify(filter).slice(0, 200)}`);
    // TODO: return collection.findOne(filter);
    throw new Error("mongodb driver not installed — run: npm install mongodb");
  }

  /** @param {object} collection @param {object} document */
  async insertOne(collection, document) {
    this.#ensureConnected();
    logger.debug("Mongo insertOne");
    // TODO: return collection.insertOne(document);
    throw new Error("mongodb driver not installed — run: npm install mongodb");
  }

  /** @param {object} collection @param {Array<object>} documents */
  async insertMany(collection, documents) {
    this.#ensureConnected();
    logger.debug(`Mongo insertMany (${documents.length} docs)`);
    // TODO: return collection.insertMany(documents);
    throw new Error("mongodb driver not installed — run: npm install mongodb");
  }

  /** @param {object} collection @param {object} filter @param {object} update */
  async updateOne(collection, filter, update) {
    this.#ensureConnected();
    logger.debug(`Mongo updateOne: ${JSON.stringify(filter).slice(0, 200)}`);
    // TODO: return collection.updateOne(filter, update);
    throw new Error("mongodb driver not installed — run: npm install mongodb");
  }

  /** @param {object} collection @param {object} filter */
  async deleteOne(collection, filter) {
    this.#ensureConnected();
    logger.debug(`Mongo deleteOne: ${JSON.stringify(filter).slice(0, 200)}`);
    // TODO: return collection.deleteOne(filter);
    throw new Error("mongodb driver not installed — run: npm install mongodb");
  }

  async close() {
    if (this.#client) {
      // TODO: await this.#client.close();
      logger.info("MongoDB connection closed");
    }
    this.#client = null;
    this.#connected = false;
  }

  #ensureConnected() {
    if (!this.#connected) throw new Error("MongoDB not connected — call connect() first");
  }
}

export default MongoClient;
