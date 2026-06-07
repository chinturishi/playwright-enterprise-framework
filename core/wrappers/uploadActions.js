import logger from "../logging/logger.js";
import waitActions from "./waitActions.js";

class UploadActions {
  /**
   * Upload a single file via a file input element.
   * @param {import('@playwright/test').Locator} locator - File input locator
   * @param {string} filePath - Absolute or relative path to the file
   */
  async uploadFile(locator, filePath) {
    logger.info(`Uploading file: ${filePath}`);
    await locator.setInputFiles(filePath);
    logger.info("File uploaded successfully");
  }

  /**
   * Upload multiple files via a file input element.
   * @param {import('@playwright/test').Locator} locator - File input locator
   * @param {string[]} filePaths - Array of file paths
   */
  async uploadFiles(locator, filePaths) {
    logger.info(`Uploading ${filePaths.length} file(s)`);
    await locator.setInputFiles(filePaths);
    logger.info(`${filePaths.length} file(s) uploaded successfully`);
  }

  /**
   * Handle a file chooser dialog triggered by an action.
   * @param {import('@playwright/test').Page} page
   * @param {string | string[]} filePath - Path(s) to upload
   * @param {Function} triggerAction - Action that opens the file chooser (e.g. button click)
   */
  async uploadViaChooser(page, filePath, triggerAction) {
    logger.info("Waiting for file chooser dialog");

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      triggerAction(),
    ]);

    const paths = Array.isArray(filePath) ? filePath : [filePath];
    await fileChooser.setFiles(paths);
    logger.info(`File(s) set via file chooser: ${paths.length} file(s)`);
  }

  /**
   * Remove / clear a file input (reset to no file selected).
   * @param {import('@playwright/test').Locator} locator - File input locator
   */
  async removeFile(locator) {
    logger.info("Removing selected file(s) from input");
    await locator.setInputFiles([]);
    logger.info("File input cleared");
  }
}

export default new UploadActions();
