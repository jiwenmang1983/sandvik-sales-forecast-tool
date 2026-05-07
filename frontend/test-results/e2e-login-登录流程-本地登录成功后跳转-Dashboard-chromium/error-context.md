# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/login.spec.ts >> 登录流程 >> 本地登录成功后跳转 Dashboard
- Location: e2e/login.spec.ts:11:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img "Sandvik Logo" [ref=e6]
    - heading "China Division Sales Forecast Tool" [level=1] [ref=e7]:
      - text: China Division
      - text: Sales Forecast Tool
    - list [ref=e8]:
      - listitem [ref=e9]:
        - generic [ref=e10]: ✓
        - generic [ref=e11]: Supports multi-tier approval and refined data review for sales forecasting
      - listitem [ref=e12]:
        - generic [ref=e13]: ✓
        - generic [ref=e14]: Implements role-based access control with product-level permission limits
      - listitem [ref=e15]:
        - generic [ref=e16]: ✓
        - generic [ref=e17]: Provides configurable and flexible forecast submission windows
      - listitem [ref=e18]:
        - generic [ref=e19]: ✓
        - generic [ref=e20]: Delivers data analysis and visualization through PowerBI reports
      - listitem [ref=e21]:
        - generic [ref=e22]: ✓
        - generic [ref=e23]: Automates data aggregation and enhances sales forecasting efficiency
    - generic [ref=e24]: © 2026 Sandvik Group. All rights reserved.
  - generic [ref=e26]:
    - heading "统一身份登录" [level=2] [ref=e27]
    - paragraph [ref=e28]: 通过 Microsoft 365 单点登录进入系统
    - generic [ref=e29]:
      - button "使用 SSO 登录（sandvik 域） 测试模式可用" [ref=e30] [cursor=pointer]:
        - generic [ref=e31]: 使用 SSO 登录（sandvik 域）
        - generic [ref=e32]: 测试模式可用
      - button "使用 SSO 登录（AHNO 域）" [ref=e33] [cursor=pointer]:
        - generic [ref=e34]: 使用 SSO 登录（AHNO 域）
      - separator [ref=e35]:
        - generic [ref=e36]: 或
      - button "🔹 Sign in with Microsoft" [ref=e37] [cursor=pointer]:
        - generic [ref=e38]: 🔹
        - generic [ref=e39]: Sign in with Microsoft
    - generic [ref=e41]:
      - button "right 🔧 开发测试 - 本地登录" [expanded] [ref=e42] [cursor=pointer]:
        - img "right" [ref=e44]:
          - img [ref=e45]
        - generic [ref=e47]: 🔧 开发测试 - 本地登录
      - generic [ref=e49]:
        - generic [ref=e50]: ⚠️ 测试环境 - 使用本地登录
        - generic [ref=e52]:
          - generic [ref=e54]:
            - generic "测试用户" [ref=e56]
            - generic [ref=e60] [cursor=pointer]:
              - generic [ref=e61]:
                - combobox [ref=e63]
                - generic "Mark (测试管理员)" [ref=e64]
              - generic:
                - img:
                  - img
          - generic [ref=e66]:
            - generic "密码" [ref=e68]
            - generic [ref=e72]:
              - textbox "输入密码（可随意）" [ref=e73]: Password123
              - img "eye-invisible" [ref=e75] [cursor=pointer]:
                - img [ref=e76]
          - button "本地登录" [active] [ref=e84] [cursor=pointer]:
            - generic [ref=e85]: 本地登录
    - generic [ref=e86]:
      - text: 忘记密码？联系
      - link "IT Service Desk" [ref=e87] [cursor=pointer]:
        - /url: mailto:it-servicedesk@sandvik.com
    - separator [ref=e88]
    - paragraph [ref=e89]: 登录即代表您同意公司信息安全与数据合规政策。
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('登录流程', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // 强制清理 localStorage 确保干净状态
  6  |     await page.goto('/')
  7  |     await page.evaluate(() => localStorage.clear())
  8  |     await page.reload()
  9  |   })
  10 | 
  11 |   test('本地登录成功后跳转 Dashboard', async ({ page }) => {
  12 |     // 1. 打开页面，找到 Dev 折叠面板（默认已展开）
  13 |     await expect(page.locator('.dev-collapse')).toBeVisible()
  14 | 
  15 |     // 2. 选择测试用户
  16 |     await page.locator('.dev-collapse .ant-select').click()
  17 |     await page.locator('.ant-select-dropdown .ant-select-item').first().click()
  18 | 
  19 |     // 3. 输入任意密码
  20 |     await page.locator('.dev-collapse input[type="password"]').fill('Password123')
  21 | 
  22 |     // 4. 点击登录
  23 |     await page.locator('.dev-collapse button:has-text("本地登录")').click()
  24 | 
  25 |     // 5. 等待跳转或 Dashboard 页面出现
> 26 |     await page.waitForURL('**/dashboard', { timeout: 10000 })
     |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  27 | 
  28 |     // 6. 验证 Dashboard 内容可见
  29 |     await expect(page.locator('body')).not.toHaveURL(/\/login/)
  30 |     await expect(page.locator('.page-container, .ant-layout, [class*="dashboard"]')).toBeVisible({ timeout: 5000 })
  31 |   })
  32 | 
  33 |   test('登录失败显示错误提示', async ({ page }) => {
  34 |     await expect(page.locator('.dev-collapse')).toBeVisible()
  35 | 
  36 |     // 输入错误密码
  37 |     await page.locator('.dev-collapse input[type="password"]').fill('wrongpassword')
  38 |     await page.locator('.dev-collapse button:has-text("本地登录")').click()
  39 | 
  40 |     // 应该出现 error message
  41 |     await expect(page.locator('.ant-message-error')).toBeVisible({ timeout: 5000 })
  42 |   })
  43 | })
  44 | 
```