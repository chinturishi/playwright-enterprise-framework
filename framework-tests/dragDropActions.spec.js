import { test, expect } from "../core/fixtures/baseFixture.js";
import dragDropActions from "../core/wrappers/dragDropActions.js";

const HTML = `
<div id="source" draggable="true" style="width:50px;height:50px;background:red;">Drag</div>
<div id="target" style="width:100px;height:100px;background:blue;margin-top:20px;"
     ondragover="event.preventDefault()"
     ondrop="this.innerText='dropped';event.preventDefault()">Drop here</div>
<div id="drag-track" draggable="true" style="width:50px;height:50px;background:green;margin-top:20px;"
     ondragstart="this.dataset.started='true'">Drag me</div>
`;

test.describe("DragDropActions @verify", () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML);
  });

  test("dragAndDrop - drags source element to target element", async ({ page }) => {
    const source = page.locator("#source");
    const target = page.locator("#target");
    await dragDropActions.dragAndDrop(source, target);
    await expect(target).toHaveText("dropped");
  });

  test("dragTo - drags element to specific coordinates", async ({ page }) => {
    const source = page.locator("#drag-track");
    const targetBox = await page.locator("#target").boundingBox();
    await dragDropActions.dragTo(source, {
      x: targetBox.x + targetBox.width / 2,
      y: targetBox.y + targetBox.height / 2,
    });
    const started = await source.getAttribute("data-started");
    expect(started).toBe("true");
  });
});
