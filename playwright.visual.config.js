// Dedicated Playwright config for the design-modernization VISUAL-REGRESSION suite.
//
// Why a separate config?
//   These specs pin the *pixel* appearance of the flag-gated "modern" A/B
//   variant (and prove CONTROL is byte-identical / unchanged). They run against
//   a LOCAL dev server (pnpm dev on :5173) so we screenshot the exact built
//   variant code, and they live in their own ./tests/visual directory so the
//   main `pnpm test:e2e` run never trips over (intentionally) missing baselines.
//
//   Structure mirrors playwright.affiliate.config.js, but ADDS:
//     - a webServer (pnpm dev) — visual baselines must come from local code
//     - testDir ./tests/visual + testMatch /\.visual\.spec\.js$/
//     - Desktop Chrome + Pixel 5 projects (desktop & mobile baselines)
//     - deterministic rendering: reduced motion, forced light scheme
//     - a tight toHaveScreenshot tolerance so real regressions aren't masked
//
// Usage:
//   pnpm test:visual                 # run against committed baselines
//   pnpm test:visual:update          # (re)generate baselines after an approved change
//   npx playwright test --config=playwright.visual.config.js

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  testMatch: /\.visual\.spec\.js$/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  timeout: 45_000,
  // Screenshot comparison tolerance lives here so every visual spec inherits it.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
      // Give the element-stability wait headroom on slower CI runners (long,
      // lazy-loading pages like the blog hub keep reflowing past the 5s default).
      timeout: 20_000,
    },
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Deterministic rendering for stable pixel baselines.
    reducedMotion: 'reduce',
    colorScheme: 'light',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
