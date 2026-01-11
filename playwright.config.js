const { defineConfig } = require("@playwright/test");

const PORT = process.env.PORT || 5050;
const BASE_URL = process.env.APP_URL || `http://localhost:${PORT}`;

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  reporter: [["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  webServer: {
    command: "node index.js",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});