class StringUtils {
  constructor() {
    if (StringUtils._instance) return StringUtils._instance;
    StringUtils._instance = this;
  }

  /**
   * @param {string} str
   * @returns {string}
   */
  capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Converts a string to camelCase.
   * @param {string} str
   * @returns {string}
   */
  camelCase(str) {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase())
      .replace(/^[A-Z]/, (ch) => ch.toLowerCase());
  }

  /**
   * Converts a string to kebab-case.
   * @param {string} str
   * @returns {string}
   */
  kebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  }

  /**
   * Converts a string to snake_case.
   * @param {string} str
   * @returns {string}
   */
  snakeCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();
  }

  /**
   * @param {string} str
   * @param {number} maxLength
   * @param {string} [suffix="..."]
   * @returns {string}
   */
  truncate(str, maxLength, suffix = "...") {
    if (!str || str.length <= maxLength) return str || "";
    return str.slice(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Simple template interpolation: replaces {{key}} with vars[key].
   * @param {string} str
   * @param {object} vars
   * @returns {string}
   */
  template(str, vars) {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`;
    });
  }

  /**
   * Converts a string into a URL-friendly slug.
   * @param {string} str
   * @returns {string}
   */
  slugify(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Masks a string, leaving only the last `visibleChars` characters visible.
   * @param {string} str
   * @param {number} [visibleChars=4]
   * @returns {string}
   */
  mask(str, visibleChars = 4) {
    if (!str || str.length <= visibleChars) return str || "";
    const masked = "*".repeat(str.length - visibleChars);
    return masked + str.slice(-visibleChars);
  }
}

const stringUtils = new StringUtils();
export default stringUtils;
