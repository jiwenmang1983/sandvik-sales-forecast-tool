# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: issue-16-test.spec.ts >> Issue #16 Verification: Approval Page + Login >> ✅ Approval Page - Issue #16 Verification >> TC-04-01: Approval page loads without blank/empty DOM
- Location: issue-16-test.spec.ts:114:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.dev-form .ant-select').first()
    - locator resolved to <div data-v-08aaad4e="" class="ant-select ant-select-in-form-item css-dev-only-do-not-override-1p3hq3p ant-select-single ant-select-show-arrow ant-select-show-search">…</div>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    54 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

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
    - button "right 🔧 开发测试 - 本地登录" [active] [ref=e37] [cursor=pointer]:
      - img "right" [ref=e39]:
        - img [ref=e40]
      - generic [ref=e42]: 🔧 开发测试 - 本地登录
    - generic [ref=e43]:
      - text: 忘记密码？联系
      - link "IT Service Desk" [ref=e44] [cursor=pointer]:
        - /url: mailto:it-servicedesk@sandvik.com
    - separator [ref=e45]
    - paragraph [ref=e46]: 登录即代表您同意公司信息安全与数据合规政策。
```

# Test source

```ts
  1   | import { test, expect, ConsoleMessage } from '@playwright/test'
  2   | 
  3   | // Test: Issue #16 verification - Approval.vue rendering failure
  4   | // App is running at http://localhost:5173
  5   | 
  6   | const BASE_URL = 'http://localhost:5173'
  7   | const consoleErrors: { page: string; message: string }[] = []
  8   | 
  9   | test.describe('Issue #16 Verification: Approval Page + Login', () => {
  10  |   // Capture console errors on all pages
  11  |   test.beforeEach(async ({ page }) => {
  12  |     page.on('console', (msg: ConsoleMessage) => {
  13  |       if (msg.type() === 'error') {
  14  |         consoleErrors.push({
  15  |           page: page.url(),
  16  |           message: msg.text()
  17  |         })
  18  |       }
  19  |     })
  20  |   })
  21  | 
  22  |   // ─── TC-01: Login Test ─────────────────────────────────────────────────────
  23  |   test.describe('🔐 Login Module', () => {
  24  |     test('TC-01-01: Login page renders correctly', async ({ page }) => {
  25  |       await page.goto(`${BASE_URL}/login`)
  26  |       await page.waitForLoadState('networkidle')
  27  | 
  28  |       // Check login card exists
  29  |       const loginCard = page.locator('.login-card')
  30  |       await expect(loginCard).toBeVisible()
  31  | 
  32  |       // Check inputs exist (dev mode panel)
  33  |       const emailInput = page.locator('.dev-form input').first()
  34  |       const passwordInput = page.locator('.dev-form input').nth(1)
  35  |       await expect(emailInput).toBeVisible()
  36  |       await expect(passwordInput).toBeVisible()
  37  | 
  38  |       // Check login button exists
  39  |       const loginBtn = page.locator('button').filter({ hasText: /本地登录/i }).first()
  40  |       await expect(loginBtn).toBeVisible()
  41  |     })
  42  | 
  43  |     test('TC-01-02: Login with mark@sandvik.com works', async ({ page }) => {
  44  |       await page.goto(`${BASE_URL}/login`)
  45  |       await page.waitForLoadState('networkidle')
  46  | 
  47  |       // Fill dev login form - email should be pre-filled
  48  |       const emailInput = page.locator('.dev-form .ant-select').first()
  49  |       await emailInput.click()
  50  |       await page.waitForTimeout(300)
  51  | 
  52  |       // Select mark@sandvik.com from dropdown
  53  |       const markOption = page.locator('.ant-select-item').filter({ hasText: /Mark.*测试管理员/i }).first()
  54  |       if (await markOption.count() > 0) {
  55  |         await markOption.click()
  56  |       } else {
  57  |         // Fallback: clear and type
  58  |         await emailInput.fill('mark@sandvik.com')
  59  |       }
  60  | 
  61  |       // Password is pre-filled with Password123
  62  |       const passwordInput = page.locator('.dev-form .ant-input-password input')
  63  |       await passwordInput.fill('Password123')
  64  | 
  65  |       // Click login button
  66  |       const loginBtn = page.locator('button').filter({ hasText: /本地登录/i }).first()
  67  |       await loginBtn.click()
  68  | 
  69  |       // Wait for redirect to dashboard
  70  |       await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
  71  |         // If not redirect, check if we're still on login
  72  |         console.log('Current URL after login:', page.url())
  73  |       })
  74  | 
  75  |       // Verify we're on dashboard (not on login)
  76  |       await expect(page.url()).toContain('/dashboard')
  77  |     })
  78  |   })
  79  | 
  80  |   // ─── TC-02: Approval Page (Issue #16) ──────────────────────────────────────
  81  |   test.describe('✅ Approval Page - Issue #16 Verification', () => {
  82  |     test.beforeEach(async ({ page }) => {
  83  |       // Login first
  84  |       await page.goto(`${BASE_URL}/login`)
  85  |       await page.waitForLoadState('networkidle')
  86  | 
  87  |       // Use dev login - expand panel if needed
  88  |       const collapseHeader = page.locator('.ant-collapse-header').filter({ hasText: /开发测试/i }).first()
  89  |       if (await collapseHeader.count() > 0) {
  90  |         await collapseHeader.click()
  91  |         await page.waitForTimeout(500)
  92  |       }
  93  | 
  94  |       // Select mark@sandvik.com
  95  |       const emailSelect = page.locator('.dev-form .ant-select').first()
> 96  |       await emailSelect.click()
      |                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  97  |       await page.waitForTimeout(300)
  98  |       const markOption = page.locator('.ant-select-item').filter({ hasText: /Mark.*测试管理员/i }).first()
  99  |       if (await markOption.count() > 0) {
  100 |         await markOption.click()
  101 |       }
  102 | 
  103 |       // Fill password and login
  104 |       const passwordInput = page.locator('.dev-form .ant-input-password input')
  105 |       await passwordInput.fill('Password123')
  106 | 
  107 |       const loginBtn = page.locator('button').filter({ hasText: /本地登录/i }).first()
  108 |       await loginBtn.click()
  109 | 
  110 |       await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {})
  111 |       await page.waitForLoadState('networkidle')
  112 |     })
  113 | 
  114 |     test('TC-04-01: Approval page loads without blank/empty DOM', async ({ page }) => {
  115 |       await page.goto(`${BASE_URL}/approval`)
  116 |       await page.waitForLoadState('networkidle')
  117 |       await page.waitForTimeout(2000) // Wait for Vue to render
  118 | 
  119 |       // Check that approval-page div exists
  120 |       const approvalPage = page.locator('.approval-page')
  121 |       await expect(approvalPage).toBeVisible()
  122 | 
  123 |       // Check that filter bar exists (not blank)
  124 |       const filterCard = page.locator('.filter-card')
  125 |       await expect(filterCard).toBeVisible()
  126 | 
  127 |       // Check that table exists or empty state
  128 |       const tableOrEmpty = page.locator('.forecast-table, .empty-cell')
  129 |       await expect(tableOrEmpty.first()).toBeVisible()
  130 | 
  131 |       // Check for pending banner or demo hint
  132 |       const pendingBanner = page.locator('.pending-banner, .demo-hint')
  133 |       const hasBanner = await pendingBanner.count() > 0
  134 | 
  135 |       console.log('Approval page loaded, has banner elements:', hasBanner)
  136 |     })
  137 | 
  138 |     test('TC-04-02: Approval page shows approval list or empty state', async ({ page }) => {
  139 |       await page.goto(`${BASE_URL}/approval`)
  140 |       await page.waitForLoadState('networkidle')
  141 |       await page.waitForTimeout(2000)
  142 | 
  143 |       // Check table structure exists
  144 |       const tableHead = page.locator('.forecast-table thead')
  145 |       const tableBody = page.locator('.forecast-table tbody')
  146 | 
  147 |       const hasTable = await tableHead.count() > 0 && await tableBody.count() > 0
  148 |       console.log('Has table structure:', hasTable)
  149 | 
  150 |       // Check for rows
  151 |       const tableRows = page.locator('.forecast-table tbody tr')
  152 |       const rowCount = await tableRows.count()
  153 |       console.log('Table rows count:', rowCount)
  154 | 
  155 |       // Either has data rows OR shows "暂无数据" empty state
  156 |       const hasDataRows = rowCount > 0 && !(rowCount === 1 && (await tableRows.locator('.empty-cell').count()) > 0)
  157 | 
  158 |       // Check filter bar has elements
  159 |       const filterBar = page.locator('.filter-bar')
  160 |       await expect(filterBar).toBeVisible()
  161 | 
  162 |       // User switcher should exist
  163 |       const userSwitcher = page.locator('.demo-user-switcher')
  164 |       await expect(userSwitcher).toBeVisible()
  165 | 
  166 |       console.log('Approval list shows data:', hasDataRows)
  167 |     })
  168 | 
  169 |     test('TC-04-03: Filter controls are functional', async ({ page }) => {
  170 |       await page.goto(`${BASE_URL}/approval`)
  171 |       await page.waitForLoadState('networkidle')
  172 |       await page.waitForTimeout(1000)
  173 | 
  174 |       // Check filter selects exist
  175 |       const fcNameSelect = page.locator('.filter-item .ant-select').first()
  176 |       await expect(fcNameSelect).toBeVisible()
  177 | 
  178 |       // Click query button
  179 |       const queryBtn = page.locator('button').filter({ hasText: /查询/i }).first()
  180 |       await expect(queryBtn).toBeVisible()
  181 |       await queryBtn.click()
  182 | 
  183 |       // Click reset button
  184 |       const resetBtn = page.locator('button').filter({ hasText: /重置/i }).first()
  185 |       await resetBtn.click()
  186 | 
  187 |       console.log('Filter controls are interactive')
  188 |     })
  189 |   })
  190 | 
  191 |   // ─── TC-03: Navigation Test ─────────────────────────────────────────────────
  192 |   test.describe('🧭 Navigation Test', () => {
  193 |     test.beforeEach(async ({ page }) => {
  194 |       // Login first
  195 |       await page.goto(`${BASE_URL}/login`)
  196 |       await page.waitForLoadState('networkidle')
```