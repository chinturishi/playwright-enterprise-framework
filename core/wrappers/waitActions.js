import logger from "../logging/logger";

class WaitActions{

    async waitForVisible(locator,timmeout = 30000){
        logger.info(`Wating for element to be visible`)
        await locator.waitFor({
            state:"visible",
            timeout
        });
        logger.info(`Element become visible`)
    }

    async waitForHidden(locator, timeout = 30000) {

    logger.info(`Waiting for element to be hidden`);

    await locator.waitFor({
      state: "hidden",
      timeout
    });

    logger.info(`Element became hidden`);
  }
}

module.exports = new WaitActions();