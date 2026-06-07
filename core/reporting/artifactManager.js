import path from "path";
import fs from "fs-extra";
import logger from "../logging/logger.js";

const REPORTS_ROOT = "reports";

const ARTIFACT_DIRS = {
  screenshot: "screenshots",
  video: "videos",
  trace: "traces",
  log: "logs",
  har: "har",
};

class ArtifactManager {
  /**
   * Capture a page screenshot and persist it to `reports/screenshots/`.
   * @param {import('@playwright/test').Page} page
   * @param {string} name - File name without extension
   * @returns {Promise<string>} Absolute path of the saved screenshot
   */
  async saveScreenshot(page, name) {
    const filePath = this.getArtifactPath("screenshot", `${name}.png`);
    await fs.ensureDir(path.dirname(filePath));
    await page.screenshot({ path: filePath, fullPage: true });
    logger.info(`Screenshot saved → ${filePath}`);
    return filePath;
  }

  /**
   * Save a recorded video to `reports/videos/`. Recording must have been
   * enabled in the browser context options.
   * @param {import('@playwright/test').Page} page
   * @param {string} name
   * @returns {Promise<string | null>} Path to saved video or null if unavailable
   */
  async saveVideo(page, name) {
    const video = page.video();
    if (!video) {
      logger.warn("No video recording available for this page");
      return null;
    }
    const filePath = this.getArtifactPath("video", `${name}.webm`);
    await fs.ensureDir(path.dirname(filePath));
    const srcPath = await video.path();
    if (srcPath) {
      await fs.copy(srcPath, filePath);
      logger.info(`Video saved → ${filePath}`);
      return filePath;
    }
    logger.warn("Video path unavailable — recording may still be in progress");
    return null;
  }

  /**
   * Export a Playwright trace to `reports/traces/`.
   * @param {import('@playwright/test').BrowserContext} context
   * @param {string} name
   * @returns {Promise<string>}
   */
  async saveTrace(context, name) {
    const filePath = this.getArtifactPath("trace", `${name}.zip`);
    await fs.ensureDir(path.dirname(filePath));
    await context.tracing.stop({ path: filePath });
    logger.info(`Trace saved → ${filePath}`);
    return filePath;
  }

  /**
   * Write arbitrary text content (logs, JSON, etc.) to `reports/logs/`.
   * @param {string} content
   * @param {string} name - File name with extension
   * @returns {Promise<string>}
   */
  async saveLogs(content, name) {
    const filePath = this.getArtifactPath("log", name);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, "utf-8");
    logger.info(`Log artifact saved → ${filePath}`);
    return filePath;
  }

  /**
   * Save a HAR (HTTP Archive) file. The page's context must have been
   * created with `recordHar` enabled, or `routeFromHAR` used.
   * @param {import('@playwright/test').Page} page
   * @param {string} name
   * @returns {Promise<string>}
   */
  async saveHAR(page, name) {
    const filePath = this.getArtifactPath("har", `${name}.har`);
    await fs.ensureDir(path.dirname(filePath));
    await page.context().close();
    logger.info(`HAR saved → ${filePath}`);
    return filePath;
  }

  /**
   * Construct the absolute path for a given artifact type and name.
   * @param {'screenshot' | 'video' | 'trace' | 'log' | 'har'} type
   * @param {string} name - File name with extension
   * @returns {string}
   */
  getArtifactPath(type, name) {
    const subdir = ARTIFACT_DIRS[type] || type;
    return path.resolve(REPORTS_ROOT, subdir, name);
  }

  /**
   * Remove all artifacts from the reports directory.
   * @returns {Promise<void>}
   */
  async cleanArtifacts() {
    for (const dir of Object.values(ARTIFACT_DIRS)) {
      const dirPath = path.resolve(REPORTS_ROOT, dir);
      if (await fs.pathExists(dirPath)) {
        await fs.emptyDir(dirPath);
        logger.info(`Cleaned artifact directory: ${dirPath}`);
      }
    }
    logger.info("All artifact directories cleaned");
  }
}

const artifactManager = new ArtifactManager();
export default artifactManager;
