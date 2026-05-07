import { test, expect } from '@playwright/test'

test.describe('登录流程', () => {
  test.beforeEach(async ({ page }) => {
    // 强制清理 localStorage 确保干净状态
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('本地登录成功后跳转 Dashboard', async ({ page }) => {
    // 1. 打开页面，找到 Dev 折叠面板（默认已展开）
    await expect(page.locator('.dev-collapse')).toBeVisible()

    // 2. 选择测试用户
    await page.locator('.dev-collapse .ant-select').click()
    await page.locator('.ant-select-dropdown .ant-select-item').first().click()

    // 3. 输入任意密码
    await page.locator('.dev-collapse input[type="password"]').fill('Password123')

    // 4. 点击登录
    await page.locator('.dev-collapse button:has-text("本地登录")').click()

    // 5. 等待跳转或 Dashboard 页面出现
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // 6. 验证 Dashboard 内容可见
    await expect(page.locator('body')).not.toHaveURL(/\/login/)
    await expect(page.locator('.page-container, .ant-layout, [class*="dashboard"]')).toBeVisible({ timeout: 5000 })
  })

  test('登录失败显示错误提示', async ({ page }) => {
    await expect(page.locator('.dev-collapse')).toBeVisible()

    // 输入错误密码
    await page.locator('.dev-collapse input[type="password"]').fill('wrongpassword')
    await page.locator('.dev-collapse button:has-text("本地登录")').click()

    // 应该出现 error message
    await expect(page.locator('.ant-message-error')).toBeVisible({ timeout: 5000 })
  })
})
