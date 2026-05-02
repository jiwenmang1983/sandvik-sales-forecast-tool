import { fileURLToPath } from 'url'
import { defineConfig, devices } from '@playwright/test'

const e2eDir = fileURLToPath(new URL('.', import.meta.url))
const frontendRoot = fileURLToPath(new URL('../../frontend', import.meta.url))

export default defineConfig({
  testDir: e2eDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    cwd: frontendRoot,
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
