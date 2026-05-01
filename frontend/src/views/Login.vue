<template>
  <div class="login-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <img
        class="logo"
        src="https://www.home.sandvik/logo/logo_dark.svg"
        alt="Sandvik Logo"
        @error="e => e.target.style.display='none'"
      >
      <h1 class="title">China Division<br>Sales Forecast Tool</h1>

      <ul class="feature-list">
        <li>
          <span class="check-icon">✓</span>
          <span>Supports multi-tier approval and refined data review for sales forecasting</span>
        </li>
        <li>
          <span class="check-icon">✓</span>
          <span>Implements role-based access control with product-level permission limits</span>
        </li>
        <li>
          <span class="check-icon">✓</span>
          <span>Provides configurable and flexible forecast submission windows</span>
        </li>
        <li>
          <span class="check-icon">✓</span>
          <span>Delivers data analysis and visualization through PowerBI reports</span>
        </li>
        <li>
          <span class="check-icon">✓</span>
          <span>Automates data aggregation and enhances sales forecasting efficiency</span>
        </li>
      </ul>

      <div class="footer">
        &copy; 2026 Sandvik Group. All rights reserved.
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="login-card">
        <h2>统一身份登录</h2>
        <p class="subtitle">通过 Microsoft 365 单点登录进入系统</p>

        <div class="sso-buttons">
          <a-button
            type="primary"
            size="large"
            block
            :loading="sandvikLoading"
            @click="handleSandvikLogin"
          >
            使用 SSO 登录（sandvik 域）
          </a-button>
          <a-button
            size="large"
            block
            :loading="ahnoLoading"
            @click="handleAhnoLogin"
          >
            使用 SSO 登录（AHNO 域）
          </a-button>
        </div>

        <div class="forgot-password">
          忘记密码？联系 <a href="mailto:it-servicedesk@sandvik.com">IT Service Desk</a>
        </div>

        <a-divider />

        <p class="disclaimer">
          登录即代表您同意公司信息安全与数据合规政策。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '../store/auth'
import { login } from '../api/auth'

const router = useRouter()
const authStore = useAuthStore()

const sandvikLoading = ref(false)
const ahnoLoading = ref(false)

const handleSandvikLogin = async () => {
  sandvikLoading.value = true
  try {
    const result = await login('sandvik')
    authStore.setAuth(result.token, result.user)
    message.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    message.error('登录失败，请重试')
  } finally {
    sandvikLoading.value = false
  }
}

const handleAhnoLogin = async () => {
  ahnoLoading.value = true
  try {
    const result = await login('ahno')
    authStore.setAuth(result.token, result.user)
    message.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    message.error('登录失败，请重试')
  } finally {
    ahnoLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  width: 100%;
}

.left-panel {
  width: 45%;
  background-color: var(--sandvik-blue, #0D3D92);
  padding: 48px;
  display: flex;
  flex-direction: column;
  color: #FFFFFF;
  position: relative;
}

.left-panel .logo {
  width: 120px;
  height: auto;
  margin-bottom: 48px;
}

.left-panel .title {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 48px;
  color: #FFFFFF;
}

.feature-list {
  list-style: none;
  flex: 1;
}

.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
}

.check-icon {
  font-size: 18px;
  color: #F5A623;
  flex-shrink: 0;
  margin-top: 2px;
}

.left-panel .footer {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 20px;
}

.right-panel {
  width: 55%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1F2937;
  text-align: center;
  margin-bottom: 8px;
}

.login-card .subtitle {
  font-size: 14px;
  color: #6B7280;
  text-align: center;
  margin-bottom: 32px;
}

.sso-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.forgot-password {
  text-align: center;
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 20px;
}

.forgot-password a {
  color: #0D3D92;
  text-decoration: none;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.disclaimer {
  font-size: 12px;
  color: #6B7280;
  text-align: center;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    min-height: auto;
    padding: 32px 24px;
  }

  .left-panel .title {
    font-size: 22px;
    margin-bottom: 24px;
  }

  .left-panel .logo {
    width: 100px;
    margin-bottom: 24px;
  }

  .feature-list li {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .right-panel {
    width: 100%;
    padding: 32px 24px;
  }
}
</style>
