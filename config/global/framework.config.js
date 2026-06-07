export const frameworkConfig = {
  browser: {
    name: "chromium",
    headless: true,
    baseUrl: "",
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
    colorScheme: "light",
    ignoreHTTPSErrors: false
  },

  timeouts: {
    default: 30_000,
    short: 5_000,
    medium: 15_000,
    long: 60_000,
    navigation: 30_000,
    action: 10_000,
    assertion: 5_000
  },

  reporting: {
    outputDir: "reports",
    screenshotDir: "reports/screenshots",
    videoDir: "reports/videos",
    traceDir: "reports/traces",
    screenshotOnFailure: true,
    videoOnFailure: false,
    traceOnFailure: true
  },

  logging: {
    level: "info",
    file: "reports/execution.log",
    console: true
  },

  retry: {
    count: 1,
    delay: 1_000,
    backoffMultiplier: 2
  },

  parallel: {
    workers: undefined,
    fullyParallel: false,
    maxFailures: 0
  }
};
