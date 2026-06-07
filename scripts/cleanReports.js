#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";

const ROOT = path.resolve(process.cwd());

const DIRS_TO_CLEAN = [
  "reports",
  "allure-results",
  "allure-report",
  "playwright-report",
  "test-results",
  "blob-report",
];

let cleaned = 0;

console.log("\n🧹 Cleaning report directories...\n");

for (const dir of DIRS_TO_CLEAN) {
  const fullPath = path.join(ROOT, dir);
  if (fs.existsSync(fullPath)) {
    fs.removeSync(fullPath);
    fs.ensureDirSync(fullPath);
    console.log(`  ✔ Cleaned ${dir}/`);
    cleaned++;
  } else {
    console.log(`  – Skipped ${dir}/ (not found)`);
  }
}

console.log(`\n✅ Done — ${cleaned} director${cleaned === 1 ? "y" : "ies"} cleaned\n`);
