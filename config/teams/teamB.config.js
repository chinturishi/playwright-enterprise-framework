export const teamConfig = {
  teamName: "TeamB",
  defaultBrowser: "firefox",
  baseUrl: "",
  timeouts: {
    default: 45_000,
    navigation: 60_000,
    action: 15_000,
    assertion: 10_000
  },
  tags: ["@smoke", "@api", "@teamB"],
  featureFlags: {
    enableVisualTesting: false,
    enableApiMocking: true,
    enableParallelExecution: false,
    enableRetryOnFailure: true
  },
  retry: {
    count: 3,
    delay: 2_000
  }
};
