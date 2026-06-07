import { test, expect } from "@playwright/test";
import schemaValidator from "../core/api/schemaValidator.js";

const userSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
  required: ["name"],
};

test.describe("SchemaValidator @verify", () => {
  test("validate (valid data) - returns valid=true for conforming data", async () => {
    const result = schemaValidator.validate(
      { name: "test", age: 25 },
      userSchema
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toBeNull();
  });

  test("validate (invalid data) - returns valid=false with errors", async () => {
    const result = schemaValidator.validate({ name: 123 }, userSchema);
    expect(result.valid).toBe(false);
    expect(result.errors).not.toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("addSchema + getSchema - registers and retrieves a schema", async () => {
    const productSchema = {
      type: "object",
      properties: {
        id: { type: "number" },
        title: { type: "string" },
      },
      required: ["id", "title"],
    };

    schemaValidator.addSchema("product", productSchema);
    const retrieved = schemaValidator.getSchema("product");

    expect(retrieved).toBeDefined();
    expect(retrieved).toEqual(productSchema);
  });

  test("getSchema - returns undefined for unregistered name", async () => {
    const result = schemaValidator.getSchema("nonexistent-schema");
    expect(result).toBeUndefined();
  });

  test("validateResponse - validates a mock response body against a named schema", async () => {
    const orderSchema = {
      type: "object",
      properties: {
        orderId: { type: "string" },
        total: { type: "number" },
      },
      required: ["orderId"],
    };
    schemaValidator.addSchema("order", orderSchema);

    const validResponse = {
      status: 200,
      body: { orderId: "ORD-001", total: 99.99 },
    };
    const validResult = schemaValidator.validateResponse(
      validResponse,
      "order"
    );
    expect(validResult.valid).toBe(true);

    const invalidResponse = {
      status: 200,
      body: { total: "not-a-number" },
    };
    const invalidResult = schemaValidator.validateResponse(
      invalidResponse,
      "order"
    );
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).not.toBeNull();
  });

  test("validateResponse - throws for unregistered schema name", async () => {
    expect(() =>
      schemaValidator.validateResponse(
        { status: 200, body: {} },
        "unknown-schema"
      )
    ).toThrow('Schema "unknown-schema" not registered');
  });

  test("generateErrorReport - returns formatted string for validation errors", async () => {
    const result = schemaValidator.validate({ name: 123, age: "not-a-number" }, userSchema);
    expect(result.valid).toBe(false);

    const report = schemaValidator.generateErrorReport(result.errors);
    expect(typeof report).toBe("string");
    expect(report.length).toBeGreaterThan(0);
    expect(report).not.toBe("No errors");
  });

  test("generateErrorReport - returns 'No errors' for null/empty input", async () => {
    expect(schemaValidator.generateErrorReport(null)).toBe("No errors");
    expect(schemaValidator.generateErrorReport([])).toBe("No errors");
  });
});
