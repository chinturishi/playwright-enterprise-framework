import fs from "fs-extra";
import path from "path";
import logger from "../logging/logger.js";

const DEFAULT_BASELINES_DIR = "baselines";

class BaselineManager {
  constructor() {
    this.baseDir = DEFAULT_BASELINES_DIR;
  }

  /**
   * Construct the file path for a baseline image.
   * @param {string} name - Snapshot name
   * @param {object} [options={}] - { browser, platform, directory }
   * @returns {string} Resolved baseline path
   */
  getBaselinePath(name, options = {}) {
    const browser = options.browser || "chromium";
    const platform = options.platform || process.platform;
    const dir = options.directory || path.join(this.baseDir, browser, platform);
    return path.resolve(dir, `${name}.png`);
  }

  /**
   * Save a screenshot buffer as a baseline image.
   * @param {string} name
   * @param {Buffer} screenshotBuffer
   * @param {object} [options={}]
   * @returns {Promise<string>} The saved file path
   */
  async saveBaseline(name, screenshotBuffer, options = {}) {
    const filePath = this.getBaselinePath(name, options);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, screenshotBuffer);
    logger.info(`Baseline saved: ${filePath}`);
    return filePath;
  }

  /**
   * Read a baseline image file.
   * @param {string} name
   * @param {object} [options={}]
   * @returns {Promise<Buffer|null>} The file buffer or null if not found
   */
  async getBaseline(name, options = {}) {
    const filePath = this.getBaselinePath(name, options);
    if (await fs.pathExists(filePath)) {
      return fs.readFile(filePath);
    }
    logger.warn(`Baseline not found: ${filePath}`);
    return null;
  }

  /**
   * Delete a baseline image.
   * @param {string} name
   * @param {object} [options={}]
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteBaseline(name, options = {}) {
    const filePath = this.getBaselinePath(name, options);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      logger.info(`Baseline deleted: ${filePath}`);
      return true;
    }
    return false;
  }

  /**
   * List all baseline PNG files in a directory.
   * @param {string} [directory] - Directory to list; defaults to base dir
   * @returns {Promise<string[]>} Array of file paths
   */
  async listBaselines(directory) {
    const dir = directory || this.baseDir;
    if (!(await fs.pathExists(dir))) {
      return [];
    }
    const files = [];
    const walk = async (d) => {
      const entries = await fs.readdir(d, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
        } else if (entry.name.endsWith(".png")) {
          files.push(full);
        }
      }
    };
    await walk(dir);
    return files;
  }

  /**
   * Update an existing baseline with a new screenshot.
   * @param {string} name
   * @param {Buffer} newScreenshot
   * @param {object} [options={}]
   * @returns {Promise<string>} The updated file path
   */
  async updateBaseline(name, newScreenshot, options = {}) {
    const filePath = this.getBaselinePath(name, options);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, newScreenshot);
    logger.info(`Baseline updated: ${filePath}`);
    return filePath;
  }
}

export default new BaselineManager();
