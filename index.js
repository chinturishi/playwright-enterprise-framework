/**
 * playwright-enterprise-framework
 *
 * Main entry point for consuming applications. Import fixtures, wrappers,
 * utilities, and configuration from this module instead of reaching into
 * internal paths.
 *
 * @example
 *   import { test, expect, BasePage, FrameworkPage, logger } from 'playwright-enterprise-framework';
 */

// ---------------------------------------------------------------------------
// Fixtures — primary entry point for test files
// ---------------------------------------------------------------------------
export { test, expect } from "./core/fixtures/baseFixture.js";

// ---------------------------------------------------------------------------
// Pages — full-abstraction layer (no Playwright imports needed by consumers)
// ---------------------------------------------------------------------------
export { default as FrameworkPage } from "./core/pages/FrameworkPage.js";
export { BasePage } from "./core/pages/BasePage.js";

// ---------------------------------------------------------------------------
// Errors — framework-specific error hierarchy
// ---------------------------------------------------------------------------
export {
  FrameworkError,
  LocatorNotFoundError,
  NavigationError,
  TimeoutError,
  ElementNotInteractableError,
  ConfigurationError,
} from "./core/errors/FrameworkError.js";

// ---------------------------------------------------------------------------
// Wrappers — high-level action helpers with auto-wait and logging
// ---------------------------------------------------------------------------
export { default as elementActions } from "./core/wrappers/elementActions.js";
export { default as waitActions } from "./core/wrappers/waitActions.js";
export { default as keyboardActions } from "./core/wrappers/keyboardActions.js";
export { default as mouseActions } from "./core/wrappers/mouseActions.js";
export { default as dragDropActions } from "./core/wrappers/dragDropActions.js";
export { default as uploadActions } from "./core/wrappers/uploadActions.js";
export { default as frameActions } from "./core/wrappers/frameActions.js";

// ---------------------------------------------------------------------------
// Browser management
// ---------------------------------------------------------------------------
export { default as browserManager, BrowserManager } from "./core/browser/browserManager.js";
export { default as contextManager, ContextManager } from "./core/browser/contextManager.js";
export { default as pageManager, PageManager } from "./core/browser/pageManager.js";
export { default as storageManager } from "./core/browser/storageManager.js";
export { default as BrowserFactory } from "./core/browser/factories/browserFactory.js";
export { default as ContextFactory } from "./core/browser/factories/contextFactory.js";
export { default as createDefaultContext } from "./core/browser/contexts/defaultContext.js";

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export { default as apiInterceptor } from "./core/api/apiInterceptor.js";
export { default as authHandler } from "./core/api/authHandler.js";
export { default as schemaValidator } from "./core/api/schemaValidator.js";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export { default as loginManager } from "./core/auth/loginManager.js";
export { default as oauthManager } from "./core/auth/oauthManager.js";
export { default as sessionManager } from "./core/auth/sessionManager.js";
export { default as ssoManager } from "./core/auth/ssoManager.js";
export { default as tokenManager } from "./core/auth/tokenManager.js";

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------
export { default as logger } from "./core/logging/logger.js";
export { setLogLevel } from "./core/logging/logger.js";
export { LogFormatter } from "./core/logging/logFormatter.js";
export { ExecutionLogger } from "./core/logging/executionLogger.js";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
export { default as retryUtils } from "./core/utils/retryUtils.js";
export { default as dateUtils } from "./core/utils/dateUtils.js";
export { default as envUtils } from "./core/utils/envUtils.js";
export { default as fileUtils } from "./core/utils/fileUtils.js";
export { default as jsonUtils } from "./core/utils/jsonUtils.js";
export { default as locatorUtils } from "./core/utils/locatorUtils.js";
export { default as randomUtils } from "./core/utils/randomUtils.js";
export { default as screenshotUtils } from "./core/utils/screenshotUtils.js";
export { default as stringUtils } from "./core/utils/stringUtils.js";

// ---------------------------------------------------------------------------
// Visual testing
// ---------------------------------------------------------------------------
export { default as baselineManager } from "./core/visual/baselineManager.js";
export { default as imageDiff } from "./core/visual/imageDiff.js";
export { default as snapshotManager } from "./core/visual/snapshotManager.js";
export { default as visualComparator } from "./core/visual/visualComparator.js";

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------
export { default as accessibilityScanner } from "./core/accessibility/accessibilityScanner.js";
export { default as axeRunner } from "./core/accessibility/axeRunner.js";
export { default as wcagValidator } from "./core/accessibility/wcagValidator.js";

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------
export { default as apiPerformance } from "./core/performance/apiPerformance.js";
export { default as lighthouseRunner } from "./core/performance/lighthouseRunner.js";
export { default as networkMonitor } from "./core/performance/networkMonitor.js";
export { default as pageMetrics } from "./core/performance/pageMetrics.js";

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------
export { default as authSecurityChecks } from "./core/security/authSecurityChecks.js";
export { default as cookieValidator } from "./core/security/cookieValidator.js";
export { default as headerValidator } from "./core/security/headerValidator.js";

// ---------------------------------------------------------------------------
// Mobile web
// ---------------------------------------------------------------------------
export { default as deviceManager } from "./core/mobile-web/deviceManager.js";
export { default as mobileActions } from "./core/mobile-web/mobileActions.js";
export { default as viewportManager } from "./core/mobile-web/viewportManager.js";

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
export { default as PostgresClient } from "./core/db/postgresClient.js";
export { default as MysqlClient } from "./core/db/mysqlClient.js";
export { default as MongoClient } from "./core/db/mongoClient.js";
export { default as RedisClient } from "./core/db/redisClient.js";
export { default as QueryExecutor } from "./core/db/queryExecutor.js";

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------
export { default as visualAssertions } from "./core/assertions/visualAssertions.js";
export { default as dbAssertions } from "./core/assertions/dbAssertions.js";

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------
export { default as allureManager } from "./core/reporting/allureManager.js";
export { default as artifactManager } from "./core/reporting/artifactManager.js";
export { default as CustomReporter } from "./core/reporting/customReporter.js";
export { default as htmlReporter } from "./core/reporting/htmlReporter.js";
export { default as reportAggregator } from "./core/reporting/reportAggregator.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
export { default as configLoader } from "./config/global/configLoader.js";
export { frameworkConfig } from "./config/global/framework.config.js";
export { executionConfig } from "./config/global/execution.config.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export {
  DEFAULT_TIMEOUT_MS,
  SHORT_TIMEOUT_MS,
  MEDIUM_TIMEOUT_MS,
  LONG_TIMEOUT_MS,
  NAVIGATION_TIMEOUT_MS,
  ACTION_TIMEOUT_MS,
  ASSERTION_TIMEOUT_MS,
  POLL_INTERVAL_MS,
} from "./config/constants/timeoutConstants.js";

export {
  DEFAULT_API_TIMEOUT_MS,
  MAX_RETRIES,
  RETRY_DELAY_MS,
  HTTP_STATUS,
  CONTENT_TYPES,
} from "./config/constants/apiConstants.js";

export {
  FRAMEWORK_VERSION,
  FRAMEWORK_NAME,
} from "./config/constants/frameworkConstants.js";
