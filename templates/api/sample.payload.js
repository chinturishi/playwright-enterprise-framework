/**
 * Sample payload builders for API tests.
 *
 * Each builder merges sensible defaults with caller overrides so tests only
 * specify the fields they care about. A factory function produces unique
 * payloads suitable for parallel execution.
 */

const RESOURCE_DEFAULTS = {
  name: "Test User",
  email: "test@example.com",
  phone: "+1-555-0100",
  role: "viewer",
  isActive: true,
};

/**
 * Build a "create resource" payload.
 * @param {Partial<typeof RESOURCE_DEFAULTS>} [overrides]
 * @returns {typeof RESOURCE_DEFAULTS}
 */
export function createPayload(overrides = {}) {
  return { ...RESOURCE_DEFAULTS, ...overrides };
}

/**
 * Build an "update resource" payload — only the mutable fields.
 * @param {Partial<Omit<typeof RESOURCE_DEFAULTS, 'email'>>} [overrides]
 */
export function updatePayload(overrides = {}) {
  return {
    name: "Updated User",
    phone: "+1-555-0199",
    role: "editor",
    ...overrides,
  };
}

/**
 * Build a partial-update (PATCH) payload.
 * @param {Record<string, unknown>} fields
 */
export function patchPayload(fields) {
  return { ...fields };
}

/**
 * Factory that produces a unique payload per call, avoiding collisions in
 * parallel test runs.
 *
 * @param {Partial<typeof RESOURCE_DEFAULTS>} [overrides]
 * @returns {typeof RESOURCE_DEFAULTS & { email: string }}
 */
export function uniquePayload(overrides = {}) {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    ...RESOURCE_DEFAULTS,
    name: `User ${uid}`,
    email: `user-${uid}@example.com`,
    ...overrides,
  };
}
