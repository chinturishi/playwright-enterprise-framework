import { test, expect } from "@playwright/test";
import stringUtils from "../core/utils/stringUtils.js";
import jsonUtils from "../core/utils/jsonUtils.js";
import dateUtils from "../core/utils/dateUtils.js";
import randomUtils from "../core/utils/randomUtils.js";
import retryUtils from "../core/utils/retryUtils.js";

test.describe("StringUtils @verify", () => {
  test("capitalize - capitalizes first character", async () => {
    expect(stringUtils.capitalize("hello")).toBe("Hello");
  });

  test("capitalize - handles empty string", async () => {
    expect(stringUtils.capitalize("")).toBe("");
  });

  test("camelCase - converts hyphenated string", async () => {
    expect(stringUtils.camelCase("hello-world")).toBe("helloWorld");
  });

  test("camelCase - converts space-separated string", async () => {
    expect(stringUtils.camelCase("hello world")).toBe("helloWorld");
  });

  test("kebabCase - converts camelCase to kebab-case", async () => {
    expect(stringUtils.kebabCase("helloWorld")).toBe("hello-world");
  });

  test("snakeCase - converts camelCase to snake_case", async () => {
    expect(stringUtils.snakeCase("helloWorld")).toBe("hello_world");
  });

  test("truncate - truncates long string with suffix", async () => {
    const result = stringUtils.truncate("This is a very long string", 15);
    expect(result.length).toBeLessThanOrEqual(15);
    expect(result).toContain("...");
  });

  test("truncate - leaves short strings unchanged", async () => {
    expect(stringUtils.truncate("short", 10)).toBe("short");
  });

  test("slugify - converts string to URL-friendly slug", async () => {
    expect(stringUtils.slugify("Hello World!")).toBe("hello-world");
  });

  test("slugify - handles multiple spaces and special chars", async () => {
    expect(stringUtils.slugify("  A B  C  ")).toBe("a-b-c");
  });

  test("mask - masks all but last N characters", async () => {
    const result = stringUtils.mask("secret123", 3);
    expect(result).toContain("123");
    expect(result).toContain("*");
    expect(result.length).toBe(9);
  });

  test("mask - returns original if shorter than visible chars", async () => {
    expect(stringUtils.mask("ab", 4)).toBe("ab");
  });
});

