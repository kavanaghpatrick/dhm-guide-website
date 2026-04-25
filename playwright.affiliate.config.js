// Dedicated Playwright config for the affiliate-tracking P0 regression suite.
//
// Why a separate config?
// The repo's main playwright.config.js auto-starts `pnpm run dev` so user-journey
// tests can hit localhost. The affiliate regression suite hits production
// (or a Vercel preview), so we don't need a local dev server. This config
// inherits the same patterns but skips the webServer step.
//
// Usage:
//   npx playwright test --config=playwright.affiliate.config.js
//   PLAYWRIGHT_BASE_URL=https://my-preview.vercel.app \
//     npx playwright test --config=playwright.affiliate.config.js

import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'https://www.dhmguide.com';

export default defineConfig({
  testDir: './tests',
  testMatch: /affiliate-tracking\.spec\.js/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'list',
  timeout: 45_000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Don't follow redirects forever or wait on CDN delays.
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer: tests run against production / preview deployments.
});
