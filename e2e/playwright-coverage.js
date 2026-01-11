const { test } = require("@playwright/test");
const fs = require("fs/promises");
const path = require("path");

const TEMP_DIR = path.join(process.cwd(), "coverage", "temp");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function safeFileName(name) {
  return String(name)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .toLowerCase();
}

test.beforeEach(async ({ page, browserName }) => {
  if (browserName === "chromium") {
    await page.coverage.startJSCoverage({ 
      resetOnNavigation: false,
      reportAnonymousScripts: true 
    });
  }
});

test.afterEach(async ({ page, browserName }, testInfo) => {
  if (browserName !== "chromium") return;

  const coverage = await page.coverage.stopJSCoverage();

  await ensureDir(TEMP_DIR);

  const filePath = path.join(
    TEMP_DIR,
    `v8-coverage-${safeFileName(testInfo.title)}-${Date.now()}.json`
  );

  await fs.writeFile(filePath, JSON.stringify(coverage), "utf-8");
  console.log(`✓ Coverage saved: ${path.basename(filePath)}`);
});