#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

const ROOT = path.resolve(process.cwd());
const args = process.argv.slice(2);
const targetDir = args[0] || "tests";
const BASELINES_DIR = path.join(ROOT, "baselines");

console.log(`\n📸 Generating visual baselines from ${targetDir}/\n`);

if (!fs.existsSync(path.join(ROOT, targetDir))) {
  console.error(`❌ Directory not found: ${targetDir}/`);
  process.exit(1);
}

try {
  execSync(`npx playwright test "${targetDir}" --update-snapshots`, {
    cwd: ROOT,
    stdio: "inherit",
  });
} catch {
  console.warn("⚠ Some tests may have failed — snapshots are still updated where possible");
}

const snapshotsDir = path.join(ROOT, targetDir);
let copied = 0;

function collectSnapshots(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.endsWith(".spec.js-snapshots") || entry.name.endsWith(".spec.ts-snapshots")) {
        const dest = path.join(BASELINES_DIR, path.relative(snapshotsDir, full));
        fs.copySync(full, dest, { overwrite: true });
        const count = fs.readdirSync(full).length;
        copied += count;
        console.log(`  ✔ Copied ${count} snapshot(s) from ${entry.name}`);
      } else {
        collectSnapshots(full);
      }
    }
  }
}

fs.ensureDirSync(BASELINES_DIR);
collectSnapshots(snapshotsDir);
console.log(`\n✅ Baseline generation complete — ${copied} snapshot(s) in baselines/\n`);
