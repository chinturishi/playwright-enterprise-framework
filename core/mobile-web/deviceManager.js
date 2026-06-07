import { devices } from "@playwright/test";
import logger from "../logging/logger.js";

class DeviceManager {
  /**
   * Get the full device descriptor from Playwright's built-in device registry.
   * @param {string} deviceName - e.g. 'iPhone 14', 'Pixel 7', 'iPad Pro 11'
   * @returns {object} Device descriptor (viewport, userAgent, deviceScaleFactor, isMobile, hasTouch)
   */
  getDevice(deviceName) {
    const descriptor = devices[deviceName];
    if (!descriptor) {
      const suggestion = this.getDeviceList()
        .filter((name) => name.toLowerCase().includes(deviceName.toLowerCase()))
        .slice(0, 5);
      throw new Error(
        `Unknown device: "${deviceName}".${suggestion.length ? ` Did you mean: ${suggestion.join(", ")}?` : ""}`
      );
    }
    logger.info(`Device descriptor retrieved: ${deviceName}`);
    return descriptor;
  }

  /**
   * List all available device names in the Playwright registry.
   * @returns {string[]}
   */
  getDeviceList() {
    const list = Object.keys(devices);
    logger.debug(`${list.length} devices available in Playwright registry`);
    return list;
  }

  /**
   * Check whether a device is flagged as mobile.
   * @param {string} deviceName
   * @returns {boolean}
   */
  isMobile(deviceName) {
    const descriptor = this.getDevice(deviceName);
    const mobile = descriptor.isMobile ?? false;
    logger.debug(`${deviceName} isMobile: ${mobile}`);
    return mobile;
  }

  /**
   * Get viewport dimensions for a device.
   * @param {string} deviceName
   * @returns {{ width: number, height: number }}
   */
  getViewport(deviceName) {
    const descriptor = this.getDevice(deviceName);
    logger.debug(`${deviceName} viewport: ${descriptor.viewport.width}x${descriptor.viewport.height}`);
    return descriptor.viewport;
  }
}

export default new DeviceManager();
