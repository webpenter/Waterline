import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // tests/int/** are Vitest integration specs, not Playwright.
  testIgnore: ['**/int/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Dev-mode compiles routes on first hit; the Payload-linked pages take well
  // over the 30s default on a cold .next. Generous timeouts keep the suite
  // honest about assertions instead of failing on compile latency.
  timeout: 90_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    navigationTimeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
