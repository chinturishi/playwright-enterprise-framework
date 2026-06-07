import logger from "../logging/logger.js";
import waitActions from "./waitActions.js";

class DragDropActions {
  /**
   * Drag one element and drop it onto another.
   * @param {import('@playwright/test').Locator} source - Locator for the drag source
   * @param {import('@playwright/test').Locator} target - Locator for the drop target
   * @param {object} [options] - force, sourcePosition, targetPosition
   */
  async dragAndDrop(source, target, options = {}) {
    logger.info("Performing drag-and-drop between locators");
    await waitActions.waitForVisible(source);
    await waitActions.waitForVisible(target);
    await source.dragTo(target, options);
    logger.info("Drag-and-drop completed");
  }

  /**
   * Drag an element to an absolute page coordinate.
   * @param {import('@playwright/test').Locator} source - Locator for the drag source
   * @param {{ x: number, y: number }} targetPosition - Target coordinates
   */
  async dragTo(source, targetPosition) {
    logger.info(`Dragging element to position (${targetPosition.x}, ${targetPosition.y})`);
    await waitActions.waitForVisible(source);

    const box = await source.boundingBox();
    if (!box) {
      throw new Error("Source element has no bounding box — it may not be visible");
    }

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const page = source.page();

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetPosition.x, targetPosition.y, { steps: 10 });
    await page.mouse.up();

    logger.info("Drag to coordinates completed");
  }
}

export default new DragDropActions();
