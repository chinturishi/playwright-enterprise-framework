import fs from "fs-extra";
import path from "path";
import { PNG } from "pngjs";
import logger from "../logging/logger.js";

class ImageDiff {
  /**
   * Compare two image files and write a diff output.
   * Uses pixelmatch for pixel-level diffing (requires pixelmatch + pngjs).
   * @param {string} baselinePath - Path to the baseline image
   * @param {string} actualPath - Path to the actual screenshot
   * @param {string} diffOutputPath - Path to write the diff image
   * @param {object} [options={}] - Options like { threshold: 0.1 }
   * @returns {Promise<{match: boolean, diffPixels: number, totalPixels: number, diffPercentage: number}>}
   */
  async diff(baselinePath, actualPath, diffOutputPath, options = {}) {
    const { default: pixelmatch } = await import("pixelmatch");
    const baseline = PNG.sync.read(await fs.readFile(baselinePath));
    const actual = PNG.sync.read(await fs.readFile(actualPath));

    const { width, height } = baseline;
    if (actual.width !== width || actual.height !== height) {
      logger.error(`Image dimensions mismatch: baseline(${width}x${height}) vs actual(${actual.width}x${actual.height})`);
      return { match: false, diffPixels: -1, totalPixels: width * height, diffPercentage: 100 };
    }

    const diffImage = new PNG({ width, height });
    const diffPixels = pixelmatch(
      baseline.data, actual.data, diffImage.data,
      width, height, { threshold: options.threshold ?? 0.1 }
    );

    await fs.ensureDir(path.dirname(diffOutputPath));
    await fs.writeFile(diffOutputPath, PNG.sync.write(diffImage));

    const totalPixels = width * height;
    const diffPercentage = (diffPixels / totalPixels) * 100;
    const match = diffPixels === 0;

    logger.info(`Image diff: ${diffPercentage.toFixed(2)}% different (${diffPixels}/${totalPixels} pixels)`);
    return { match, diffPixels, totalPixels, diffPercentage };
  }

  /**
   * Calculate the percentage difference between two images.
   * @param {string} baselinePath
   * @param {string} actualPath
   * @returns {Promise<number>} Percentage of differing pixels
   */
  async calculateDiffPercentage(baselinePath, actualPath) {
    const tempDiff = path.join(path.dirname(actualPath), ".tmp-diff.png");
    try {
      const result = await this.diff(baselinePath, actualPath, tempDiff);
      return result.diffPercentage;
    } finally {
      await fs.remove(tempDiff).catch(() => {});
    }
  }

  /**
   * Create a highlighted visual diff image showing differences in red.
   * @param {string} baselinePath
   * @param {string} actualPath
   * @param {string} outputPath
   * @returns {Promise<{diffPercentage: number, outputPath: string}>}
   */
  async highlightDifferences(baselinePath, actualPath, outputPath) {
    const result = await this.diff(baselinePath, actualPath, outputPath, {
      threshold: 0.1,
      diffColor: [255, 0, 0],
    });
    logger.info(`Highlighted diff saved to ${outputPath}`);
    return { diffPercentage: result.diffPercentage, outputPath };
  }
}

export default new ImageDiff();
