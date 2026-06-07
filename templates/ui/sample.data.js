/**
 * Sample test-data module demonstrating data-driven testing patterns.
 *
 * Organises data into named sets (valid, invalid, edge-case) and exposes a
 * factory function for generating unique payloads at runtime.
 */

/** Happy-path data sets. */
export const validData = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    message: "I would like to learn more about your services.",
    category: "general",
  },
  {
    name: "Bob Smith",
    email: "bob.smith@example.com",
    message: "Requesting a product demo for our team.",
    category: "sales",
  },
];

/** Negative / validation-error data sets. */
export const invalidData = [
  {
    name: "",
    email: "alice@example.com",
    message: "Missing name field",
    category: "general",
    expectedError: "Name is required",
  },
  {
    name: "Alice",
    email: "not-an-email",
    message: "Malformed email address",
    category: "general",
    expectedError: "Invalid email",
  },
  {
    name: "Alice",
    email: "alice@example.com",
    message: "",
    category: "general",
    expectedError: "Message is required",
  },
];

/** Boundary / edge-case data sets. */
export const edgeCaseData = [
  {
    name: "A",
    email: "a@b.co",
    message: "Minimum-length fields",
    category: "support",
  },
  {
    name: "X".repeat(200),
    email: "long.name.user@very-long-domain-name.example.com",
    message: "Y".repeat(5000),
    category: "general",
  },
  {
    name: "José García-López",
    email: "jose@example.com",
    message: "Unicode characters: àáâãäåæçèé 日本語 🚀",
    category: "general",
  },
];

/**
 * Factory that merges defaults with caller overrides to produce unique data.
 * Stamps each record with a runtime-unique suffix to avoid collisions in
 * parallel test runs.
 *
 * @param {Partial<{name: string, email: string, message: string, category: string}>} [overrides]
 * @returns {{name: string, email: string, message: string, category: string}}
 */
export function createTestData(overrides = {}) {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: `Test User ${uid}`,
    email: `testuser-${uid}@example.com`,
    message: `Automated test message ${uid}`,
    category: "general",
    ...overrides,
  };
}
