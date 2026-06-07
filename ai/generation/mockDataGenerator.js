import logger from "../../core/logging/logger.js";

class MockDataGenerator {
  /**
   * Generate mock data matching a JSON schema.
   * @param {object} schema - JSON Schema object
   */
  generate(schema) {
    return this._generateFromSchema(schema);
  }

  /**
   * Generate an array of mock data entries.
   * @param {object} schema @param {number} count
   */
  generateBatch(schema, count) {
    return Array.from({ length: count }, (_, i) => {
      const item = this._generateFromSchema(schema);
      if (typeof item === "object" && item !== null) item._index = i;
      return item;
    });
  }

  /**
   * Infer schema from an example object and generate variations.
   * @param {object} example
   * @returns {{ schema: object, variations: Array }}
   */
  fromExample(example) {
    const schema = this._inferSchema(example);
    const variations = Array.from({ length: 5 }, () => this._generateFromSchema(schema));
    logger.info(`[MockDataGenerator] Generated 5 variations from example`);
    return { schema, variations };
  }

  _generateFromSchema(schema) {
    if (!schema || !schema.type) return null;
    switch (schema.type) {
      case "string":
        if (schema.enum) return schema.enum[Math.floor(Math.random() * schema.enum.length)];
        if (schema.format === "email") return `user${Math.floor(Math.random() * 9999)}@example.com`;
        if (schema.format === "date") return new Date(Date.now() - Math.random() * 365 * 86400000).toISOString().slice(0, 10);
        if (schema.format === "uri") return `https://example.com/${this._randomStr(8)}`;
        return this._randomStr(schema.minLength || 5, schema.maxLength || 20);
      case "number":
      case "integer":
        return Math.floor(Math.random() * ((schema.maximum || 1000) - (schema.minimum || 0)) + (schema.minimum || 0));
      case "boolean":
        return Math.random() > 0.5;
      case "array":
        return Array.from({ length: schema.minItems || 2 }, () => this._generateFromSchema(schema.items || { type: "string" }));
      case "object": {
        const result = {};
        for (const [key, propSchema] of Object.entries(schema.properties || {})) {
          result[key] = this._generateFromSchema(propSchema);
        }
        return result;
      }
      default: return null;
    }
  }

  _inferSchema(example) {
    if (example === null || example === undefined) return { type: "string" };
    if (Array.isArray(example)) return { type: "array", items: example.length ? this._inferSchema(example[0]) : { type: "string" }, minItems: 1 };
    switch (typeof example) {
      case "string": return { type: "string", minLength: 1, maxLength: Math.max(example.length * 2, 10) };
      case "number": return Number.isInteger(example) ? { type: "integer", minimum: 0, maximum: example * 2 || 100 } : { type: "number", minimum: 0, maximum: example * 2 || 100 };
      case "boolean": return { type: "boolean" };
      case "object": {
        const props = {};
        for (const [k, v] of Object.entries(example)) props[k] = this._inferSchema(v);
        return { type: "object", properties: props };
      }
      default: return { type: "string" };
    }
  }

  _randomStr(min = 5, max = 15) {
    const len = min + Math.floor(Math.random() * (max - min + 1));
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }
}

export default new MockDataGenerator();
