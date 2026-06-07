const toInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) ? n : fallback;
};

const toBool = (val, fallback) =>
  val === "true" ? true : val === "false" ? false : fallback;

export const executionConfig = {
  workers: toInt(process.env.WORKERS, undefined),
  retries: toInt(process.env.RETRIES, 1),
  fullyParallel: toBool(process.env.FULLY_PARALLEL, false),
  timeout: toInt(process.env.TIMEOUT, 30_000),
  grep: process.env.GREP ? new RegExp(process.env.GREP) : undefined,
  grepInvert: process.env.GREP_INVERT
    ? new RegExp(process.env.GREP_INVERT)
    : undefined,
  maxFailures: toInt(process.env.MAX_FAILURES, 0),
  reporter: process.env.REPORTER || "html",
  outputDir: process.env.OUTPUT_DIR || "test-results",
  forbidOnly: toBool(process.env.FORBID_ONLY, false)
};
