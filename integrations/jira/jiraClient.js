import logger from "../../core/logging/logger.js";
import fs from "fs";
import path from "path";

class JiraClient {
  #baseUrl = "";
  #authHeader = "";

  /**
   * @param {string} baseUrl - Jira Cloud base URL (e.g. https://yoursite.atlassian.net)
   * @param {string} email - Jira account email
   * @param {string} apiToken - Jira API token
   */
  configure(baseUrl, email, apiToken) {
    this.#baseUrl = baseUrl.replace(/\/+$/, "");
    this.#authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString("base64")}`;
    logger.info(`Jira client configured for ${this.#baseUrl}`);
  }

  async #request(method, endpoint, body) {
    const url = `${this.#baseUrl}/rest/api/3${endpoint}`;
    const opts = {
      method,
      headers: {
        Authorization: this.#authHeader,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    if (body) opts.body = JSON.stringify(body);

    logger.debug(`Jira ${method} ${endpoint}`);
    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Jira API ${res.status}: ${text}`);
    }
    const contentType = res.headers.get("content-type") || "";
    return contentType.includes("application/json") ? res.json() : null;
  }

  /**
   * @param {string} projectKey
   * @param {string} summary
   * @param {string} description
   * @param {string} [issueType='Bug']
   * @param {string} [priority='Medium']
   * @returns {Promise<object>} Created issue data
   */
  async createIssue(projectKey, summary, description, issueType = "Bug", priority = "Medium") {
    logger.info(`Creating Jira issue in ${projectKey}: ${summary}`);
    return this.#request("POST", "/issue", {
      fields: {
        project: { key: projectKey },
        summary,
        description: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: description }] }] },
        issuetype: { name: issueType },
        priority: { name: priority },
      },
    });
  }

  /**
   * @param {string} issueKey - e.g. "PROJ-123"
   * @param {object} fields - Fields to update
   */
  async updateIssue(issueKey, fields) {
    logger.info(`Updating Jira issue ${issueKey}`);
    await this.#request("PUT", `/issue/${issueKey}`, { fields });
  }

  /** @param {string} issueKey @param {string} comment */
  async addComment(issueKey, comment) {
    logger.info(`Adding comment to ${issueKey}`);
    return this.#request("POST", `/issue/${issueKey}/comment`, {
      body: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: comment }] }] },
    });
  }

  /** @param {string} issueKey @param {string} filePath */
  async attachFile(issueKey, filePath) {
    logger.info(`Attaching ${path.basename(filePath)} to ${issueKey}`);
    const url = `${this.#baseUrl}/rest/api/3/issue/${issueKey}/attachments`;
    const form = new FormData();
    const buffer = fs.readFileSync(filePath);
    form.append("file", new Blob([buffer]), path.basename(filePath));

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: this.#authHeader, "X-Atlassian-Token": "no-check" },
      body: form,
    });
    if (!res.ok) throw new Error(`Jira attach ${res.status}: ${await res.text()}`);
    return res.json();
  }

  /** @param {string} issueKey @returns {Promise<object>} */
  async getIssue(issueKey) {
    logger.info(`Fetching Jira issue ${issueKey}`);
    return this.#request("GET", `/issue/${issueKey}`);
  }

  /** @param {string} jql @returns {Promise<object>} */
  async searchIssues(jql) {
    logger.info(`Searching Jira: ${jql}`);
    return this.#request("POST", "/search", { jql, maxResults: 50 });
  }

  /** @param {string} issueKey @param {string} transitionName */
  async transitionIssue(issueKey, transitionName) {
    logger.info(`Transitioning ${issueKey} to "${transitionName}"`);
    const { transitions } = await this.#request("GET", `/issue/${issueKey}/transitions`);
    const match = transitions.find((t) => t.name.toLowerCase() === transitionName.toLowerCase());
    if (!match) throw new Error(`Transition "${transitionName}" not found for ${issueKey}`);
    await this.#request("POST", `/issue/${issueKey}/transitions`, { transition: { id: match.id } });
  }
}

export default new JiraClient();
