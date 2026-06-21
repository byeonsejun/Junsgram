import { defineConfig, devices } from '@playwright/test';

// Shared secret used both to mint Auth.js session cookies (tests/e2e/fixtures.ts)
// and by the app server below. Any value works as long as both sides match.
process.env.AUTH_SECRET ||= 'e2e-test-secret-not-used-in-production-000000';

// Dedicated test port so we never accidentally reuse a `next dev` server on 3000
// (whose AUTH_SECRET would differ from the one used to mint test session cookies).
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Production build so E2E exercises the same output that ships.
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      AUTH_SECRET: process.env.AUTH_SECRET,
      // The mocked flows never reach Google/Sanity, so placeholders are fine.
      GOOGLE_OAUTH_ID: 'dummy',
      GOOGLE_OAUTH_SECRET: 'dummy',
      SANITY_STUDIO_SANITY_PROJECT_ID: 'dummy',
      SANITY_STUDIO_SANITY_DATASET: 'production',
      SANITY_SECRET_TOKEN: 'dummy',
      ADMIN_ID: 'qustpwns93',
      NEXT_PUBLIC_ADMIN_ID: 'qustpwns93',
    },
  },
});
