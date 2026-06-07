export const teamConfig = {
  teamName: "TeamA",
  defaultBrowser: "chromium",
  baseUrl: "",
  timeouts: {
    default: 30_000,
    navigation: 45_000,
    action: 10_000,
    assertion: 5_000
  },
  tags: ["@smoke", "@regression", "@teamA"],
  featureFlags: {
    enableVisualTesting: true,
    enableApiMocking: false,
    enableParallelExecution: true,
    enableRetryOnFailure: true
  },
  retry: {
    count: 2,
    delay: 1_000
  }
};
