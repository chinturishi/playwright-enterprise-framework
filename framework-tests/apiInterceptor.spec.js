import { test, expect } from "../core/fixtures/baseFixture.js";
import apiInterceptor from "../core/api/apiInterceptor.js";
import http from "http";

let server;
let baseURL;
const receivedRequests = [];

test.describe("ApiInterceptor @verify", () => {
  test.beforeAll(async () => {
    server = http.createServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        receivedRequests.push({
          method: req.method,
          url: req.url,
          body,
          headers: req.headers,
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            method: req.method,
            path: req.url,
            requestBody: body || null,
          })
        );
      });
    });
    await new Promise((resolve) => server.listen(0, resolve));
    baseURL = `http://localhost:${server.address().port}`;
  });

  test.afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test.describe("API client operations", () => {
    test.describe.configure({ mode: "serial" });

    test("createClient - creates and returns API context", async () => {
      const client = await apiInterceptor.createClient(baseURL);
      expect(client).toBeDefined();
      expect(typeof client.get).toBe("function");
      expect(typeof client.post).toBe("function");
    });

    test("get - sends GET and receives JSON response", async () => {
      const res = await apiInterceptor.get("/data");
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(true);
      expect(res.body.method).toBe("GET");
      expect(res.body.path).toBe("/data");
      expect(typeof res.responseTime).toBe("number");
    });

    test("post - sends POST with request body", async () => {
      receivedRequests.length = 0;
      const payload = { name: "test-item", value: 42 };
      const res = await apiInterceptor.post("/items", payload);
      expect(res.status).toBe(200);
      expect(res.body.method).toBe("POST");
      const serverReq = receivedRequests.find((r) => r.method === "POST");
      expect(serverReq).toBeDefined();
      const sentBody = JSON.parse(serverReq.body);
      expect(sentBody.name).toBe("test-item");
      expect(sentBody.value).toBe(42);
    });

    test("put - sends PUT with request body", async () => {
      receivedRequests.length = 0;
      const payload = { updated: true, name: "updated-item" };
      const res = await apiInterceptor.put("/items/1", payload);
      expect(res.status).toBe(200);
      expect(res.body.method).toBe("PUT");
      expect(res.body.path).toBe("/items/1");
      const serverReq = receivedRequests.find((r) => r.method === "PUT");
      expect(serverReq).toBeDefined();
      const sentBody = JSON.parse(serverReq.body);
      expect(sentBody.updated).toBe(true);
    });

    test("delete - sends DELETE request", async () => {
      const res = await apiInterceptor.delete("/items/1");
      expect(res.status).toBe(200);
      expect(res.body.method).toBe("DELETE");
      expect(res.body.path).toBe("/items/1");
    });
  });

  test.describe("Page-level interception", () => {
    test("mockResponse - intercepts URL and serves mocked response", async ({
      page,
    }) => {
      const mockData = { mocked: true, items: [1, 2, 3] };
      await apiInterceptor.mockResponse(page, "**/api/mock-data", {
        status: 200,
        body: mockData,
      });

      await page.goto("about:blank");
      const response = await page.evaluate(async () => {
        const res = await fetch("https://example.com/api/mock-data");
        return { status: res.status, body: await res.json() };
      });

      expect(response.status).toBe(200);
      expect(response.body.mocked).toBe(true);
      expect(response.body.items).toEqual([1, 2, 3]);
    });

    test("interceptRoute - sets up interception with custom handler", async ({
      page,
    }) => {
      let intercepted = false;
      await apiInterceptor.interceptRoute(
        page,
        "**/api/intercept-test",
        (route) => {
          intercepted = true;
          route.fulfill({
            status: 204,
            contentType: "text/plain",
            body: "",
          });
        }
      );

      await page.goto("about:blank");
      await page.evaluate(async () => {
        await fetch("https://example.com/api/intercept-test");
      });

      expect(intercepted).toBe(true);
    });

    test("recordRequests - records requests matching a URL pattern", async ({
      page,
    }) => {
      const recorded = apiInterceptor.recordRequests(page, "/api/tracked");

      await page.route("**/api/tracked**", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/plain",
          body: "ok",
        })
      );

      await page.goto("about:blank");
      await page.evaluate(async () => {
        await fetch("https://example.com/api/tracked?q=first");
        await fetch("https://example.com/api/tracked?q=second");
      });

      expect(recorded.length).toBe(2);
      expect(recorded[0].method).toBe("GET");
      expect(recorded[0].url).toContain("/api/tracked");
      expect(recorded[1].url).toContain("/api/tracked");
    });
  });
});
