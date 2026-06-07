import { test, expect } from "../core/fixtures/baseFixture.js";
import keyboardActions from "../core/wrappers/keyboardActions.js";

const HTML = `
<div>
  <input id="input" type="text" />
  <textarea id="textarea"></textarea>
</div>
`;

test.describe("KeyboardActions @verify", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML);
  });

  test("press - presses a single key into focused input", async ({ page }) => {
    await page.locator("#input").focus();
    await keyboardActions.press(page, "a");
    await expect(page.locator("#input")).toHaveValue("a");
  });

  test("type - types full text via keyboard", async ({ page }) => {
    await page.locator("#input").focus();
    await keyboardActions.type(page, "hello");
    await expect(page.locator("#input")).toHaveValue("hello");
  });

  test("shortcut - executes Control+a to select all then deletes", async ({ page }) => {
    const input = page.locator("#input");
    await input.fill("some text");
    await input.focus();
    await keyboardActions.shortcut(page, "Control", "a");
    await keyboardActions.press(page, "Backspace");
    await expect(input).toHaveValue("");
  });

  test("selectAll - selects all content in input", async ({ page }) => {
    const input = page.locator("#input");
    await input.fill("replace me");
    await input.focus();
    await keyboardActions.selectAll(page);
    await keyboardActions.type(page, "new");
    await expect(input).toHaveValue("new");
  });

  test("copy and paste - copies from input and pastes into textarea", async ({ page }) => {
    const input = page.locator("#input");
    const textarea = page.locator("#textarea");

    await input.fill("copy this");
    await input.focus();
    await keyboardActions.selectAll(page);
    await keyboardActions.copy(page);
    await textarea.focus();
    await keyboardActions.paste(page);
    await expect(textarea).toHaveValue("copy this");
  });

  test("undo - reverts last typed text", async ({ page }) => {
    const input = page.locator("#input");
    await input.focus();
    await keyboardActions.type(page, "hello");
    await keyboardActions.undo(page);
    const value = await input.inputValue();
    expect(value.length).toBeLessThan(5);
  });

  test("keyDown and keyUp - holding Shift produces uppercase", async ({ page }) => {
    const input = page.locator("#input");
    await input.focus();
    await keyboardActions.keyDown(page, "Shift");
    await keyboardActions.press(page, "a");
    await keyboardActions.keyUp(page, "Shift");
    await expect(input).toHaveValue("A");
  });
});
