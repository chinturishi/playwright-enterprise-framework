// #genai
// Launch, connect, and teardown Playwright Browser instances.
import {chromium,firefox,webkit} from "@playwright/test" 
import logger from "../logging/logger";

class BrowserManger{

    constructor(){
        this.browser=null;
    }

    async launchBrowser(browserType ="chromium", headless=flase){
        logger.info(`Launching browser: ${browserType}`)
    }
}