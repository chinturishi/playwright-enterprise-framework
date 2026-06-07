export const teamConfig = {
  teamName: "TeamC",
  defaultBrowser: "webkit",
  baseUrl: "",
  timeouts: {
    default: 20_000,
    navigation: 30_000,
    action: 8_000,
    assertion: 3_000
  },
  tags: ["@smoke", "@e2e", "@teamC"],
  featureFlags: {
    enableVisualTesting: true,
    enableApiMocking: true,
    enableParallelExecution: true,
    enableRetryOnFailure: false
  },
  retry: {
    count: 0,
    delay: 500
  }
};
