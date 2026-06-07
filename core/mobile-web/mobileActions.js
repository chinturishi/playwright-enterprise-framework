import logger from "../logging/logger.js";
import waitActions from "../wrappers/waitActions.js";

class MobileActions {
  /**
   * Perform a mobile tap on an element.
   * @param {import('@playwright/test').Locator} locator
   */
  async tap(locator) {
    logger.info("Performing mobile tap");
    await waitActions.waitForVisible(locator);
    await locator.tap();
    logger.info("Mobile tap completed");
  }

  /**
   * Perform a double tap on an element.
   * @param {import('@playwright/test').Locator} locator
   */
  async doubleTap(locator) {
    logger.info("Performing double tap");
    await waitActions.waitForVisible(locator);
    await locator.dblclick();
    logger.info("Double tap completed");
  }

  /**
   * Long-press an element for a given duration.
   * @param {import('@playwright/test').Locator} locator
   * @param {number} [duration=1000] - Hold duration in milliseconds
   */
  async longPress(locator, duration = 1000) {
    logger.info(`Performing long press (${duration}ms)`);
    await waitActions.waitForVisible(locator);

    const box = await locator.boundingBox();
    if (!box) {
      throw new Error("Element has no bounding box — may not be visible");
    }

    const page = locator.page();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await page.touchscreen.tap(x, y);
    await page.mouse.down();
    await new Promise((resolve) => setTimeout(resolve, duration));
    await page.mouse.up();

    logger.info("Long press completed");
  }

  /**
   * Swipe in a direction across the page.
   * @param {import('@playwright/test').Page} page
   * @param {'up' | 'down' | 'left' | 'right'} direction
   * @param {number} [distance=300] - Swipe distance in pixels
   */
  async swipe(page, direction, distance = 300) {
    logger.info(`Swiping ${direction} (${distance}px)`);

    const viewport = page.viewportSize();
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;

    const vectors = {
      up: { endX: centerX, endY: centerY - distance },
      down: { endX: centerX, endY: centerY + distance },
      left: { endX: centerX - distance, endY: centerY },
      right: { endX: centerX + distance, endY: centerY },
    };

    const target = vectors[direction];
    if (!target) {
      throw new Error(`Invalid swipe direction: "${direction}". Use up, down, left, or right.`);
    }

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(target.endX, target.endY, { steps: 20 });
    await page.mouse.up();

    logger.info(`Swipe ${direction} completed`);
  }

  /**
   * Simulate a pinch-zoom gesture via touch events evaluated in the page.
   * @param {import('@playwright/test').Page} page
   * @param {number} [scale=2] - Zoom scale factor (>1 zoom in, <1 zoom out)
   */
  async pinchZoom(page, scale = 2) {
    logger.info(`Performing pinch zoom (scale: ${scale})`);

    await page.evaluate((s) => {
      const event = new TouchEvent("touchstart", {
        bubbles: true,
        cancelable: true,
        touches: [
          new Touch({ identifier: 0, target: document.body, clientX: 200, clientY: 200 }),
          new Touch({ identifier: 1, target: document.body, clientX: 250, clientY: 250 }),
        ],
      });
      document.body.dispatchEvent(event);

      const dist = 50 * s;
      const moveEvent = new TouchEvent("touchmove", {
        bubbles: true,
        cancelable: true,
        touches: [
          new Touch({ identifier: 0, target: document.body, clientX: 200 - dist, clientY: 200 - dist }),
          new Touch({ identifier: 1, target: document.body, clientX: 250 + dist, clientY: 250 + dist }),
        ],
      });
      document.body.dispatchEvent(moveEvent);

      document.body.dispatchEvent(new TouchEvent("touchend", { bubbles: true, cancelable: true, touches: [] }));
    }, scale);

    logger.info("Pinch zoom completed");
  }

  /**
   * Scroll the page to absolute coordinates.
   * @param {import('@playwright/test').Page} page
   * @param {number} x
   * @param {number} y
   */
  async scrollTo(page, x, y) {
    logger.info(`Scrolling to (${x}, ${y})`);
    await page.evaluate(({ sx, sy }) => window.scrollTo(sx, sy), { sx: x, sy: y });
    logger.info("Scroll completed");
  }
}

export default new MobileActions();
