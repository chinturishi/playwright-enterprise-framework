import logger from "../logging/logger.js";
import deviceManager from "./deviceManager.js";

const BREAKPOINTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

class ViewportManager {
  /**
   * Set the viewport to an exact width and height.
   * @param {import('@playwright/test').Page} page
   * @param {number} width
   * @param {number} height
   */
  async setViewport(page, width, height) {
    logger.info(`Setting viewport to ${width}x${height}`);
    await page.setViewportSize({ width, height });
    logger.info("Viewport updated");
  }

  /**
   * Apply a registered device's viewport to the page.
   * @param {import('@playwright/test').Page} page
   * @param {string} deviceName - Playwright device name
   */
  async setDevice(page, deviceName) {
    const { width, height } = deviceManager.getViewport(deviceName);
    logger.info(`Setting viewport to device "${deviceName}" (${width}x${height})`);
    await page.setViewportSize({ width, height });
    logger.info(`Viewport set to ${deviceName}`);
  }

  /**
   * Get the current viewport size of the page.
   * @param {import('@playwright/test').Page} page
   * @returns {{ width: number, height: number } | null}
   */
  getViewport(page) {
    const size = page.viewportSize();
    logger.debug(`Current viewport: ${size?.width}x${size?.height}`);
    return size;
  }

  /**
   * Rotate the viewport (swap width ↔ height).
   * @param {import('@playwright/test').Page} page
   */
  async rotate(page) {
    const current = page.viewportSize();
    if (!current) {
      throw new Error("Cannot rotate — no viewport size set");
    }
    const rotated = { width: current.height, height: current.width };
    logger.info(`Rotating viewport from ${current.width}x${current.height} to ${rotated.width}x${rotated.height}`);
    await page.setViewportSize(rotated);
    logger.info("Viewport rotated");
  }

  /**
   * Apply a responsive breakpoint preset.
   * @param {import('@playwright/test').Page} page
   * @param {'mobile' | 'tablet' | 'desktop'} breakpoint
   */
  async setResponsive(page, breakpoint) {
    const size = BREAKPOINTS[breakpoint];
    if (!size) {
      throw new Error(`Unknown breakpoint: "${breakpoint}". Use mobile, tablet, or desktop.`);
    }
    logger.info(`Setting responsive breakpoint: ${breakpoint} (${size.width}x${size.height})`);
    await page.setViewportSize(size);
    logger.info(`Responsive breakpoint "${breakpoint}" applied`);
  }
}

export default new ViewportManager();
