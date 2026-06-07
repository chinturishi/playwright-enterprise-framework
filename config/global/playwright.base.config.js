import { defineConfig, devices } from "@playwright/test";
import { executionConfig } from "./execution.config.js";

/**
 * Base Playwright config that consuming teams merge with their own.
 * Teams import this and spread/override via defineConfig merge.
 */
export default defineConfig({
  testDir: "./tests",
  outputDir: executionConfig.outputDir,
  timeout: executionConfig.timeout,
  retries: executionConfig.retries,
  workers: executionConfig.workers,
  fullyParallel: executionConfig.fullyParallel,
  forbidOnly: executionConfig.forbidOnly,
  grep: executionConfig.grep,
  grepInvert: executionConfig.grepInvert,
  maxFailures: executionConfig.maxFailures,

  expect: {
    timeout: 5_000
  },

  use: {
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    baseURL: process.env.BASE_URL || ""
  },

  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "reports/html-report" }],
    ["json", { outputFile: "reports/test-results.json" }]
  ],

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ]
});
