/**
 * Sample Page Object demonstrating the recommended pattern for consuming-app
 * page classes that leverage the framework's BasePage abstraction.
 *
 * Key conventions:
 *   - Extend `BasePage` — all action methods (click, fill, hover, …) are
 *     inherited and accept locator **names** (string keys) instead of raw
 *     Playwright locators.
 *   - Define a `locators` map of plain descriptor objects. The framework
 *     resolves them automatically — no Playwright imports needed.
 *   - Public methods represent *user-level actions* (navigate, fill form,
 *     submit) rather than low-level Playwright calls.
 */
import { BasePage } from "../../core/pages/BasePage.js";

export class SamplePage extends BasePage {
  /**
   * Locator descriptors — plain objects resolved by the framework.
   * Supported shapes: { role, options }, { testId }, { text }, { label },
   * { placeholder }, { css }, { xpath }.
   */
  locators = {
    nameInput: { role: "textbox", options: { name: "Name" } },
    emailInput: { role: "textbox", options: { name: "Email" } },
    messageTextarea: { role: "textbox", options: { name: "Message" } },
    categorySelect: { role: "combobox", options: { name: "Category" } },
    agreeCheckbox: { role: "checkbox", options: { name: /terms/i } },
    submitButton: { role: "button", options: { name: "Submit" } },
    resetButton: { role: "button", options: { name: "Reset" } },
    successBanner: { testId: "success-banner" },
    errorBanner: { testId: "error-banner" },
    resultMessage: { testId: "result-message" },
    searchInput: { testId: "search-input" },
  };

  /**
   * Navigate to the application URL.
   * @param {string} [url='https://example.com']
   */
  async navigateTo(url = "https://example.com") {
    await this.navigate(url);
  }

  /**
   * Fill the form with the provided data.
   * @param {{ name: string, email: string, message: string, category?: string }} data
   */
  async fillForm(data) {
    await this.fill("nameInput", data.name);
    await this.fill("emailInput", data.email);
    await this.fill("messageTextarea", data.message);

    if (data.category) {
      await this.selectOption("categorySelect", data.category);
    }
  }

  /**
   * Accept terms and submit the form.
   */
  async submit() {
    await this.check("agreeCheckbox");
    await this.click("submitButton");
  }

  /**
   * Reset the form to its default state.
   */
  async resetForm() {
    await this.click("resetButton");
  }

  /**
   * Read the result message displayed after submission.
   * @returns {Promise<string | null>}
   */
  async getResultMessage() {
    return this.getText("resultMessage");
  }

  /**
   * Check whether the success banner is visible.
   * @returns {Promise<boolean>}
   */
  async isSuccessVisible() {
    return this.isVisible("successBanner");
  }

  /**
   * Check whether the error banner is visible.
   * @returns {Promise<boolean>}
   */
  async isErrorVisible() {
    return this.isVisible("errorBanner");
  }

  /**
   * Use the header search field.
   * @param {string} query
   */
  async search(query) {
    await this.fill("searchInput", query);
    await this.pressKey("Enter");
  }
}
