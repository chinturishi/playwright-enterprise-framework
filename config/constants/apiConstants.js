export const DEFAULT_API_TIMEOUT_MS = 15_000;
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1_000;

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
});

export const CONTENT_TYPES = Object.freeze({
  JSON: "application/json",
  FORM: "application/x-www-form-urlencoded",
  MULTIPART: "multipart/form-data",
  TEXT: "text/plain",
  HTML: "text/html",
  XML: "application/xml"
});
