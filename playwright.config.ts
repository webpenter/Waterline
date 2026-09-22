import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // tests/int/** are Vitest integration specs, not Playwright.
  testIgnore: ['**/int/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One local retry: dev-mode compile storms make the first hit on a heavy
  // route contend across workers; CI (production-like, workers=1) keeps 2.
  retries: process.env.CI ? 2 : 1,
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
    // /en compiles the heaviest tree and completes the first (slow) Payload
    // connection attempt, arming the fail-fast cooldown before tests start.
    url: 'http://localhost:3000/en',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
