class DateUtils {
  constructor() {
    if (DateUtils._instance) return DateUtils._instance;
    DateUtils._instance = this;
  }

  /** @returns {Date} */
  now() {
    return new Date();
  }

  /**
   * Formats a date using a simple pattern: YYYY, MM, DD, HH, mm, ss, SSS.
   * @param {Date} date
   * @param {string} [pattern="YYYY-MM-DD HH:mm:ss"]
   * @returns {string}
   */
  format(date, pattern = "YYYY-MM-DD HH:mm:ss") {
    const tokens = {
      YYYY: String(date.getFullYear()),
      MM: String(date.getMonth() + 1).padStart(2, "0"),
      DD: String(date.getDate()).padStart(2, "0"),
      HH: String(date.getHours()).padStart(2, "0"),
      mm: String(date.getMinutes()).padStart(2, "0"),
      ss: String(date.getSeconds()).padStart(2, "0"),
      SSS: String(date.getMilliseconds()).padStart(3, "0")
    };
    let result = pattern;
    for (const [token, value] of Object.entries(tokens)) {
      result = result.replace(token, value);
    }
    return result;
  }

  /**
   * Returns milliseconds elapsed since the given start time.
   * @param {number|Date} startTime - Date.now() value or Date instance
   * @returns {number}
   */
  elapsed(startTime) {
    const start = startTime instanceof Date ? startTime.getTime() : startTime;
    return Date.now() - start;
  }

  /**
   * Checks if a date has exceeded the given TTL.
   * @param {Date} date
   * @param {number} ttlMs
   * @returns {boolean}
   */
  isExpired(date, ttlMs) {
    return Date.now() - date.getTime() > ttlMs;
  }

  /**
   * @param {Date} date
   * @returns {string}
   */
  toISO(date) {
    return date.toISOString();
  }

  /**
   * @param {string} str
   * @returns {Date}
   */
  fromISO(str) {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ISO date string: ${str}`);
    }
    return date;
  }

  /**
   * Returns the absolute difference in milliseconds between two dates.
   * @param {Date} date1
   * @param {Date} date2
   * @returns {number}
   */
  diffMs(date1, date2) {
    return Math.abs(date1.getTime() - date2.getTime());
  }
}

const dateUtils = new DateUtils();
export default dateUtils;
