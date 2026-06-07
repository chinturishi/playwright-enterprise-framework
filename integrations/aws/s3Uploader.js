import logger from "../../core/logging/logger.js";
import fs from "fs";
import path from "path";

class S3Uploader {
  #region = "";
  #bucket = "";

  /**
   * @param {string} region - AWS region (e.g. us-east-1)
   * @param {string} bucket - S3 bucket name
   */
  configure(region, bucket) {
    this.#region = region;
    this.#bucket = bucket;
    logger.info(`S3 uploader configured: bucket=${bucket}, region=${region}`);
  }

  /**
   * Placeholder: replace body with actual AWS SDK S3Client.send(PutObjectCommand)
   * @param {string} filePath - Local file path
   * @param {string} key - S3 object key
   * @returns {Promise<object>}
   */
  async upload(filePath, key) {
    if (!this.#bucket) throw new Error("S3 uploader not configured");
    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

    logger.info(`Uploading ${filePath} → s3://${this.#bucket}/${key}`);

    // Placeholder: actual AWS SDK call
    // const client = new S3Client({ region: this.#region });
    // const body = fs.createReadStream(filePath);
    // return client.send(new PutObjectCommand({ Bucket: this.#bucket, Key: key, Body: body }));

    logger.warn("AWS SDK not installed — upload is a no-op placeholder");
    return { bucket: this.#bucket, key, region: this.#region, uploaded: false };
  }

  /**
   * @param {string} dirPath - Local directory to upload
   * @param {string} prefix - S3 key prefix
   * @returns {Promise<object[]>} Upload results
   */
  async uploadDirectory(dirPath, prefix) {
    if (!fs.existsSync(dirPath)) throw new Error(`Directory not found: ${dirPath}`);
    const results = [];

    const walkDir = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else {
          const relativePath = path.relative(dirPath, fullPath);
          const key = `${prefix}/${relativePath}`.replace(/\\/g, "/");
          results.push(this.upload(fullPath, key));
        }
      }
    };

    walkDir(dirPath);
    logger.info(`Uploading directory ${dirPath} (${results.length} files) to s3://${this.#bucket}/${prefix}`);
    return Promise.all(results);
  }

  /**
   * Placeholder: replace with GetObjectCommand + getSignedUrl from @aws-sdk/s3-request-presigner
   * @param {string} key
   * @param {number} [expiresIn=3600] - Seconds until URL expires
   * @returns {Promise<string>}
   */
  async getSignedUrl(key, expiresIn = 3600) {
    logger.warn("AWS SDK not installed — getSignedUrl is a placeholder");
    return `https://${this.#bucket}.s3.${this.#region}.amazonaws.com/${key}?X-Amz-Expires=${expiresIn}&placeholder=true`;
  }

  /**
   * Placeholder: replace with ListObjectsV2Command
   * @param {string} prefix
   * @returns {Promise<object[]>}
   */
  async listObjects(prefix) {
    logger.warn("AWS SDK not installed — listObjects is a placeholder");
    return [];
  }
}

export default new S3Uploader();
