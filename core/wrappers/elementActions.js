import logger from "../logging/logger";
import waitActions from "./waitActions"

class ElementActions {

  async click(locator) {

    logger.info(`Click action started`);

    await waitActions.waitForVisible(locator);

    await locator.click();

    logger.info(`Click action completed`);
  }

  async fill(locator, text) {

    logger.info(`Fill action started with text: ${text}`);

    await waitActions.waitForVisible(locator);

    await locator.fill(text);

    logger.info(`Fill action completed`);
  }

  async getText(locator) {

    logger.info(`Getting text from element`);

    await waitActions.waitForVisible(locator);

    const text = await locator.textContent();

    logger.info(`Text retrieved: ${text}`);

    return text;
  }
}

module.exports = new ElementActions();