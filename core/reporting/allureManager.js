import logger from "../logging/logger.js";

const SEVERITY_VALUES = new Set(["blocker", "critical", "normal", "minor", "trivial"]);

/**
 * Facade over Allure metadata APIs. When `allure-playwright` is installed and
 * the Allure runtime is available, methods delegate to the global `allure`
 * object. Otherwise they log the metadata for traceability without failing.
 */
class AllureManager {
  #runtime = null;

  /** Lazy-load the allure-js-commons runtime. */
  #getAllure() {
    if (this.#runtime) return this.#runtime;
    try {
      // allure-playwright re-exports the runtime via allure-js-commons
      const mod = globalThis.allure;
      if (mod) {
        this.#runtime = mod;
        return mod;
      }
    } catch {
      /* allure not available */
    }
    return null;
  }

  /**
   * Record a named step with a status.
   * @param {string} name
   * @param {'passed' | 'failed' | 'broken' | 'skipped'} [status='passed']
   */
  addStep(name, status = "passed") {
    const allure = this.#getAllure();
    if (allure?.step) {
      allure.step(name, () => {});
    }
    logger.debug(`Allure step: "${name}" [${status}]`);
  }

  /**
   * Attach content (screenshot buffer, log text, etc.) to the current test.
   * @param {string} name
   * @param {string | Buffer} content
   * @param {string} [type='text/plain'] - MIME type
   */
  addAttachment(name, content, type = "text/plain") {
    const allure = this.#getAllure();
    if (allure?.attachment) {
      allure.attachment(name, content, type);
    }
    logger.debug(`Allure attachment: "${name}" (${type})`);
  }

  /**
   * Add a key-value parameter to the current test.
   * @param {string} name
   * @param {string} value
   */
  addParameter(name, value) {
    const allure = this.#getAllure();
    if (allure?.parameter) {
      allure.parameter(name, value);
    }
    logger.debug(`Allure parameter: ${name}=${value}`);
  }

  /**
   * Add a link (e.g. Jira ticket, issue tracker) to the test.
   * @param {string} url
   * @param {string} [name]
   * @param {'issue' | 'tms' | 'custom'} [type='issue']
   */
  addLink(url, name, type = "issue") {
    const allure = this.#getAllure();
    if (allure?.link) {
      allure.link(url, name, type);
    }
    logger.debug(`Allure link: [${type}] ${name ?? url}`);
  }

  /**
   * Set the Allure "feature" label.
   * @param {string} name
   */
  setFeature(name) {
    const allure = this.#getAllure();
    if (allure?.feature) {
      allure.feature(name);
    }
    logger.debug(`Allure feature: "${name}"`);
  }

  /**
   * Set the Allure severity level.
   * @param {'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'} level
   */
  setSeverity(level) {
    if (!SEVERITY_VALUES.has(level)) {
      logger.warn(`Invalid Allure severity "${level}" — defaulting to "normal"`);
      level = "normal";
    }
    const allure = this.#getAllure();
    if (allure?.severity) {
      allure.severity(level);
    }
    logger.debug(`Allure severity: ${level}`);
  }

  /**
   * Set the Allure "epic" label.
   * @param {string} name
   */
  setEpic(name) {
    const allure = this.#getAllure();
    if (allure?.epic) {
      allure.epic(name);
    }
    logger.debug(`Allure epic: "${name}"`);
  }

  /**
   * Set the Allure "story" label.
   * @param {string} name
   */
  setStory(name) {
    const allure = this.#getAllure();
    if (allure?.story) {
      allure.story(name);
    }
    logger.debug(`Allure story: "${name}"`);
  }
}

const allureManager = new AllureManager();
export default allureManager;
