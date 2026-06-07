/**
 * Sample API test suite demonstrating how a consuming application uses the
 * framework's API utilities for CRUD testing, schema validation, and
 * response-time assertions.
 *
 * Run with:  npx playwright test templates/api/sample.api.spec.js
 *
 * NOTE: These tests use https://jsonplaceholder.typicode.com as a
 * publicly-available stand-in. Replace with your real API base URL.
 */
import { test, expect } from "../../core/fixtures/baseFixture.js";
import apiInterceptor from "../../core/api/apiInterceptor.js";
import schemaValidator from "../../core/api/schemaValidator.js";
import { ResourceService } from "./sample.service.js";
import { createPayload, updatePayload, patchPayload } from "./sample.payload.js";
import { resourceSchema, errorResponseSchema } from "./sample.schema.js";

const API_BASE = "https://jsonplaceholder.typicode.com";

let service;

test.beforeAll(async () => {
  await apiInterceptor.createClient(API_BASE);
  service = new ResourceService(apiInterceptor, "/users");

  schemaValidator.addSchema("resource", resourceSchema);
  schemaValidator.addSchema("error", errorResponseSchema);
});

test.describe("GET requests @api @smoke", () => {
  test("should fetch a list of resources", async ({ logger }) => {
    const response = await service.list();

    logger.info(`GET /users → ${response.status} (${response.responseTime}ms)`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("should fetch a single resource by ID", async ({ logger }) => {
    const response = await service.getById(1);

    logger.info(`GET /users/1 → ${response.status}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", 1);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
  });

  test("should return 404 for a non-existent resource", async ({ logger }) => {
    const response = await service.getById(99999);

    logger.info(`GET /users/99999 → ${response.status}`);
    expect(response.status).toBe(404);
  });

  test("should respond within acceptable time", async ({ logger }) => {
    const response = await service.list();

    logger.info(`Response time: ${response.responseTime}ms`);
    expect(response.responseTime).toBeLessThan(5000);
  });
});

test.describe("POST requests @api", () => {
  test("should create a new resource", async ({ logger }) => {
    const payload = createPayload({ name: "Jane Doe", email: "jane@example.com" });
    const response = await service.create(payload);

    logger.info(`POST /users → ${response.status}`);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  test("should include submitted fields in response", async ({ logger }) => {
    const payload = createPayload();
    const response = await service.create(payload);

    logger.info(`Created resource id: ${response.body.id}`);
    expect(response.body.name).toBe(payload.name);
    expect(response.body.email).toBe(payload.email);
  });
});

test.describe("PUT requests @api", () => {
  test("should update an existing resource", async ({ logger }) => {
    const payload = updatePayload({ name: "Updated Name" });
    const response = await service.update(1, payload);

    logger.info(`PUT /users/1 → ${response.status}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Name");
  });
});

test.describe("PATCH requests @api", () => {
  test("should partially update a resource", async ({ logger }) => {
    const response = await service.patch(1, patchPayload({ name: "Patched Name" }));

    logger.info(`PATCH /users/1 → ${response.status}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Patched Name");
  });
});

test.describe("DELETE requests @api", () => {
  test("should delete a resource", async ({ logger }) => {
    const response = await service.remove(1);

    logger.info(`DELETE /users/1 → ${response.status}`);
    expect(response.status).toBe(200);
  });
});

test.describe("Schema validation @api @regression", () => {
  test("should validate single-resource response against schema", async ({ logger }) => {
    const response = await service.getById(1);
    const result = schemaValidator.validate(response.body, resourceSchema);

    logger.info(`Schema valid: ${result.valid}`);
    if (!result.valid) {
      logger.warn(`Errors: ${schemaValidator.generateErrorReport(result.errors)}`);
    }
    expect(result.valid).toBe(true);
  });

  test("should validate using registered named schema", async ({ logger }) => {
    const response = await service.getById(1);
    const result = schemaValidator.validateResponse(response, "resource");

    logger.info(`Named schema validation: ${result.valid}`);
    expect(result.valid).toBe(true);
  });
});

test.describe("Response headers @api", () => {
  test("should return expected content-type header", async ({ logger }) => {
    const response = await service.list();
    const contentType = response.headers["content-type"] || "";

    logger.info(`Content-Type: ${contentType}`);
    expect(contentType).toContain("application/json");
  });
});
