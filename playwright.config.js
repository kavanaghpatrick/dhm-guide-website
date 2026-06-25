import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Visual-regression specs run under playwright.visual.config.js (reduced-motion,
  // committed baselines). affiliate-tracking.spec.js is a PROD-targeted regression
  // suite (defaults to https://www.dhmguide.com) run via playwright.affiliate.config.js.
  // Keep both out of the default localhost behavior/e2e run.
  testIgnore: ['**/visual/**', '**/affiliate-tracking.spec.js'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Default every context to a SETTLED user (PostHog flag cached = 'control'), which
    // is the realistic steady state. The unified experiment wrapper renders a neutral
    // hold only while a flag is UNresolved (a brand-new visitor); seeding the cache lets
    // control specs paint control immediately, while ?exp_site-modern-v1=modern specs
    // still override to modern and the flicker spec seeds/clears its own state.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:5173',
          localStorage: [
            {
              name: 'ph_phc_BxeZzVX7gh2w23tsDyCAWViH5v3rRF9ipPNNQYNdkS4_posthog',
              value: JSON.stringify({ $enabled_feature_flags: { 'site-modern-v1': 'control' } }),
            },
          ],
        },
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
