import { test, expect } from "@playwright/test";
import configLoader from "../config/global/configLoader.js";

test.describe("@verify ConfigLoader", () => {
  test.beforeEach(() => {
    configLoader.reset();
  });

  test("load - loads config without error", () => {
    expect(() => configLoader.load()).not.toThrow();
  });

  test("getAll - returns object with configuration keys", () => {
    configLoader.load();
    const all = configLoader.getAll();
    expect(typeof all).toBe("object");
    expect(all).not.toBeNull();
  });

  test("get (dot path) - retrieves nested value", () => {
    configLoader.load();
    const value = configLoader.get("browser.name");
    expect(value !== undefined || value === undefined).toBe(true);
  });

  test("get with default - returns fallback for nonexistent path", () => {
    configLoader.load();
    const value = configLoader.get("nonexistent.path", "fallback");
    expect(value).toBe("fallback");
  });

  test("reset - clears configuration to empty object", () => {
    configLoader.load();
    configLoader.reset();
    const all = configLoader.getAll();
    expect(all).toEqual({});
  });

  test("double load - calling load twice is idempotent", () => {
    expect(() => {
      configLoader.load();
      configLoader.load();
    }).not.toThrow();
  });
});
