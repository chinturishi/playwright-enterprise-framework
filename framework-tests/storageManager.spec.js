import { test, expect } from "../core/fixtures/baseFixture.js";
import storageManager from "../core/browser/storageManager.js";
import path from "path";
import os from "os";
import fs from "fs-extra";
import { createServer } from "node:http";

test.describe("@verify StorageManager", () => {
  let tempFile;
  let server;
  let baseUrl;

  test.beforeAll(async () => {
    server = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<html><body></body></html>");
    });
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  test.afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test.afterEach(async () => {
    if (tempFile && (await fs.pathExists(tempFile))) {
      await fs.remove(tempFile);
    }
  });

  test("setLocalStorage + getLocalStorage - round-trip value matches", async ({
    page,
  }) => {
    await page.goto(baseUrl);
    await storageManager.setLocalStorage(page, "framework_key", "framework_value");
    const value = await storageManager.getLocalStorage(page, "framework_key");
    expect(value).toBe("framework_value");
  });

  test("setSessionStorage + getSessionStorage - round-trip value matches", async ({
    page,
  }) => {
    await page.goto(baseUrl);
    await storageManager.setSessionStorage(page, "session_key", "session_value");
    const value = await storageManager.getSessionStorage(page, "session_key");
    expect(value).toBe("session_value");
  });

  test("clearStorage - empties both local and session storage", async ({
    page,
  }) => {
    await page.goto(baseUrl);
    await storageManager.setLocalStorage(page, "lk", "lv");
    await storageManager.setSessionStorage(page, "sk", "sv");

    await storageManager.clearStorage(page);

    const localVal = await storageManager.getLocalStorage(page, "lk");
    const sessionVal = await storageManager.getSessionStorage(page, "sk");
    expect(localVal).toBeNull();
    expect(sessionVal).toBeNull();
  });

  test("saveStorageState + loadStorageState - persists and restores state structure", async ({
    page,
    context,
  }) => {
    await page.goto(baseUrl);
    tempFile = path.join(os.tmpdir(), `storage-state-${Date.now()}.json`);

    const savedState = await storageManager.saveStorageState(context, tempFile);
    expect(savedState).toHaveProperty("cookies");
    expect(savedState).toHaveProperty("origins");

    const loadedState = await storageManager.loadStorageState(tempFile);
    expect(loadedState).toHaveProperty("cookies");
    expect(loadedState).toHaveProperty("origins");
    expect(Array.isArray(loadedState.cookies)).toBe(true);
    expect(Array.isArray(loadedState.origins)).toBe(true);
  });
});
