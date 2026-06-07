import logger from "../logging/logger.js";
import waitActions from "./waitActions.js";

class MouseActions {
  /**
   * Click at specific page coordinates.
   * @param {import('@playwright/test').Page} page
   * @param {number} x
   * @param {number} y
   */
  async click(page, x, y) {
    logger.info(`Mouse click at (${x}, ${y})`);
    await page.mouse.click(x, y);
    logger.info("Mouse click completed");
  }

  /**
   * Double-click at specific page coordinates.
   * @param {import('@playwright/test').Page} page
   * @param {number} x
   * @param {number} y
   */
  async doubleClick(page, x, y) {
    logger.info(`Mouse double-click at (${x}, ${y})`);
    await page.mouse.dblclick(x, y);
    logger.info("Mouse double-click completed");
  }

  /**
   * Right-click (context menu) on a locator.
   * @param {import('@playwright/test').Locator} locator
   */
  async rightClick(locator) {
    logger.info("Performing right-click on element");
    await waitActions.waitForVisible(locator);
    await locator.click({ button: "right" });
    logger.info("Right-click completed");
  }

  /**
   * Hover over a locator element.
   * @param {import('@playwright/test').Locator} locator
   */
  async hover(locator) {
    logger.info("Hovering over element");
    await waitActions.waitForVisible(locator);
    await locator.hover();
    logger.info("Hover completed");
  }

  /**
   * Move mouse to specific page coordinates.
   * @param {import('@playwright/test').Page} page
   * @param {number} x
   * @param {number} y
   */
  async move(page, x, y) {
    logger.debug(`Moving mouse to (${x}, ${y})`);
    await page.mouse.move(x, y);
    logger.debug("Mouse move completed");
  }

  /**
   * Scroll via the mouse wheel.
   * @param {import('@playwright/test').Page} page
   * @param {number} deltaX - Horizontal scroll amount
   * @param {number} deltaY - Vertical scroll amount
   */
  async wheel(page, deltaX, deltaY) {
    logger.info(`Mouse wheel scroll (deltaX: ${deltaX}, deltaY: ${deltaY})`);
    await page.mouse.wheel(deltaX, deltaY);
    logger.info("Mouse wheel scroll completed");
  }
}

export default new MouseActions();