test.describe("JsonUtils @verify", () => {
  test("parse + stringify - round-trips JSON", async () => {
    const original = { key: "value", nested: { num: 42 } };
    const str = jsonUtils.stringify(original);
    const parsed = jsonUtils.parse(str);

    expect(parsed).toEqual(original);
  });

  test("parse - returns undefined for invalid JSON", async () => {
    expect(jsonUtils.parse("not-json{")).toBeUndefined();
  });

  test("stringify - supports pretty printing", async () => {
    const str = jsonUtils.stringify({ a: 1 }, true);
    expect(str).toContain("\n");
  });

  test("deepMerge - merges nested objects with source winning", async () => {
    const target = { a: 1, nested: { x: 10, y: 20 } };
    const source = { b: 2, nested: { y: 99, z: 30 } };
    const result = jsonUtils.deepMerge(target, source);

    expect(result.a).toBe(1);
    expect(result.b).toBe(2);
    expect(result.nested.x).toBe(10);
    expect(result.nested.y).toBe(99);
    expect(result.nested.z).toBe(30);
  });

  test("deepMerge - does not mutate the target", async () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = jsonUtils.deepMerge(target, source);

    expect(target).toEqual({ a: 1 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("getByPath - retrieves nested value by dot path", async () => {
    const obj = { a: { b: { c: "deep" } } };
    expect(jsonUtils.getByPath(obj, "a.b.c")).toBe("deep");
  });

  test("getByPath - returns undefined for missing path", async () => {
    expect(jsonUtils.getByPath({ a: 1 }, "x.y.z")).toBeUndefined();
  });

  test("setByPath - sets nested value by dot path", async () => {
    const obj = {};
    jsonUtils.setByPath(obj, "a.b.c", 42);
    expect(obj.a.b.c).toBe(42);
  });

  test("flatten - flattens nested object to dot-separated keys", async () => {
    const nested = { a: { b: 1, c: { d: 2 } }, e: 3 };
    const flat = jsonUtils.flatten(nested);

    expect(flat["a.b"]).toBe(1);
    expect(flat["a.c.d"]).toBe(2);
    expect(flat["e"]).toBe(3);
  });

  test("unflatten - restores nested structure from flat keys", async () => {
    const flat = { "a.b": 1, "a.c.d": 2, e: 3 };
    const nested = jsonUtils.unflatten(flat);

    expect(nested.a.b).toBe(1);
    expect(nested.a.c.d).toBe(2);
    expect(nested.e).toBe(3);
  });

  test("flatten + unflatten - round-trips nested objects", async () => {
    const original = { x: { y: { z: "value" } }, top: true };
    const roundTripped = jsonUtils.unflatten(jsonUtils.flatten(original));
    expect(roundTripped).toEqual(original);
  });
});

test.describe("DateUtils @verify", () => {
  test("now - returns a Date instance", async () => {
    const result = dateUtils.now();
    expect(result).toBeInstanceOf(Date);
  });

  test("format - formats a date as a string", async () => {
    const date = new Date(2025, 0, 15, 10, 30, 45);
    const result = dateUtils.format(date);

    expect(typeof result).toBe("string");
    expect(result).toContain("2025");
    expect(result).toContain("01");
    expect(result).toContain("15");
  });

  test("format - respects custom patterns", async () => {
    const date = new Date(2025, 5, 3);
    const result = dateUtils.format(date, "YYYY/MM/DD");

    expect(result).toBe("2025/06/03");
  });

  test("elapsed - measures time since a start point", async () => {
    const start = Date.now() - 100;
    const elapsed = dateUtils.elapsed(start);

    expect(typeof elapsed).toBe("number");
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });

  test("elapsed - accepts a Date instance", async () => {
    const start = new Date(Date.now() - 200);
    const elapsed = dateUtils.elapsed(start);
    expect(elapsed).toBeGreaterThanOrEqual(200);
  });

  test("toISO + fromISO - round-trips ISO date strings", async () => {
    const original = new Date(2025, 3, 15, 12, 0, 0);
    const isoStr = dateUtils.toISO(original);

    expect(typeof isoStr).toBe("string");
    expect(isoStr).toContain("2025");

    const restored = dateUtils.fromISO(isoStr);
    expect(restored.getTime()).toBe(original.getTime());
  });

  test("fromISO - throws for invalid string", async () => {
    expect(() => dateUtils.fromISO("not-a-date")).toThrow("Invalid ISO date string");
  });

  test("diffMs - calculates absolute difference between two dates", async () => {
    const date1 = new Date("2025-01-01T00:00:00Z");
    const date2 = new Date("2025-01-01T01:00:00Z");
    const diff = dateUtils.diffMs(date1, date2);

    expect(diff).toBe(3_600_000);
  });

  test("diffMs - returns same value regardless of order", async () => {
    const date1 = new Date("2025-06-01");
    const date2 = new Date("2025-06-02");

    expect(dateUtils.diffMs(date1, date2)).toBe(dateUtils.diffMs(date2, date1));
  });
});

test.describe("RandomUtils @verify", () => {
  test("uuid - returns a valid UUID v4 string", async () => {
    const id = randomUtils.uuid();
    expect(typeof id).toBe("string");
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  test("string - returns a hex string of the specified length", async () => {
    const str = randomUtils.string(10);
    expect(typeof str).toBe("string");
    expect(str.length).toBe(10);
  });

  test("number - returns an integer in the given range", async () => {
    for (let i = 0; i < 20; i++) {
      const num = randomUtils.number(1, 100);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(100);
      expect(Number.isInteger(num)).toBe(true);
    }
  });

  test("email - returns a string containing @", async () => {
    const email = randomUtils.email();
    expect(typeof email).toBe("string");
    expect(email).toContain("@");
    expect(email).toContain("example.com");
  });

  test("boolean - returns true or false", async () => {
    const results = new Set();
    for (let i = 0; i < 50; i++) {
      const val = randomUtils.boolean();
      expect(typeof val).toBe("boolean");
      results.add(val);
    }
    expect(results.size).toBe(2);
  });

  test("pick - returns one element from the array", async () => {
    const arr = [1, 2, 3];
    const picked = randomUtils.pick(arr);
    expect(arr).toContain(picked);
  });

  test("pick - throws on empty array", async () => {
    expect(() => randomUtils.pick([])).toThrow();
  });

  test("shuffle - returns array of same length with same elements", async () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = randomUtils.shuffle(original);

    expect(shuffled.length).toBe(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  test("shuffle - does not mutate the original array", async () => {
    const original = [1, 2, 3];
    const copy = [...original];
    randomUtils.shuffle(original);
    expect(original).toEqual(copy);
  });

  test("alphanumeric - returns a string of correct length with valid chars", async () => {
    const str = randomUtils.alphanumeric(8);
    expect(str.length).toBe(8);
    expect(str).toMatch(/^[a-zA-Z0-9]+$/);
  });
});

test.describe("RetryUtils @verify", () => {
  test("retry success - calls function once when it succeeds", async () => {
    let callCount = 0;
    const result = await retryUtils.retry(
      async () => {
        callCount++;
        return "ok";
      },
      { maxRetries: 3, delay: 10, backoff: 1 }
    );

    expect(result).toBe("ok");
    expect(callCount).toBe(1);
  });

  test("retry with failures then success - retries and eventually succeeds", async () => {
    let callCount = 0;
    const result = await retryUtils.retry(
      async () => {
        callCount++;
        if (callCount < 3) throw new Error(`Attempt ${callCount} failed`);
        return "recovered";
      },
      { maxRetries: 3, delay: 10, backoff: 1 }
    );

    expect(result).toBe("recovered");
    expect(callCount).toBe(3);
  });

  test("retry all failures - throws after maxRetries exhausted", async () => {
    let callCount = 0;
    await expect(
      retryUtils.retry(
        async () => {
          callCount++;
          throw new Error("always fails");
        },
        { maxRetries: 2, delay: 10, backoff: 1, label: "fail-test" }
      )
    ).rejects.toThrow("always fails");

    expect(callCount).toBe(3);
  });

  test("poll success - resolves when predicate returns truthy", async () => {
    let callCount = 0;
    const result = await retryUtils.poll(
      async () => {
        callCount++;
        return callCount >= 3 ? "ready" : null;
      },
      { timeout: 5000, interval: 10, label: "poll-test" }
    );

    expect(result).toBe("ready");
    expect(callCount).toBeGreaterThanOrEqual(3);
  });

  test("poll timeout - throws when predicate never returns truthy", async () => {
    await expect(
      retryUtils.poll(async () => false, {
        timeout: 200,
        interval: 50,
        label: "timeout-test",
      })
    ).rejects.toThrow("timed out");
  });
});
