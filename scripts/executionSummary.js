#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";

const ROOT = path.resolve(process.cwd());
const args = process.argv.slice(2);
const resultsPath = args[0] || path.join(ROOT, "test-results", "results.json");
const summaryOut = args[1] || path.join(ROOT, "reports", "summary.json");

function readResults() {
  if (!fs.existsSync(resultsPath)) {
    console.error(`❌ Results file not found: ${resultsPath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
}

function computeSummary(data) {
  const suites = data.suites || [];
  let total = 0, passed = 0, failed = 0, skipped = 0, flaky = 0, duration = 0;

  function walk(items) {
    for (const item of items) {
      if (item.suites) walk(item.suites);
      for (const spec of item.specs || []) {
        for (const test of spec.tests || []) {
          total++;
          duration += test.results?.reduce((sum, r) => sum + (r.duration || 0), 0) || 0;
          const status = test.status || test.expectedStatus;
          if (status === "expected" || status === "passed") passed++;
          else if (status === "unexpected" || status === "failed") failed++;
          else if (status === "skipped") skipped++;
          if (test.status === "flaky") { flaky++; passed++; total++; }
        }
      }
    }
  }

  walk(suites);
  if (data.stats) {
    total = data.stats.expected + (data.stats.unexpected || 0) + (data.stats.skipped || 0) + (data.stats.flaky || 0);
    passed = data.stats.expected || passed;
    failed = data.stats.unexpected || failed;
    skipped = data.stats.skipped || skipped;
    flaky = data.stats.flaky || flaky;
    duration = data.stats.duration || duration;
  }

  return { total, passed, failed, skipped, flaky, duration };
}

function printTable(summary) {
  const passRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : "0.0";
  const dur = (summary.duration / 1000).toFixed(1);

  console.log("\n┌─────────────────────────────────────┐");
  console.log("│        Execution Summary             │");
  console.log("├──────────────┬──────────────────────┤");
  console.log(`│ Total        │ ${String(summary.total).padEnd(20)} │`);
  console.log(`│ Passed       │ ${String(summary.passed).padEnd(20)} │`);
  console.log(`│ Failed       │ ${String(summary.failed).padEnd(20)} │`);
  console.log(`│ Skipped      │ ${String(summary.skipped).padEnd(20)} │`);
  console.log(`│ Flaky        │ ${String(summary.flaky).padEnd(20)} │`);
  console.log(`│ Pass Rate    │ ${(passRate + "%").padEnd(20)} │`);
  console.log(`│ Duration     │ ${(dur + "s").padEnd(20)} │`);
  console.log("└──────────────┴──────────────────────┘\n");
}

try {
  const data = readResults();
  const summary = computeSummary(data);
  printTable(summary);

  fs.ensureDirSync(path.dirname(summaryOut));
  fs.writeJsonSync(summaryOut, { ...summary, timestamp: new Date().toISOString() }, { spaces: 2 });
  console.log(`📄 Summary written to ${path.relative(ROOT, summaryOut)}\n`);
} catch (err) {
  console.error(`❌ Failed to generate summary: ${err.message}`);
  process.exit(1);
}
