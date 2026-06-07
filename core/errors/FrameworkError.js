/**
 * Custom error hierarchy for the enterprise framework.
 * Consumers see framework-specific errors instead of raw Playwright internals.
 */

export class FrameworkError extends Error {
  /**
   * @param {string} message
   * @param {object} [options]
   * @param {Error} [options.cause] - Original error that triggered this one
   */
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = "FrameworkError";
    this.timestamp = new Date().toISOString();
  }
}

export class LocatorNotFoundError extends FrameworkError {
  /**
   * @param {string|object} descriptor - Locator descriptor or name that failed
   * @param {object} [options]
   */
  constructor(descriptor, options = {}) {
    const desc =
      typeof descriptor === "string"
        ? descriptor
        : JSON.stringify(descriptor);
    super(`Locator not found: ${desc}`, options);
    this.name = "LocatorNotFoundError";
    this.descriptor = descriptor;
  }
}

export class NavigationError extends FrameworkError {
  /**
   * @param {string} url
   * @param {string} reason
   * @param {object} [options]
   */
  constructor(url, reason, options = {}) {
    super(`Navigation to "${url}" failed: ${reason}`, options);
    this.name = "NavigationError";
    this.url = url;
  }
}

export class TimeoutError extends FrameworkError {
  /**
   * @param {string} operation - What timed out (e.g. "waitForVisible")
   * @param {number} timeoutMs
   * @param {object} [options]
   */
  constructor(operation, timeoutMs, options = {}) {
    super(`"${operation}" timed out after ${timeoutMs}ms`, options);
    this.name = "TimeoutError";
    this.operation = operation;
    this.timeoutMs = timeoutMs;
  }
}

export class ElementNotInteractableError extends FrameworkError {
  /**
   * @param {string|object} descriptor
   * @param {string} action - The action that failed (e.g. "click")
   * @param {object} [options]
   */
  constructor(descriptor, action, options = {}) {
    const desc =
      typeof descriptor === "string"
        ? descriptor
        : JSON.stringify(descriptor);
    super(`Cannot ${action} on element ${desc}: not interactable`, options);
    this.name = "ElementNotInteractableError";
    this.descriptor = descriptor;
    this.action = action;
  }
}

export class ConfigurationError extends FrameworkError {
  /**
   * @param {string} key
   * @param {string} reason
   * @param {object} [options]
   */
  constructor(key, reason, options = {}) {
    super(`Configuration error for "${key}": ${reason}`, options);
    this.name = "ConfigurationError";
    this.configKey = key;
  }
}
