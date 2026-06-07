import { test, expect } from "../core/fixtures/baseFixture.js";
import tableActions from "../core/wrappers/tableActions.js";

const HTML = `
<table id="test-table">
  <thead><tr><th>Name</th><th>Age</th><th>City</th></tr></thead>
  <tbody>
    <tr><td>Alice</td><td>30</td><td>NYC</td></tr>
    <tr><td>Bob</td><td>25</td><td>LA</td></tr>
    <tr><td>Charlie</td><td>35</td><td>Chicago</td></tr>
  </tbody>
</table>
`;

test.describe("TableActions @verify", () => {
  let table;

  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML);
    table = page.locator("#test-table");
  });

  test("getRowCount - returns number of body rows", async () => {
    const count = await tableActions.getRowCount(table);
    expect(count).toBe(3);
  });

  test("getColumnCount - returns number of header columns", async () => {
    const count = await tableActions.getColumnCount(table);
    expect(count).toBe(3);
  });

  test("getCellText - returns text for specific cell", async () => {
    const cell00 = await tableActions.getCellText(table, 0, 0);
    expect(cell00).toBe("Alice");

    const cell12 = await tableActions.getCellText(table, 1, 2);
    expect(cell12).toBe("LA");
  });

  test("getRowData - returns all cell values in a row", async () => {
    const data = await tableActions.getRowData(table, 0);
    expect(data).toEqual(["Alice", "30", "NYC"]);
  });

  test("getColumnData - returns all values in a column", async () => {
    const data = await tableActions.getColumnData(table, 1);
    expect(data).toEqual(["30", "25", "35"]);
  });

  test("getHeaders - returns header labels", async () => {
    const headers = await tableActions.getHeaders(table);
    expect(headers).toEqual(["Name", "Age", "City"]);
  });

  test("clickCell - clicks a specific cell without error", async () => {
    await tableActions.clickCell(table, 0, 0);
  });

  test("findRowByText - returns row index for matching text", async () => {
    const idx = await tableActions.findRowByText(table, "Bob");
    expect(idx).toBe(1);
  });

  test("findRowByText - returns -1 for non-matching text", async () => {
    const idx = await tableActions.findRowByText(table, "xyz");
    expect(idx).toBe(-1);
  });
});
