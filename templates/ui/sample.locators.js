/**
 * Sample locators demonstrating the recommended locator strategy hierarchy.
 *
 * Priority order:
 *   1. Role selectors  — getByRole()    — most resilient, matches accessible roles
 *   2. Test ID          — getByTestId()  — stable contracts between dev and QA
 *   3. Text / label     — getByText()    — user-visible, good for buttons & links
 *   4. CSS selectors    — locator()      — last resort when the above are unavailable
 *
 * Each group is a plain object whose values are **selector descriptions** that
 * a Page Object passes to the appropriate Playwright locator API.
 */

/** Locators for the page header / navigation area. */
export const headerLocators = {
  logo: { role: "img", options: { name: "Logo" } },
  navMenu: { role: "navigation" },
  searchInput: { testId: "search-input" },
  profileButton: { role: "button", options: { name: "Profile" } },
};

/** Locators for a generic form (e.g. contact, registration). */
export const formLocators = {
  nameInput: { role: "textbox", options: { name: "Name" } },
  emailInput: { role: "textbox", options: { name: "Email" } },
  messageTextarea: { role: "textbox", options: { name: "Message" } },
  categorySelect: { role: "combobox", options: { name: "Category" } },
  agreeCheckbox: { role: "checkbox", options: { name: /terms/i } },
  submitButton: { role: "button", options: { name: "Submit" } },
  resetButton: { role: "button", options: { name: "Reset" } },
};

/** Locators for a results / confirmation area. */
export const resultLocators = {
  successBanner: { testId: "success-banner" },
  errorBanner: { testId: "error-banner" },
  resultHeading: { role: "heading", options: { name: /result/i } },
  resultMessage: { testId: "result-message" },
};

/** Locators for a data table component. */
export const tableLocators = {
  table: { role: "table" },
  headerRow: { testId: "table-header" },
  rows: { role: "row" },
  pagination: { testId: "pagination" },
  nextPageButton: { role: "button", options: { name: "Next" } },
  prevPageButton: { role: "button", options: { name: "Previous" } },
};
