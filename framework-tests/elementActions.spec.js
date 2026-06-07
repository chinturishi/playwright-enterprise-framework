import { test, expect } from "../core/fixtures/baseFixture.js";
import elementActions from "../core/wrappers/elementActions.js";

const APP_HTML = `
<div id="app">
  <h1 id="title">Test Page</h1>
  <input id="text-input" type="text" value="initial" placeholder="Enter text" />
  <input id="email-input" type="email" data-testid="email" />
  <textarea id="textarea">Some text</textarea>
  <button id="btn" onclick="document.getElementById('result').innerText='clicked'">Click Me</button>
  <button id="dbl-btn" ondblclick="document.getElementById('result').innerText='double-clicked'">Double Click</button>
  <div id="result"></div>
  <input id="checkbox" type="checkbox" />
  <input id="checked-box" type="checkbox" checked />
  <select id="dropdown">
    <option value="a">Option A</option>
    <option value="b">Option B</option>
    <option value="c">Option C</option>
  </select>
  <div id="hover-target" onmouseenter="this.dataset.hovered='true'">Hover me</div>
  <a href="#" id="link" data-info="test-attr">A Link</a>
  <button id="disabled-btn" disabled>Disabled</button>
  <div id="scroll-target" style="margin-top: 2000px;">Far down</div>
  <span class="multi">Item 1</span>
  <span class="multi">Item 2</span>
  <span class="multi">Item 3</span>
</div>
`;

test.config

test.describe("ElementActions @verify", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(APP_HTML);
    
  });

  test("click - clicks button and triggers handler", async ({ page }) => {
    await elementActions.click(page.locator("#btn"));
    await expect(page.locator("#result")).toHaveText("clicked");
     await page.pause();
  });

  test("doubleClick - double clicks button and triggers handler", async ({ page }) => {
    await elementActions.doubleClick(page.locator("#dbl-btn"));
    await expect(page.locator("#result")).toHaveText("double-clicked");
  });

  test("fill - fills input with text", async ({ page }) => {
    const input = page.locator("#text-input");
    await elementActions.fill(input, "hello");
    await expect(input).toHaveValue("hello");
  });

  test("type - types text character by character", async ({ page }) => {
    const input = page.locator("#email-input");
    await elementActions.type(input, "test@example.com");
    await expect(input).toHaveValue("test@example.com");
  });

  test("clear - clears input field", async ({ page }) => {
    const input = page.locator("#text-input");
    await elementActions.fill(input, "some value");
    await elementActions.clear(input);
    await expect(input).toHaveValue("");
  });

  test("getText - returns textContent of element", async ({ page }) => {
    const text = await elementActions.getText(page.locator("#title"));
    expect(text).toBe("Test Page");
  });

  test("getInnerText - returns innerText of element", async ({ page }) => {
    const text = await elementActions.getInnerText(page.locator("#title"));
    expect(text).toBe("Test Page");
  });

  test("getInputValue - returns current input value", async ({ page }) => {
    const value = await elementActions.getInputValue(page.locator("#text-input"));
    expect(value).toBe("initial");
  });

  test("getAttribute - returns attribute value", async ({ page }) => {
    const value = await elementActions.getAttribute(page.locator("#link"), "data-info");
    expect(value).toBe("test-attr");
  });

  test("isVisible - returns true for visible, false for non-existent", async ({ page }) => {
    const visible = await elementActions.isVisible(page.locator("#title"));
    expect(visible).toBe(true);

    const notVisible = await elementActions.isVisible(page.locator("#does-not-exist"));
    expect(notVisible).toBe(false);
  });

  test("isEnabled - returns true for enabled, false for disabled", async ({ page }) => {
    const enabled = await elementActions.isEnabled(page.locator("#btn"));
    expect(enabled).toBe(true);

    const disabled = await elementActions.isEnabled(page.locator("#disabled-btn"));
    expect(disabled).toBe(false);
  });

  test("isChecked - returns correct checked state", async ({ page }) => {
    const checked = await elementActions.isChecked(page.locator("#checked-box"));
    expect(checked).toBe(true);

    const unchecked = await elementActions.isChecked(page.locator("#checkbox"));
    expect(unchecked).toBe(false);
  });

  test("check - checks an unchecked checkbox", async ({ page }) => {
    const checkbox = page.locator("#checkbox");
    await elementActions.check(checkbox);
    await expect(checkbox).toBeChecked();
  });

  test("uncheck - unchecks a checked checkbox", async ({ page }) => {
    const checkbox = page.locator("#checked-box");
    await elementActions.uncheck(checkbox);
    await expect(checkbox).not.toBeChecked();
  });

  test("selectOption - selects option from dropdown", async ({ page }) => {
    const dropdown = page.locator("#dropdown");
    await elementActions.selectOption(dropdown, "b");
    await expect(dropdown).toHaveValue("b");
  });

  test("hover - triggers mouseenter event on element", async ({ page }) => {
    const target = page.locator("#hover-target");
    await elementActions.hover(target);
    const hovered = await target.getAttribute("data-hovered");
    expect(hovered).toBe("true");
  });

  test("focus - focuses an element", async ({ page }) => {
    const input = page.locator("#text-input");
    await elementActions.focus(input);
    const focusedId = await page.evaluate(() => document.activeElement.id);
    expect(focusedId).toBe("text-input");
  });

  test("scrollIntoView - scrolls element into viewport", async ({ page }) => {
    const target = page.locator("#scroll-target");
    await elementActions.scrollIntoView(target);
    const isInViewport = await target.isVisible();
    expect(isInViewport).toBe(true);
  });

  test("count - returns number of matching elements", async ({ page }) => {
    const count = await elementActions.count(page.locator(".multi"));
    expect(count).toBe(3);
  });
});
