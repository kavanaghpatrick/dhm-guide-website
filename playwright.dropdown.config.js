// Dedicated Playwright config for the L3 dropdown-overlap repro suite.
// Runs against PRODUCTION (https://www.dhmguide.com) — no local dev server.
//
// Usage:
//   npx playwright test --config=playwright.dropdown.config.js

import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://www.dhmguide.com';

export default defineConfig({
  testDir: './tests',
  testMatch: /dropdown-overlap-repro\.spec\.js/,
  fullyParallel: false, // serial so logs are readable
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    trace: 'off',
    screenshot: 'off', // we manage screenshots manually
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
