import { test, expect } from "../core/fixtures/baseFixture.js";
import mouseActions from "../core/wrappers/mouseActions.js";

const HTML = `
<div id="click-area" style="width:200px;height:200px;background:#eee;"
     onclick="document.getElementById('coords').innerText=event.clientX+','+event.clientY">
</div>
<div id="coords"></div>
<div id="dbl-area" style="width:200px;height:200px;background:#ccc;"
     ondblclick="document.getElementById('dbl-result').innerText='double'">
</div>
<div id="dbl-result"></div>
<div id="ctx-menu" style="width:200px;height:50px;background:#aaa;"
     oncontextmenu="event.preventDefault();document.getElementById('ctx-result').innerText='context'">Right click me</div>
<div id="ctx-result"></div>
<div id="hover-box" onmouseenter="this.dataset.entered='true'" style="width:100px;height:100px;background:#ddd;">Hover</div>
<div id="move-tracker" style="width:200px;height:200px;background:#f0f0f0;"
     onmousemove="this.dataset.moved='true'"></div>
<div style="height:3000px;"></div>
`;

test.describe("MouseActions @verify", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML);
  });

  test("click - clicks at specific page coordinates", async ({ page }) => {
    const box = await page.locator("#click-area").boundingBox();
    const x = box.x + 50;
    const y = box.y + 50;
    await mouseActions.click(page, x, y);
    const coords = await page.locator("#coords").innerText();
    expect(coords).toBeTruthy();
    const [cx, cy] = coords.split(",").map(Number);
    expect(cx).toBeGreaterThan(0);
    expect(cy).toBeGreaterThan(0);
  });

  test("doubleClick - double clicks at specific coordinates", async ({ page }) => {
    const box = await page.locator("#dbl-area").boundingBox();
    await mouseActions.doubleClick(page, box.x + 50, box.y + 50);
    await expect(page.locator("#dbl-result")).toHaveText("double");
  });

  test("rightClick - triggers contextmenu event on locator", async ({ page }) => {
    await mouseActions.rightClick(page.locator("#ctx-menu"));
    await expect(page.locator("#ctx-result")).toHaveText("context");
  });

  test("hover - triggers mouseenter on locator", async ({ page }) => {
    await mouseActions.hover(page.locator("#hover-box"));
    const entered = await page.locator("#hover-box").getAttribute("data-entered");
    expect(entered).toBe("true");
  });

  test("move - moves mouse to specific coordinates", async ({ page }) => {
    await mouseActions.move(page, 100, 100);
  });

  test("wheel - scrolls the page via mouse wheel", async ({ page }) => {
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await mouseActions.wheel(page, 0, 300);
    await page.waitForTimeout(200);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeGreaterThan(scrollBefore);
  });
});
