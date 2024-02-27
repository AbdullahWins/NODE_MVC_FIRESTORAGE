// puppeteer.config.js

const path = require("path");

module.exports = {
  launch: {
    headless: true, // Run in headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for running in a container
    executablePath: process.env.CHROME_BIN || null, // Set Chrome binary path if needed
  },
  browser: "chromium", // Use Chromium browser
  ignoreHTTPSErrors: true, // Ignore HTTPS errors
  defaultViewport: null, // Use default viewport settings
  timeout: 30000, // Set timeout to 30 seconds
  cacheDirectory: path.join(__dirname, ".cache", "puppeteer"), // Custom cache directory
};
