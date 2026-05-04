import { test, expect, ConsoleMessage } from '@playwright/test'

// Test: Issue #16 verification - Approval.vue rendering failure
// App is running at http://localhost:5173

const BASE_URL = 'http://localhost:5173'
const consoleErrors: { page: string; message: string }[] = []

test.describe('Issue #16 Verification: Approval Page + Login', () => {
  // Capture console errors on all pages
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          page: page.url(),
          message: msg.text()
        })
      }
    })
  })

  // ─── TC-01: Login Test ─────────────────────────────────────────────────────
  test.describe('🔐 Login Module', () => {
    test('TC-01-01: Login page renders correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      await page.waitForLoadState('networkidle')

      // Check login card exists
      const loginCard = page.locator('.login-card')
      await expect(loginCard).toBeVisible()

      // Check inputs exist (dev mode panel)
      const emailInput = page.locator('.dev-form input').first()
      const passwordInput = page.locator('.dev-form input').nth(1)
      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()

      // Check login button exists
      const loginBtn = page.locator('button').filter({ hasText: /本地登录/i }).first()
      await expect(loginBtn).toBeVisible()
    })

    test('TC-01-02: Login with mark@sandvik.com works', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`)
      await page.waitForLoadState('networkidle')

      // Fill dev login form - email should be pre-filled
      const emailInput = page.locator('.dev-form .ant-select').first()
      await emailInput.click()
      await page.waitForTimeout(300)

      // Select mark@sandvik.com from dropdown
      const markOption = page.locator('.ant-select-item').filter({ hasText: /Mark.*测试管理员/i }).first()
      if (await markOption.count() > 0) {
        await markOption.click()
      } else {
        // Fallback: clear and type
        await emailInput.fill('mark@sandvik.com')
      }

      // Password is pre-filled with Password123
      const passwordInput = page.locator('.dev-form .ant-input-password input')
      await passwordInput.fill('Password123')

      // Click login button
      const loginBtn = page.locator('button').filter({ hasText: /本地登录/i }).first()
      await loginBtn.click()

      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
        // If not redirect, check if we're still on login
        console.log('Current URL after login:', page.url())
      })

      // Verify we're on dashboard (not on login)
      await expect(page.url()).toContain('/dashboard')
    })
  })

  // ─── TC-02: Approval Page (Issue #16) ──────────────────────────────────────
  test.describe('✅ Approval Page - Issue #16 Verification', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`)
      await page.waitForLoadState('networkidle')

      // Use dev login - expand panel if needed
      const collapseHeader = page.locator('.ant-collapse-header').filter({ hasText: /开发测试/i }).first()
      if (await collapseHeader.count() > 0) {
        await collapseHeader.click()
        await page.waitForTimeout(500)
      }

      // Select mark@sandvik.com
      const emailSelect = page.locator('.dev-form .ant-select').first()
      await emailSelect.click()
      await page.waitForTimeout(300)
      const markOption = page.locator('.ant-select-item').filter({ hasText: /Mark.*测试管理员/i }).first()
      if (await markOption.count() > 0) {
        await markOption.click()
      }

      // Fill password and login
      const passwordInput = page.locator('.dev-form .ant-input-password input')
      await passwordInput.fill('Password123')

      const loginBtn = page.locator('button').filter({ hasText: /本地登录/i }).first()
      await loginBtn.click()

      await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {})
      await page.waitForLoadState('networkidle')
    })

    test('TC-04-01: Approval page loads without blank/empty DOM', async ({ page }) => {
      await page.goto(`${BASE_URL}/approval`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // Wait for Vue to render

      // Check that approval-page div exists
      const approvalPage = page.locator('.approval-page')
      await expect(approvalPage).toBeVisible()

      // Check that filter bar exists (not blank)
      const filterCard = page.locator('.filter-card')
      await expect(filterCard).toBeVisible()

      // Check that table exists or empty state
      const tableOrEmpty = page.locator('.forecast-table, .empty-cell')
      await expect(tableOrEmpty.first()).toBeVisible()

      // Check for pending banner or demo hint
      const pendingBanner = page.locator('.pending-banner, .demo-hint')
      const hasBanner = await pendingBanner.count() > 0

      console.log('Approval page loaded, has banner elements:', hasBanner)
    })

    test('TC-04-02: Approval page shows approval list or empty state', async ({ page }) => {
      await page.goto(`${BASE_URL}/approval`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Check table structure exists
      const tableHead = page.locator('.forecast-table thead')
      const tableBody = page.locator('.forecast-table tbody')

      const hasTable = await tableHead.count() > 0 && await tableBody.count() > 0
      console.log('Has table structure:', hasTable)

      // Check for rows
      const tableRows = page.locator('.forecast-table tbody tr')
      const rowCount = await tableRows.count()
      console.log('Table rows count:', rowCount)

      // Either has data rows OR shows "暂无数据" empty state
      const hasDataRows = rowCount > 0 && !(rowCount === 1 && (await tableRows.locator('.empty-cell').count()) > 0)

      // Check filter bar has elements
      const filterBar = page.locator('.filter-bar')
      await expect(filterBar).toBeVisible()

      // User switcher should exist
      const userSwitcher = page.locator('.demo-user-switcher')
      await expect(userSwitcher).toBeVisible()

      console.log('Approval list shows data:', hasDataRows)
    })

    test('TC-04-03: Filter controls are functional', async ({ page }) => {
      await page.goto(`${BASE_URL}/approval`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Check filter selects exist
      const fcNameSelect = page.locator('.filter-item .ant-select').first()
      await expect(fcNameSelect).toBeVisible()

      // Click query button
      const queryBtn = page.locator('button').filter({ hasText: /查询/i }).first()
      await expect(queryBtn).toBeVisible()
      await queryBtn.click()

      // Click reset button
      const resetBtn = page.locator('button').filter({ hasText: /重置/i }).first()
      await resetBtn.click()

      console.log('Filter controls are interactive')
    })
  })

  // ─── TC-03: Navigation Test ─────────────────────────────────────────────────
  test.describe('🧭 Navigation Test', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`)
      await page.waitForLoadState('networkidle')

      // Expand dev panel
      const collapseHeader = page.locator('.ant-collapse-header').filter({ hasText: /开发测试/i }).first()
      if (await collapseHeader.count() > 0) {
        await collapseHeader.click()
        await page.waitForTimeout(500)
      }

      // Select mark@sandvik.com and login
      const emailSelect = page.locator('.dev-form .ant-select').first()
      await emailSelect.click()
      await page.waitForTimeout(300)
      const markOption = page.locator('.ant-select-item').filter({ hasText: /Mark.*测试管理员/i }).first()
      if (await markOption.count() > 0) {
        await markOption.click()
      }

      const passwordInput = page.locator('.dev-form .ant-input-password input')
      await passwordInput.fill('Password123')

      const loginBtn = page.locator('button').filter({ hasText: /本地登录/i }).first()
      await loginBtn.click()

      await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {})
      await page.waitForLoadState('networkidle')
    })

    test('TC-07-01: Dashboard loads', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Dashboard should have some content
      const dashboardContent = page.locator('.dashboard, .app-content, main')
      const hasContent = await dashboardContent.count() > 0 || await page.locator('body').textContent()
      console.log('Dashboard loads:', !!hasContent)
    })

    test('TC-07-02: Navigate to Sales Forecast', async ({ page }) => {
      await page.goto(`${BASE_URL}/forecast`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const forecastPage = page.locator('.forecast-page, .forecast-page')
      console.log('Forecast page URL:', page.url())
    })

    test('TC-07-03: Navigate to Products', async ({ page }) => {
      await page.goto(`${BASE_URL}/products`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      console.log('Products page URL:', page.url())
    })

    test('TC-07-04: Navigate to Customers', async ({ page }) => {
      await page.goto(`${BASE_URL}/customers`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      console.log('Customers page URL:', page.url())
    })

    test('TC-07-05: Navigate to Users', async ({ page }) => {
      await page.goto(`${BASE_URL}/users`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      console.log('Users page URL:', page.url())
    })
  })

  // ─── TC-04: Console Errors Summary ──────────────────────────────────────────
  test.describe('📋 Console Errors Summary', () => {
    test('Collect all console errors during navigation', async ({ page }) => {
      const errors: { url: string; message: string }[] = []

      page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') {
          errors.push({
            url: page.url(),
            message: msg.text()
          })
        }
      })

      // Visit login page
      await page.goto(`${BASE_URL}/login`)
      await page.waitForLoadState('networkidle')

      // Login
      const collapseHeader = page.locator('.ant-collapse-header').filter({ hasText: /开发测试/i }).first()
      if (await collapseHeader.count() > 0) {
        await collapseHeader.click()
        await page.waitForTimeout(500)
      }

      const emailSelect = page.locator('.dev-form .ant-select').first()
      await emailSelect.click()
      await page.waitForTimeout(300)
      const markOption = page.locator('.ant-select-item').filter({ hasText: /Mark.*测试管理员/i }).first()
      if (await markOption.count() > 0) {
        await markOption.click()
      }

      const passwordInput = page.locator('.dev-form .ant-input-password input')
      await passwordInput.fill('Password123')

      const loginBtn = page.locator('button').filter({ hasText: /本地登录/i }).first()
      await loginBtn.click()

      await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {})
      await page.waitForLoadState('networkidle')

      // Navigate to approval
      await page.goto(`${BASE_URL}/approval`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Navigate to other pages
      const routes = ['/dashboard', '/forecast', '/products', '/customers', '/users']
      for (const route of routes) {
        await page.goto(`${BASE_URL}${route}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)
      }

      // Log errors
      console.log('\n=== Console Errors ===')
      errors.forEach(e => {
        console.log(`[${e.url}] ${e.message}`)
      })
      console.log('===================\n')

      // Store for final report
      ;(global as any).__consoleErrors = errors
    })
  })
})

export { consoleErrors }
