import { fileURLToPath } from 'url'
import { defineConfig, devices } from '@playwright/test'

// 与配置文件同目录作为前端根目录，避免硬编码 /mnt/d/... 导致 WSL/不同机器上启动失败
const frontendRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  testDir: './',
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
