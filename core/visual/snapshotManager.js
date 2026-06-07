import logger from "../logging/logger.js";
import baselineManager from "./baselineManager.js";
import imageDiff from "./imageDiff.js";
import path from "path";
import fs from "fs-extra";

const SNAPSHOTS_DIR = "snapshots";

class SnapshotManager {
  /**
   * Take a full-page screenshot and save it as the current snapshot.
   * @param {import('@playwright/test').Page} page
   * @param {string} name - Snapshot identifier
   * @returns {Promise<{path: string, buffer: Buffer}>}
   */
  async takeSnapshot(page, name) {
    const buffer = await page.screenshot({ fullPage: true });
    const snapshotPath = path.resolve(SNAPSHOTS_DIR, `${name}.png`);
    await fs.ensureDir(path.dirname(snapshotPath));
    await fs.writeFile(snapshotPath, buffer);
    logger.info(`Snapshot taken: ${snapshotPath}`);
    return { path: snapshotPath, buffer };
  }

  /**
   * Take a snapshot and compare it against the stored baseline.
   * @param {import('@playwright/test').Page} page
   * @param {string} name
   * @param {object} [options={}] - { threshold, browser, platform }
   * @returns {Promise<{match: boolean, diffPercentage: number, baselineExists: boolean}>}
   */
  async compareSnapshot(page, name, options = {}) {
    const { path: actualPath } = await this.takeSnapshot(page, name);
    const baselineBuffer = await baselineManager.getBaseline(name, options);

    if (!baselineBuffer) {
      logger.warn(`No baseline found for "${name}". Saving current as baseline.`);
      const buffer = await fs.readFile(actualPath);
      await baselineManager.saveBaseline(name, buffer, options);
      return { match: true, diffPercentage: 0, baselineExists: false };
    }

    const baselinePath = baselineManager.getBaselinePath(name, options);
    const diffPath = path.resolve(SNAPSHOTS_DIR, `${name}-diff.png`);
    const result = await imageDiff.diff(baselinePath, actualPath, diffPath, {
      threshold: options.threshold ?? 0.1,
    });

    logger.info(`Snapshot comparison for "${name}": ${result.match ? "MATCH" : "MISMATCH"} (${result.diffPercentage.toFixed(2)}%)`);
    return { match: result.match, diffPercentage: result.diffPercentage, baselineExists: true };
  }

  /**
   * Take a new snapshot and save it as the updated baseline.
   * @param {import('@playwright/test').Page} page
   * @param {string} name
   * @returns {Promise<string>} Updated baseline path
   */
  async updateSnapshot(page, name) {
    const buffer = await page.screenshot({ fullPage: true });
    const filePath = await baselineManager.updateBaseline(name, buffer);
    logger.info(`Snapshot baseline updated for "${name}"`);
    return filePath;
  }
}

export default new SnapshotManager();
