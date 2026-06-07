/**
 * Sample API service class demonstrating the recommended pattern for
 * encapsulating CRUD operations on a single REST resource.
 *
 * Consuming tests instantiate this with the framework's `apiInterceptor`
 * (after calling `createClient`) and call high-level methods instead of
 * raw HTTP verbs.
 */

export class ResourceService {
  /** @type {string} */
  #basePath;

  /**
   * @param {import('../../core/api/apiInterceptor.js').default} apiClient - Framework API client
   * @param {string} [basePath='/api/resources'] - Resource endpoint prefix
   */
  constructor(apiClient, basePath = "/api/resources") {
    this.api = apiClient;
    this.#basePath = basePath;
  }

  /**
   * Fetch a paginated list of resources.
   * @param {{ page?: number, limit?: number }} [params]
   * @returns {Promise<{ status: number, body: *, headers: object, responseTime: number }>}
   */
  async list(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    const url = qs ? `${this.#basePath}?${qs}` : this.#basePath;
    return this.api.get(url);
  }

  /**
   * Fetch a single resource by ID.
   * @param {number | string} id
   */
  async getById(id) {
    return this.api.get(`${this.#basePath}/${id}`);
  }

  /**
   * Create a new resource.
   * @param {object} payload
   */
  async create(payload) {
    return this.api.post(this.#basePath, payload);
  }

  /**
   * Fully replace an existing resource.
   * @param {number | string} id
   * @param {object} payload
   */
  async update(id, payload) {
    return this.api.put(`${this.#basePath}/${id}`, payload);
  }

  /**
   * Partially update an existing resource.
   * @param {number | string} id
   * @param {object} fields
   */
  async patch(id, fields) {
    return this.api.patch(`${this.#basePath}/${id}`, fields);
  }

  /**
   * Delete a resource by ID.
   * @param {number | string} id
   */
  async remove(id) {
    return this.api.delete(`${this.#basePath}/${id}`);
  }

  /**
   * Convenience: create a resource and return just its ID.
   * @param {object} payload
   * @returns {Promise<number | string>}
   */
  async createAndGetId(payload) {
    const response = await this.create(payload);
    if (response.status >= 400) {
      throw new Error(`Create failed with status ${response.status}: ${JSON.stringify(response.body)}`);
    }
    return response.body.id;
  }
}
