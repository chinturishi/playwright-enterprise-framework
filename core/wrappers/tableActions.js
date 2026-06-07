import logger from "../logging/logger.js";
import waitActions from "./waitActions.js";

class TableActions {
  /**
   * Get the number of rows in a table body.
   * @param {import('@playwright/test').Locator} tableLocator
   * @returns {Promise<number>}
   */
  async getRowCount(tableLocator) {
    logger.info("Getting table row count");
    await waitActions.waitForVisible(tableLocator);
    const count = await tableLocator.locator("tbody tr").count();
    logger.info(`Table row count: ${count}`);
    return count;
  }

  /**
   * Get the number of columns from the table header.
   * @param {import('@playwright/test').Locator} tableLocator
   * @returns {Promise<number>}
   */
  async getColumnCount(tableLocator) {
    logger.info("Getting table column count");
    await waitActions.waitForVisible(tableLocator);
    const count = await tableLocator.locator("thead th").count();
    logger.info(`Table column count: ${count}`);
    return count;
  }

  /**
   * Get the text content of a specific cell.
   * @param {import('@playwright/test').Locator} tableLocator
   * @param {number} row - 0-based row index
   * @param {number} col - 0-based column index
   * @returns {Promise<string | null>}
   */
  async getCellText(tableLocator, row, col) {
    logger.debug(`Getting cell text at row=${row}, col=${col}`);
    await waitActions.waitForVisible(tableLocator);
    const cell = tableLocator.locator(`tbody tr`).nth(row).locator("td").nth(col);
    const text = await cell.textContent();
    logger.debug(`Cell text: ${text}`);
    return text;
  }

  /**
   * Get all text contents of a specific row.
   * @param {import('@playwright/test').Locator} tableLocator
   * @param {number} row - 0-based row index
   * @returns {Promise<string[]>}
   */
  async getRowData(tableLocator, row) {
    logger.debug(`Getting row data for row=${row}`);
    await waitActions.waitForVisible(tableLocator);
    const cells = tableLocator.locator("tbody tr").nth(row).locator("td");
    const count = await cells.count();
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(await cells.nth(i).textContent());
    }
    logger.debug(`Row data: ${JSON.stringify(data)}`);
    return data;
  }

  /**
   * Get all text contents of a specific column.
   * @param {import('@playwright/test').Locator} tableLocator
   * @param {number} col - 0-based column index
   * @returns {Promise<string[]>}
   */
  async getColumnData(tableLocator, col) {
    logger.debug(`Getting column data for col=${col}`);
    await waitActions.waitForVisible(tableLocator);
    const rows = tableLocator.locator("tbody tr");
    const rowCount = await rows.count();
    const data = [];
    for (let i = 0; i < rowCount; i++) {
      data.push(await rows.nth(i).locator("td").nth(col).textContent());
    }
    logger.debug(`Column data: ${JSON.stringify(data)}`);
    return data;
  }

  /**
   * Get all header labels from the table.
   * @param {import('@playwright/test').Locator} tableLocator
   * @returns {Promise<string[]>}
   */
  async getHeaders(tableLocator) {
    logger.debug("Getting table headers");
    await waitActions.waitForVisible(tableLocator);
    const headers = tableLocator.locator("thead th");
    const count = await headers.count();
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push(await headers.nth(i).textContent());
    }
    logger.debug(`Headers: ${JSON.stringify(data)}`);
    return data;
  }

  /**
   * Click a cell in the table.
   * @param {import('@playwright/test').Locator} tableLocator
   * @param {number} row
   * @param {number} col
   */
  async clickCell(tableLocator, row, col) {
    logger.info(`Clicking cell at row=${row}, col=${col}`);
    await waitActions.waitForVisible(tableLocator);
    const cell = tableLocator.locator("tbody tr").nth(row).locator("td").nth(col);
    await cell.click();
    logger.info("Cell click completed");
  }

  /**
   * Search the table for a row containing the given text and return its index.
   * @param {import('@playwright/test').Locator} tableLocator
   * @param {string} searchText
   * @returns {Promise<number>} Row index or -1 if not found
   */
  async findRowByText(tableLocator, searchText) {
    logger.info(`Searching table for text: ${searchText}`);
    await waitActions.waitForVisible(tableLocator);
    const rows = tableLocator.locator("tbody tr");
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
      const text = await rows.nth(i).textContent();
      if (text && text.includes(searchText)) {
        logger.info(`Found "${searchText}" in row ${i}`);
        return i;
      }
    }
    logger.warn(`Text "${searchText}" not found in table`);
    return -1;
  }
}

export default new TableActions();
