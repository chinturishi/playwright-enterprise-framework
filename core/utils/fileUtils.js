import fs from "fs-extra";
import path from "path";
import logger from "../logging/logger.js";

class FileUtils {
  constructor() {
    if (FileUtils._instance) return FileUtils._instance;
    FileUtils._instance = this;
  }

  /**
   * Creates a directory (and parents) if it doesn't exist.
   * @param {string} dirPath
   */
  async ensureDir(dirPath) {
    await fs.ensureDir(dirPath);
    logger.debug(`Directory ensured: ${dirPath}`);
  }

  /**
   * @param {string} filePath
   * @returns {Promise<object>}
   */
  async readJSON(filePath) {
    logger.debug(`Reading JSON: ${filePath}`);
    return fs.readJson(filePath);
  }

  /**
   * @param {string} filePath
   * @param {object} data
   */
  async writeJSON(filePath, data) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeJson(filePath, data, { spaces: 2 });
    logger.debug(`Wrote JSON: ${filePath}`);
  }

  /**
   * Reads a CSV file and returns an array of objects using the header row as keys.
   * @param {string} filePath
   * @returns {Promise<object[]>}
   */
  async readCSV(filePath) {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i] ?? "";
        return obj;
      }, {});
    });
  }

  /**
   * @param {string} src
   * @param {string} dest
   */
  async copyFile(src, dest) {
    await fs.ensureDir(path.dirname(dest));
    await fs.copy(src, dest);
    logger.debug(`Copied ${src} → ${dest}`);
  }

  /**
   * @param {string} filePath
   */
  async deleteFile(filePath) {
    await fs.remove(filePath);
    logger.debug(`Deleted: ${filePath}`);
  }

  /**
   * @param {string} filePath
   * @returns {Promise<boolean>}
   */
  async exists(filePath) {
    return fs.pathExists(filePath);
  }

  /**
   * Lists files in a directory, optionally filtered by a glob-style extension pattern.
   * @param {string} dir
   * @param {string} [pattern] - e.g. ".json" or ".csv"
   * @returns {Promise<string[]>}
   */
  async listFiles(dir, pattern) {
    const exists = await fs.pathExists(dir);
    if (!exists) return [];
    const entries = await fs.readdir(dir);
    if (!pattern) return entries;
    return entries.filter((f) => f.endsWith(pattern));
  }
}

const fileUtils = new FileUtils();
export default fileUtils;
