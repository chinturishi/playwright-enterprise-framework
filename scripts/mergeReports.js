#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

const ROOT = path.resolve(process.cwd());
const BLOB_DIR = path.join(ROOT, "blob-report");
const OUTPUT_DIR = path.join(ROOT, "playwright-report");

function mergeWithCli() {
  console.log("\n📊 Merging shard reports...\n");

  if (!fs.existsSync(BLOB_DIR)) {
    console.error(`❌ blob-report/ directory not found at ${BLOB_DIR}`);
    process.exit(1);
  }

  const blobs = fs.readdirSync(BLOB_DIR).filter((f) => f.endsWith(".zip") || f.endsWith(".jsonl"));
  if (!blobs.length) {
    console.error("❌ No report blobs found in blob-report/");
    process.exit(1);
  }
  console.log(`  Found ${blobs.length} shard blob(s)`);

  fs.ensureDirSync(OUTPUT_DIR);

  try {
    execSync(`npx playwright merge-reports --reporter=html "${BLOB_DIR}"`, {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, PLAYWRIGHT_HTML_REPORT: OUTPUT_DIR },
    });
    console.log(`\n✅ Merged report written to ${OUTPUT_DIR}\n`);
  } catch (err) {
    console.error(`❌ Merge failed: ${err.message}`);
    process.exit(1);
  }
}

mergeWithCli();
