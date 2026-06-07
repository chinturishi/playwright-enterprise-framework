import { test, expect } from "@playwright/test";
import logger, { setLogLevel } from "../core/logging/logger.js";

test.describe("@verify Logger", () => {
  test.afterEach(() => {
    setLogLevel("info");
  });

  test("logger has standard methods - info, warn, error, debug are functions", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  test("logger.info - logs info message without error", () => {
    expect(() => logger.info("test message")).not.toThrow();
  });

  test("logger.warn - logs warning message without error", () => {
    expect(() => logger.warn("test warning")).not.toThrow();
  });

  test("logger.error - logs error message without error", () => {
    expect(() => logger.error("test error")).not.toThrow();
  });

  test("setLogLevel - changes logger level to debug", () => {
    setLogLevel("debug");
    expect(logger.level).toBe("debug");
  });

  test("logger.debug at info level - does not throw", () => {
    setLogLevel("info");
    expect(() => logger.debug("this should not throw")).not.toThrow();
  });
});
