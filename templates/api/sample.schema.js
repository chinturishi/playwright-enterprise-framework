/**
 * Sample JSON Schemas (Ajv-compatible) for validating API responses.
 *
 * These schemas serve as documentation and runtime validation contracts.
 * Register them with `schemaValidator.addSchema(name, schema)` and then
 * call `schemaValidator.validateResponse(response, name)`.
 */

/** Schema for a single resource (e.g. a User). */
export const resourceSchema = {
  type: "object",
  required: ["id", "name", "email", "createdAt"],
  properties: {
    id: { type: "integer", minimum: 1 },
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
    phone: { type: "string" },
    role: { type: "string", enum: ["admin", "editor", "viewer"] },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
};

/** Schema for a paginated list response. */
export const listResponseSchema = {
  type: "object",
  required: ["data", "meta"],
  properties: {
    data: {
      type: "array",
      items: { $ref: "#/$defs/resource" },
    },
    meta: {
      type: "object",
      required: ["total", "page", "limit"],
      properties: {
        total: { type: "integer", minimum: 0 },
        page: { type: "integer", minimum: 1 },
        limit: { type: "integer", minimum: 1, maximum: 100 },
        totalPages: { type: "integer", minimum: 0 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  $defs: {
    resource: {
      type: "object",
      required: ["id", "name", "email"],
      properties: {
        id: { type: "integer", minimum: 1 },
        name: { type: "string", minLength: 1 },
        email: { type: "string" },
        isActive: { type: "boolean" },
      },
    },
  },
};

/** Schema for a standard error response. */
export const errorResponseSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "object",
      required: ["code", "message"],
      properties: {
        code: { type: "string" },
        message: { type: "string", minLength: 1 },
        details: {
          type: "array",
          items: {
            type: "object",
            properties: {
              field: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

/** Schema for a 201 Created response that returns the new resource id. */
export const createResponseSchema = {
  type: "object",
  required: ["id", "createdAt"],
  properties: {
    id: { type: "integer", minimum: 1 },
    createdAt: { type: "string", format: "date-time" },
    message: { type: "string" },
  },
  additionalProperties: false,
};
