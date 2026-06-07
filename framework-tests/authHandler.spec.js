import { test, expect } from "@playwright/test";
import authHandler from "../core/api/authHandler.js";

test.describe("AuthHandler @verify", () => {
  test.beforeEach(async () => {
    authHandler.clearAuth();
  });

  test("setBearerToken + getAuthHeaders - sets Authorization Bearer header", async () => {
    authHandler.setBearerToken("my-jwt-token-123");
    const headers = authHandler.getAuthHeaders();

    expect(headers.Authorization).toBe("Bearer my-jwt-token-123");
  });

  test("setBasicAuth + getAuthHeaders - sets base64-encoded Basic header", async () => {
    authHandler.setBasicAuth("admin", "secret");
    const headers = authHandler.getAuthHeaders();

    expect(headers.Authorization).toContain("Basic ");
    const encoded = headers.Authorization.replace("Basic ", "");
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    expect(decoded).toBe("admin:secret");
  });

  test("setApiKey + getAuthHeaders - sets custom API key header", async () => {
    authHandler.setApiKey("api-key-xyz-789");
    const headers = authHandler.getAuthHeaders();
    expect(headers["x-api-key"]).toBe("api-key-xyz-789");
  });

  test("setApiKey - supports custom header name", async () => {
    authHandler.setApiKey("key-123", "X-Custom-Auth");
    const headers = authHandler.getAuthHeaders();
    expect(headers["X-Custom-Auth"]).toBe("key-123");
  });

  test("clearAuth - removes all auth headers", async () => {
    authHandler.setBearerToken("token-to-clear");
    let headers = authHandler.getAuthHeaders();
    expect(headers.Authorization).toBeDefined();

    authHandler.clearAuth();
    headers = authHandler.getAuthHeaders();
    expect(Object.keys(headers).length).toBe(0);
  });

  test("getAuthHeaders - returns a copy, not a reference", async () => {
    authHandler.setBearerToken("token-copy-test");
    const headers1 = authHandler.getAuthHeaders();
    const headers2 = authHandler.getAuthHeaders();

    expect(headers1).toEqual(headers2);
    headers1.Authorization = "tampered";
    const headers3 = authHandler.getAuthHeaders();
    expect(headers3.Authorization).toBe("Bearer token-copy-test");
  });

  test("wrapRequest - passes auth headers to the request function", async () => {
    authHandler.setBearerToken("wrap-test-token");

    let receivedOptions = null;
    const mockRequestFn = async (opts) => {
      receivedOptions = opts;
      return { status: 200, body: {}, headers: {}, responseTime: 10 };
    };

    const result = await authHandler.wrapRequest(mockRequestFn);

    expect(result.status).toBe(200);
    expect(receivedOptions).toBeDefined();
    expect(receivedOptions.headers.Authorization).toBe(
      "Bearer wrap-test-token"
    );
  });

  test("wrapRequest - merges extra options with auth headers", async () => {
    authHandler.setBearerToken("merge-token");

    let receivedOptions = null;
    const mockRequestFn = async (opts) => {
      receivedOptions = opts;
      return { status: 200, body: {}, headers: {}, responseTime: 5 };
    };

    await authHandler.wrapRequest(mockRequestFn, {
      headers: { "X-Custom": "value" },
      timeout: 5000,
    });

    expect(receivedOptions.headers.Authorization).toBe("Bearer merge-token");
    expect(receivedOptions.headers["X-Custom"]).toBe("value");
    expect(receivedOptions.timeout).toBe(5000);
  });

  test("wrapRequest - retries with refreshed token on 401", async () => {
    authHandler.setBearerToken("expired-token");
    authHandler.refreshToken(async () => "refreshed-token");

    let callCount = 0;
    const mockRequestFn = async (opts) => {
      callCount++;
      if (callCount === 1) {
        return { status: 401, body: {}, headers: {}, responseTime: 5 };
      }
      return { status: 200, body: { ok: true }, headers: {}, responseTime: 5 };
    };

    const result = await authHandler.wrapRequest(mockRequestFn);

    expect(callCount).toBe(2);
    expect(result.status).toBe(200);
    const headers = authHandler.getAuthHeaders();
    expect(headers.Authorization).toBe("Bearer refreshed-token");
  });
});
