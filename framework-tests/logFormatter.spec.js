import { test, expect } from "@playwright/test";
import { LogFormatter } from "../core/logging/logFormatter.js";
import { ExecutionLogger } from "../core/logging/executionLogger.js";

test.describe("LogFormatter @verify", () => {
  test("formatTestStart - returns string with test name and separator", async () => {
    const output = LogFormatter.formatTestStart("Login test");

    expect(typeof output).toBe("string");
    expect(output).toContain("TEST START");
    expect(output).toContain("Login test");
    expect(output).toContain("=");
  });

  test("formatTestEnd - returns string with name, status icon, and duration", async () => {
    const passed = LogFormatter.formatTestEnd("Login test", "passed", 1200);
    expect(passed).toContain("TEST END");
    expect(passed).toContain("Login test");
    expect(passed).toContain("PASSED");
    expect(passed).toContain("1200ms");

    const failed = LogFormatter.formatTestEnd("Login test", "failed", 500);
    expect(failed).toContain("FAILED");
  });

  test("formatStep - returns formatted step string", async () => {
    const output = LogFormatter.formatStep("Click submit button");

    expect(typeof output).toBe("string");
    expect(output).toContain("Step");
    expect(output).toContain("Click submit button");
  });

  test("formatError - returns formatted error with message", async () => {
    const error = new Error("Element not found");
    const output = LogFormatter.formatError(error);

    expect(typeof output).toBe("string");
    expect(output).toContain("Error");
    expect(output).toContain("Element not found");
  });

  test("formatError - includes stack trace snippet", async () => {
    const error = new Error("Timeout");
    const output = LogFormatter.formatError(error);

    expect(output).toContain("Stack");
  });

  test("formatApiRequest - returns formatted request line", async () => {
    const output = LogFormatter.formatApiRequest("get", "/api/users");

    expect(typeof output).toBe("string");
    expect(output).toContain("GET");
    expect(output).toContain("/api/users");
    expect(output).toContain("API Request");
  });

  test("formatApiResponse - returns formatted response line", async () => {
    const output = LogFormatter.formatApiResponse(200, 150);

    expect(typeof output).toBe("string");
    expect(output).toContain("200");
    expect(output).toContain("150ms");
    expect(output).toContain("API Response");
  });

  test("toJSON - returns valid JSON string with timestamp", async () => {
    const output = LogFormatter.toJSON({
      event: "testStart",
      test: "example",
    });

    expect(typeof output).toBe("string");
    const parsed = JSON.parse(output);
    expect(parsed.timestamp).toBeDefined();
    expect(parsed.event).toBe("testStart");
    expect(parsed.test).toBe("example");
  });
});

test.describe("ExecutionLogger @verify", () => {
  test("startTest - sets current test name", async () => {
    const execLogger = new ExecutionLogger("TestSuite");

    execLogger.startTest("my test");
    expect(execLogger.currentTest).toBe("my test");
  });

  test("endTest - clears current test and records duration", async () => {
    const execLogger = new ExecutionLogger("TestSuite");

    execLogger.startTest("duration test");
    expect(execLogger.currentTest).toBe("duration test");

    execLogger.endTest("duration test", "passed");
    expect(execLogger.currentTest).toBeNull();
  });

  test("step - logs a step within the current test", async () => {
    const execLogger = new ExecutionLogger("TestSuite");

    execLogger.startTest("step test");
    expect(() => execLogger.step("Click login button")).not.toThrow();
    expect(() => execLogger.step("Enter credentials")).not.toThrow();
    execLogger.endTest("step test", "passed");
  });

  test("constructor - accepts optional suite name", async () => {
    const withSuite = new ExecutionLogger("MySuite");
    expect(withSuite.currentSuite).toBe("MySuite");

    const withoutSuite = new ExecutionLogger();
    expect(withoutSuite.currentSuite).toBeNull();
  });

  test("suite setter - updates the current suite", async () => {
    const execLogger = new ExecutionLogger();
    expect(execLogger.currentSuite).toBeNull();

    execLogger.suite = "UpdatedSuite";
    expect(execLogger.currentSuite).toBe("UpdatedSuite");
  });

  test("error - logs an error without throwing", async () => {
    const execLogger = new ExecutionLogger("ErrorSuite");
    execLogger.startTest("error test");

    expect(() => execLogger.error(new Error("something broke"))).not.toThrow();
    execLogger.endTest("error test", "failed");
  });

  test("attachment - logs attachment info without throwing", async () => {
    const execLogger = new ExecutionLogger("AttachSuite");
    execLogger.startTest("attach test");

    expect(() =>
      execLogger.attachment("screenshot", "/tmp/screenshot.png")
    ).not.toThrow();
    execLogger.endTest("attach test", "passed");
  });
});
