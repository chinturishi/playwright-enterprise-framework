import Ajv from "ajv";
import logger from "../logging/logger.js";

class SchemaValidator {
  #ajv;
  #schemas = new Map();

  constructor() {
    this.#ajv = new Ajv({ allErrors: true, verbose: true });
  }

  /**
   * Validate data against an inline JSON schema.
   * @param {*} data
   * @param {object} schema - JSON Schema object
   * @returns {{ valid: boolean, errors: Array|null }}
   */
  validate(data, schema) {
    const valid = this.#ajv.validate(schema, data);
    const errors = this.#ajv.errors ? [...this.#ajv.errors] : null;
    logger.debug(`Schema validation ${valid ? "passed" : "failed"}`);
    return { valid, errors };
  }

  /**
   * Register a reusable named schema.
   * @param {string} name
   * @param {object} schema
   */
  addSchema(name, schema) {
    this.#schemas.set(name, schema);
    logger.info(`Schema registered: ${name}`);
  }

  /**
   * Retrieve a previously registered schema by name.
   * @param {string} name
   * @returns {object|undefined}
   */
  getSchema(name) {
    return this.#schemas.get(name);
  }

  /**
   * Validate an API response body against a named schema.
   * @param {{ status: number, body: * }} response
   * @param {string} schemaName
   * @returns {{ valid: boolean, errors: Array|null }}
   */
  validateResponse(response, schemaName) {
    const schema = this.#schemas.get(schemaName);
    if (!schema) throw new Error(`Schema "${schemaName}" not registered`);
    const result = this.validate(response.body, schema);
    if (!result.valid) {
      logger.warn(`Response failed "${schemaName}" validation:\n${this.generateErrorReport(result.errors)}`);
    }
    return result;
  }

  /**
   * Build a human-readable report from Ajv validation errors.
   * @param {Array} errors
   * @returns {string}
   */
  generateErrorReport(errors) {
    if (!errors || errors.length === 0) return "No errors";
    return errors
      .map((e, i) => `  ${i + 1}. ${e.instancePath || "/"} ${e.message} (${e.schemaPath})`)
      .join("\n");
  }
}

export default new SchemaValidator();
