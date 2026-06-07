import logger from "../../core/logging/logger.js";
import fs from "fs";
import path from "path";

class VectorStore {
  /** @param {string} storePath - Directory for file-based storage */
  constructor(storePath = ".ai-store/vectors") {
    this.storePath = storePath;
    this.entries = new Map();
    this._ensureDir();
    this._load();
  }

  /**
   * Store text with metadata. Embedding is a placeholder hash.
   * @param {string} id @param {string} text @param {object} [metadata]
   */
  async add(id, text, metadata = {}) {
    const embedding = this._placeholderEmbed(text);
    this.entries.set(id, { id, text, metadata, embedding, addedAt: new Date().toISOString() });
    this._persist();
    logger.debug(`[VectorStore] Added entry: ${id}`);
  }

  /**
   * Search for similar entries using placeholder cosine similarity.
   * @param {string} query @param {number} [topK=5]
   */
  async search(query, topK = 5) {
    const queryEmbed = this._placeholderEmbed(query);
    const scored = [...this.entries.values()].map((entry) => ({
      ...entry,
      score: this._cosineSim(queryEmbed, entry.embedding),
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /** @param {string} id */
  async remove(id) {
    this.entries.delete(id);
    this._persist();
  }

  async getAll() {
    return [...this.entries.values()];
  }

  _placeholderEmbed(text) {
    const vec = new Array(64).fill(0);
    for (let i = 0; i < text.length; i++) {
      vec[i % 64] += text.charCodeAt(i) / 1000;
    }
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map((v) => v / mag);
  }

  _cosineSim(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
  }

  _ensureDir() {
    if (!fs.existsSync(this.storePath)) fs.mkdirSync(this.storePath, { recursive: true });
  }

  _persist() {
    const filePath = path.join(this.storePath, "data.json");
    const data = Object.fromEntries(this.entries);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  _load() {
    const filePath = path.join(this.storePath, "data.json");
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        for (const [id, entry] of Object.entries(data)) this.entries.set(id, entry);
      } catch { /* corrupted file, start fresh */ }
    }
  }
}

export default VectorStore;
