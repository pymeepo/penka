import { defineConfig, devices } from '@playwright/test';
import { SITE_URL } from './site.config.mjs';

const PORT = 4322;
const base = new URL(SITE_URL).pathname; // '/penka/'

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${base}`,
    trace: 'retain-on-failure',
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
  },
  projects: [
    {
      name: 'mobile',
      // Pixel 7 profile on Chromium: 412×915, touch, mobile UA.
      use: { ...devices['Pixel 7'] },
    },
  ],
  // Tests run against the production build (npm run build first).
  webServer: {
    command: `npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}${base}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
