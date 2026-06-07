import { test, expect } from "../core/fixtures/baseFixture.js";
import uploadActions from "../core/wrappers/uploadActions.js";
import fs from "fs";
import path from "path";
import os from "os";

const HTML = `
<input id="file-input" type="file" />
<input id="multi-file" type="file" multiple />
<button id="chooser-btn" onclick="document.getElementById('hidden-file').click()">Choose File</button>
<input id="hidden-file" type="file" style="display:none" />
`;

test.describe("UploadActions @verify", () => {
  let tempDir;
  let tempFiles;

  test.beforeEach(async ({ page }) => {
    await page.setContent(HTML);
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pw-upload-"));
    tempFiles = [];
    for (let i = 0; i < 3; i++) {
      const filePath = path.join(tempDir, `test-file-${i}.txt`);
      fs.writeFileSync(filePath, `content of file ${i}`);
      tempFiles.push(filePath);
    }
  });

  test.afterEach(async () => {
    for (const f of tempFiles) {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    }
    if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
  });

  test("uploadFile - uploads a single file via file input", async ({ page }) => {
    const input = page.locator("#file-input");
    await uploadActions.uploadFile(input, tempFiles[0]);
    const files = await input.evaluate((el) => el.files.length);
    expect(files).toBe(1);
  });

  test("uploadFiles - uploads multiple files via file input", async ({ page }) => {
    const input = page.locator("#multi-file");
    await uploadActions.uploadFiles(input, [tempFiles[0], tempFiles[1], tempFiles[2]]);
    const files = await input.evaluate((el) => el.files.length);
    expect(files).toBe(3);
  });

  test("uploadViaChooser - uploads file via file chooser dialog", async ({ page }) => {
    await uploadActions.uploadViaChooser(
      page,
      tempFiles[0],
      () => page.locator("#chooser-btn").click()
    );
    const files = await page.locator("#hidden-file").evaluate((el) => el.files.length);
    expect(files).toBe(1);
  });

  test("removeFile - clears files from input", async ({ page }) => {
    const input = page.locator("#file-input");
    await uploadActions.uploadFile(input, tempFiles[0]);
    let count = await input.evaluate((el) => el.files.length);
    expect(count).toBe(1);

    await uploadActions.removeFile(input);
    count = await input.evaluate((el) => el.files.length);
    expect(count).toBe(0);
  });
});
