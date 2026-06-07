import { test, expect } from "@playwright/test";
import RequestBuilder from "../core/api/requestBuilder.js";

test.describe("RequestBuilder @verify", () => {
  test("create + build - defaults to GET with the given URL", async () => {
    const config = RequestBuilder.create("https://api.example.com/users").build();

    expect(config.method).toBe("GET");
    expect(config.url).toBe("https://api.example.com/users");
    expect(config.headers).toBeDefined();
  });

  test("setMethod - overrides HTTP method", async () => {
    const config = RequestBuilder.create("https://api.example.com/users")
      .setMethod("POST")
      .build();

    expect(config.method).toBe("POST");
  });

  test("setMethod - normalizes method to uppercase", async () => {
    const config = RequestBuilder.create("/test")
      .setMethod("patch")
      .build();

    expect(config.method).toBe("PATCH");
  });

  test("setHeader - adds a single custom header", async () => {
    const config = RequestBuilder.create("/test")
      .setHeader("X-Request-Id", "abc-123")
      .build();

    expect(config.headers["X-Request-Id"]).toBe("abc-123");
  });

  test("setHeaders - merges multiple headers at once", async () => {
    const config = RequestBuilder.create("/test")
      .setHeaders({
        "X-Tenant": "acme",
        "X-Trace-Id": "trace-456",
        Accept: "application/json",
      })
      .build();

    expect(config.headers["X-Tenant"]).toBe("acme");
    expect(config.headers["X-Trace-Id"]).toBe("trace-456");
    expect(config.headers["Accept"]).toBe("application/json");
  });

  test("setBearerToken - sets Authorization header with Bearer prefix", async () => {
    const config = RequestBuilder.create("/test")
      .setBearerToken("jwt-token-xyz")
      .build();

    expect(config.headers["Authorization"]).toBe("Bearer jwt-token-xyz");
  });

  test("setBody - sets data field and auto-sets Content-Type for objects", async () => {
    const body = { name: "test", count: 5 };
    const config = RequestBuilder.create("/test")
      .setMethod("POST")
      .setBody(body)
      .build();

    expect(config.data).toEqual(body);
    expect(config.headers["Content-Type"]).toBeDefined();
  });

  test("setBody - does not override existing Content-Type", async () => {
    const config = RequestBuilder.create("/test")
      .setHeader("Content-Type", "text/xml")
      .setBody({ data: 1 })
      .build();

    expect(config.headers["Content-Type"]).toBe("text/xml");
  });

  test("setParam - adds a single query parameter to the URL", async () => {
    const config = RequestBuilder.create("https://api.example.com/search")
      .setParam("q", "playwright")
      .build();

    expect(config.url).toContain("?");
    expect(config.url).toContain("q=playwright");
  });

  test("setParams - adds multiple query parameters", async () => {
    const config = RequestBuilder.create("https://api.example.com/search")
      .setParams({ q: "test", page: 2, limit: 10 })
      .build();

    expect(config.url).toContain("q=test");
    expect(config.url).toContain("page=2");
    expect(config.url).toContain("limit=10");
  });

  test("setTimeout - sets timeout in the build output", async () => {
    const config = RequestBuilder.create("/test")
      .setTimeout(5000)
      .build();

    expect(config.timeout).toBe(5000);
  });

  test("build - omits timeout when not set", async () => {
    const config = RequestBuilder.create("/test").build();
    expect(config).not.toHaveProperty("timeout");
  });

  test("build - omits data when no body is set", async () => {
    const config = RequestBuilder.create("/test").build();
    expect(config).not.toHaveProperty("data");
  });

  test("chaining - all setters can be chained into a single build", async () => {
    const config = RequestBuilder.create("https://api.example.com/orders")
      .setMethod("POST")
      .setHeader("X-Request-Id", "req-001")
      .setHeaders({ Accept: "application/json" })
      .setBearerToken("chain-token")
      .setBody({ item: "widget", qty: 3 })
      .setParam("dryRun", "true")
      .setParams({ region: "us-east" })
      .setTimeout(10000)
      .build();

    expect(config.method).toBe("POST");
    expect(config.url).toContain("https://api.example.com/orders");
    expect(config.url).toContain("dryRun=true");
    expect(config.url).toContain("region=us-east");
    expect(config.headers["X-Request-Id"]).toBe("req-001");
    expect(config.headers["Accept"]).toBe("application/json");
    expect(config.headers["Authorization"]).toBe("Bearer chain-token");
    expect(config.data).toEqual({ item: "widget", qty: 3 });
    expect(config.timeout).toBe(10000);
  });
});
