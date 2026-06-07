import { randomUUID, randomBytes } from "crypto";

class RandomUtils {
  constructor() {
    if (RandomUtils._instance) return RandomUtils._instance;
    RandomUtils._instance = this;
  }

  /** @returns {string} RFC 4122 v4 UUID */
  uuid() {
    return randomUUID();
  }

  /**
   * Generates a random alphanumeric + special-char string.
   * @param {number} [length=10]
   * @returns {string}
   */
  string(length = 10) {
    return randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  }

  /**
   * @param {number} min
   * @param {number} max
   * @returns {number} Integer in [min, max]
   */
  number(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a random email address using a UUID fragment.
   * @returns {string}
   */
  email() {
    const id = this.string(8);
    return `test.${id}@example.com`;
  }

  /** @returns {boolean} */
  boolean() {
    return Math.random() >= 0.5;
  }

  /**
   * Picks a random element from an array.
   * @template T
   * @param {T[]} array
   * @returns {T}
   */
  pick(array) {
    if (!array || array.length === 0) {
      throw new Error("Cannot pick from an empty array");
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Returns a new array with elements in random order (Fisher-Yates).
   * @template T
   * @param {T[]} array
   * @returns {T[]}
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Generates a random string using only [a-zA-Z0-9].
   * @param {number} [length=10]
   * @returns {string}
   */
  alphanumeric(length = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const bytes = randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }
}

const randomUtils = new RandomUtils();
export default randomUtils;
