# Test Run Commands

Quick reference for running framework verification tests.

---

## Run Everything

```bash
# Run all tests across all browsers (chromium, firefox, webkit)
npx playwright test

# Run all tests on chromium only (fastest)
npx playwright test --project=chromium

# Run all tests in headed mode (see the browser)
npx playwright test --project=chromium --headed

# Run all tests in debug mode (step through)
npx playwright test --project=chromium --debug
```

---

## Run by Tag

```bash
# Run only sanity tests
npx playwright test --grep @sanity --project=chromium

# Run only verification tests
npx playwright test --grep @verify --project=chromium
```

---

## Run a Single Test File

```bash
# Sanity (framework bootstrap check)
npx playwright test framework-tests/sanity.spec.js --project=chromium
```

### UI Wrappers

```bash
# WaitActions (waitForVisible, waitForHidden, waitForEnabled, waitForPageLoad, etc.)
npx playwright test framework-tests/waitActions.spec.js --project=chromium

# ElementActions (click, fill, type, getText, check, selectOption, hover, etc.)
npx playwright test framework-tests/elementActions.spec.js --project=chromium

# KeyboardActions (press, type, shortcut, selectAll, copy, paste, undo)
npx playwright test framework-tests/keyboardActions.spec.js --project=chromium

# MouseActions (click at coords, doubleClick, rightClick, hover, wheel)
npx playwright test framework-tests/mouseActions.spec.js --project=chromium

# DragDropActions (dragAndDrop, dragTo)
npx playwright test framework-tests/dragDropActions.spec.js --project=chromium

# UploadActions (uploadFile, uploadFiles, uploadViaChooser, removeFile)
npx playwright test framework-tests/uploadActions.spec.js --project=chromium

# FrameActions (getFrame, switchToFrame, getFrameLocator, executeInFrame)
npx playwright test framework-tests/frameActions.spec.js --project=chromium

# TableActions (getRowCount, getCellText, getRowData, getHeaders, findRowByText)
npx playwright test framework-tests/tableActions.spec.js --project=chromium
```

### Browser + Infrastructure

```bash
# BrowserManager (launchBrowser, closeBrowser, isConnected)
npx playwright test framework-tests/browserManager.spec.js --project=chromium

# ContextManager (createContext, viewport, permissions, cookies)
npx playwright test framework-tests/contextManager.spec.js --project=chromium

# PageManager (createPage, closePage, getPages, switchToPage)
npx playwright test framework-tests/pageManager.spec.js --project=chromium

# StorageManager (localStorage, sessionStorage, saveStorageState)
npx playwright test framework-tests/storageManager.spec.js --project=chromium

# ScreenshotUtils (capture, captureElement, getPath)
npx playwright test framework-tests/screenshotUtils.spec.js --project=chromium

# ConfigLoader (load, get, getAll, reset)
npx playwright test framework-tests/configLoader.spec.js --project=chromium

# Logger (info, warn, error, setLogLevel)
npx playwright test framework-tests/logger.spec.js --project=chromium
```

### API + Utilities

```bash
# ApiInterceptor (get, post, put, delete, mockResponse, interceptRoute)
npx playwright test framework-tests/apiInterceptor.spec.js --project=chromium

# SchemaValidator (validate, addSchema, validateResponse)
npx playwright test framework-tests/schemaValidator.spec.js --project=chromium

# AuthHandler (setBearerToken, setBasicAuth, setApiKey, wrapRequest)
npx playwright test framework-tests/authHandler.spec.js --project=chromium

# RequestBuilder (create, setMethod, setBody, setParams, chaining)
npx playwright test framework-tests/requestBuilder.spec.js --project=chromium

# Utilities (StringUtils, JsonUtils, DateUtils, RandomUtils, RetryUtils)
npx playwright test framework-tests/utils.spec.js --project=chromium

# LogFormatter + ExecutionLogger
npx playwright test framework-tests/logFormatter.spec.js --project=chromium

# LocatorUtils (byRole, byTestId, byText, byLabel, byPlaceholder)
npx playwright test framework-tests/locatorUtils.spec.js --project=chromium
```

---

## Run a Single Test by Name

Use `-g` (grep) to match a specific test name:

```bash
# Example: run only the "click" test from elementActions
npx playwright test framework-tests/elementActions.spec.js -g "click - clicks button and triggers handler" --project=chromium

# Example: run only "waitForVisible" test
npx playwright test framework-tests/waitActions.spec.js -g "waitForVisible" --project=chromium

# Example: run all tests containing "upload"
npx playwright test -g "upload" --project=chromium
```

---

## Run Multiple Files at Once

```bash
# All wrapper tests together
npx playwright test framework-tests/waitActions.spec.js framework-tests/elementActions.spec.js framework-tests/keyboardActions.spec.js framework-tests/mouseActions.spec.js framework-tests/dragDropActions.spec.js framework-tests/uploadActions.spec.js framework-tests/frameActions.spec.js framework-tests/tableActions.spec.js --project=chromium

# All API tests together
npx playwright test framework-tests/apiInterceptor.spec.js framework-tests/schemaValidator.spec.js framework-tests/authHandler.spec.js framework-tests/requestBuilder.spec.js --project=chromium

# All infrastructure tests together
npx playwright test framework-tests/browserManager.spec.js framework-tests/contextManager.spec.js framework-tests/pageManager.spec.js framework-tests/storageManager.spec.js --project=chromium
```

---

## Useful Flags

| Flag | Description |
|------|-------------|
| `--project=chromium` | Run on chromium only |
| `--project=firefox` | Run on firefox only |
| `--project=webkit` | Run on webkit only |
| `--headed` | Show browser window |
| `--debug` | Open Playwright Inspector for step-through debugging |
| `-g "pattern"` | Run only tests matching the pattern |
| `--workers=1` | Run tests sequentially (useful for debugging) |
| `--retries=0` | Disable retries |
| `--reporter=list` | Simple list output (no HTML report) |
| `--trace on` | Record trace for every test (viewable with `npx playwright show-trace`) |
| `--update-snapshots` | Update visual baselines |

---

## View Reports

```bash
# Open the HTML report after a test run
npx playwright show-report

# View a trace file
npx playwright show-trace test-results/<test-folder>/trace.zip
```
