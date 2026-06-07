import { test, expect } from "../core/fixtures/baseFixture.js";
import waitActions from "../core/wrappers/waitActions.js";
import { createServer } from "node:http";

test.describe("WaitActions @verify", () => {
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
  test("waitForVisible - resolves when hidden element becomes visible", async ({ page }) => {
    await page.setContent(`<div id="target" style="display:none">Hello</div>`);
    await page.evaluate(() => {
      setTimeout(() => {
        document.getElementById("target").style.display = "block";
      }, 500);
    });
    const locator = page.locator("#target");
    await waitActions.waitForVisible(locator, 5000);
    await expect(locator).toBeVisible();
  });

  test("waitForHidden - resolves when visible element becomes hidden", async ({ page }) => {
    await page.setContent(`<div id="target">Visible</div>`);
    await page.evaluate(() => {
      setTimeout(() => {
        document.getElementById("target").style.display = "none";
      }, 500);
    });
    const locator = page.locator("#target");
    await waitActions.waitForHidden(locator, 5000);
    await expect(locator).toBeHidden();
  });

  test("waitForEnabled - resolves when disabled button becomes enabled", async ({ page }) => {
    await page.setContent(`<button id="btn" disabled>Click</button>`);
    await page.evaluate(() => {
      setTimeout(() => {
        document.getElementById("btn").removeAttribute("disabled");
      }, 500);
    });
    const locator = page.locator("#btn");
    await waitActions.waitForEnabled(locator, 5000);
    await expect(locator).toBeEnabled();
  });

  test("waitForDisabled - resolves when enabled button becomes disabled", async ({ page }) => {
    await page.setContent(`<button id="btn">Click</button>`);
    await page.evaluate(() => {
      setTimeout(() => {
        document.getElementById("btn").setAttribute("disabled", "true");
      }, 500);
    });
    const locator = page.locator("#btn");
    await waitActions.waitForDisabled(locator, 5000);
    await expect(locator).toBeDisabled();
  });

  test("waitForPageLoad - resolves for load state", async ({ page }) => {
    await page.goto("about:blank");
    await waitActions.waitForPageLoad(page, "load");
  });

  test("waitForNetworkIdle - resolves on about:blank", async ({ page }) => {
    await page.goto("about:blank");
    await waitActions.waitForNetworkIdle(page, 5000);
  });

  test("waitForURL - resolves when URL matches pattern", async ({ page }) => {
    await page.goto("about:blank");
    await waitActions.waitForURL(page, /blank/, 5000);
    expect(page.url()).toContain("blank");
  });

  test("waitForResponse - resolves when matching response is received", async ({ page }) => {
    await page.goto(baseUrl);
    await page.route("**/test-api", (route) =>
      route.fulfill({ status: 200, body: "ok" })
    );
    const responsePromise = waitActions.waitForResponse(page, /test-api/, 5000);
    await page.evaluate((url) => fetch(url + "/test-api"), baseUrl);
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("waitForSelector - resolves when selector is present", async ({ page }) => {
    await page.setContent(`<div id="exists">Present</div>`);
    await waitActions.waitForSelector(page, "#exists");
    const el = page.locator("#exists");
    await expect(el).toBeVisible();
  });

  test("waitForTimeout - explicit wait completes", async ({ page }) => {
    const start = Date.now();
    await waitActions.waitForTimeout(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
  });

  test("waitForVisible - throws on timeout for hidden element", async ({ page }) => {
    await page.setContent(`<div id="hidden" style="display:none">Hidden</div>`);
    const locator = page.locator("#hidden");
    await expect(
      waitActions.waitForVisible(locator, 500)
    ).rejects.toThrow();
  });
});
