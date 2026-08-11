import { defineConfig, devices } from '@playwright/test';

const port = 4173;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}/dia-a-dia-ens/`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'android-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'iphone-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command:
      'VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=test-anon-key npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: `http://127.0.0.1:${port}/dia-a-dia-ens/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
