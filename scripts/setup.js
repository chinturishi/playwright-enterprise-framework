#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";

const ROOT = path.resolve(process.cwd());

function checkNodeVersion() {
  const [major] = process.versions.node.split(".").map(Number);
  if (major < 18) {
    console.error(`❌ Node.js v18+ required (current: ${process.version})`);
    process.exit(1);
  }
  console.log(`✔ Node.js ${process.version}`);
}

function installDependencies() {
  const nodeModules = path.join(ROOT, "node_modules");
  if (!fs.existsSync(nodeModules)) {
    console.log("📦 Installing npm dependencies...");
    execSync("npm install", { cwd: ROOT, stdio: "inherit" });
  } else {
    console.log("✔ node_modules present");
  }
}

function installPlaywright() {
  console.log("🎭 Installing Playwright browsers...");
  execSync("npx playwright install", { cwd: ROOT, stdio: "inherit" });
  console.log("✔ Playwright browsers installed");
}

function createDirectories() {
  const dirs = ["reports", "test-results", "allure-results"];
  for (const dir of dirs) {
    fs.ensureDirSync(path.join(ROOT, dir));
  }
  console.log("✔ Report directories created");
}

function createEnvExample() {
  const envExample = path.join(ROOT, ".env.example");
  if (!fs.existsSync(envExample)) {
    const content = [
      "# Environment",
      "BASE_URL=https://example.com",
      "ENV=dev",
      "",
      "# Credentials (do not commit real values)",
      "TEST_USER=",
      "TEST_PASSWORD=",
      "",
      "# Integrations",
      "JIRA_BASE_URL=",
      "JIRA_EMAIL=",
      "JIRA_API_TOKEN=",
      "SLACK_WEBHOOK_URL=",
      "BROWSERSTACK_USERNAME=",
      "BROWSERSTACK_ACCESS_KEY=",
    ].join("\n");
    fs.writeFileSync(envExample, content);
    console.log("✔ .env.example created");
  } else {
    console.log("✔ .env.example exists");
  }
}

try {
  console.log("\n🚀 Setting up Playwright Enterprise Framework\n");
  checkNodeVersion();
  installDependencies();
  installPlaywright();
  createDirectories();
  createEnvExample();
  console.log("\n✅ Setup complete! Run tests with: npx playwright test\n");
} catch (err) {
  console.error(`\n❌ Setup failed: ${err.message}`);
  process.exit(1);
}
