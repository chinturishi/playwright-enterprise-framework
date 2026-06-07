import logger from "../logging/logger.js";

class JsonUtils {
  constructor() {
    if (JsonUtils._instance) return JsonUtils._instance;
    JsonUtils._instance = this;
  }

  /**
   * Safely parses a JSON string, returning undefined on failure.
   * @param {string} str
   * @returns {*}
   */
  parse(str) {
    try {
      return JSON.parse(str);
    } catch (err) {
      logger.warn(`JSON parse failed: ${err.message}`);
      return undefined;
    }
  }

  /**
   * @param {*} obj
   * @param {boolean} [pretty=false]
   * @returns {string}
   */
  stringify(obj, pretty = false) {
    return JSON.stringify(obj, null, pretty ? 2 : 0);
  }

  /**
   * Recursively merges source into target (source wins on conflicts).
   * @param {object} target
   * @param {object} source
   * @returns {object}
   */
  deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === "object" &&
        !Array.isArray(target[key])
      ) {
        result[key] = this.deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /**
   * Gets a nested value using a dot-separated path.
   * @param {object} obj
   * @param {string} dotPath - e.g. "a.b.c"
   * @returns {*}
   */
  getByPath(obj, dotPath) {
    return dotPath.split(".").reduce((curr, key) => {
      return curr != null ? curr[key] : undefined;
    }, obj);
  }

  /**
   * Sets a nested value using a dot-separated path.
   * @param {object} obj
   * @param {string} dotPath
   * @param {*} value
   * @returns {object} The mutated object
   */
  setByPath(obj, dotPath, value) {
    const keys = dotPath.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current) || typeof current[keys[i]] !== "object") {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys.at(-1)] = value;
    return obj;
  }

  /**
   * Flattens a nested object into dot-separated key-value pairs.
   * @param {object} obj
   * @param {string} [prefix=""]
   * @returns {object}
   */
  flatten(obj, prefix = "") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(result, this.flatten(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    return result;
  }

  /**
   * Unflattens a dot-separated key-value object back to nested structure.
   * @param {object} obj
   * @returns {object}
   */
  unflatten(obj) {
    const result = {};
    for (const [dotPath, value] of Object.entries(obj)) {
      this.setByPath(result, dotPath, value);
    }
    return result;
  }
}

const jsonUtils = new JsonUtils();
export default jsonUtils;
