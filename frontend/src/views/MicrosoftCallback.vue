<template>
  <div class="callback-page">
    <a-spin size="large" tip="正在处理登录，请稍候..." />
  </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

function getUserIdFromAccessToken(token) {
  try {
    const b64 = token.split('.')[1]
    const json = JSON.parse(atob(b64.replace(/-/g, '+').replace(/_/g, '/')))
    const idKey = Object.keys(json).find(k => /nameidentifier$/i.test(k) || k === 'sub')
    return idKey ? String(json[idKey]) : ''
  } catch {
    return ''
  }
}

onMounted(async () => {
  // Get the code and state from URL query parameters
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const error = params.get('error')
  const errorDescription = params.get('error_description')

  // Handle error from Microsoft
  if (error) {
    message.error(`登录失败: ${errorDescription || error}`)
    router.push('/login')
    return
  }

  if (!code) {
    message.error('未收到授权码，请重试')
    router.push('/login')
    return
  }

  try {
    // Call backend to exchange code for token
    const response = await fetch('/api/auth/microsoft/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, state })
    })

    const raw = await response.text()
    let payload = {}
    try {
      payload = raw ? JSON.parse(raw) : {}
    } catch {
      throw new Error('SSO 回调返回非 JSON')
    }

    // 兼容 ApiStandardResponseFilter：{ code, message, data }；也兼容未包装的 { success, data }
    const code = Number(payload.code)
    const inner = payload.data ?? {}
    const token = inner.token ?? inner.Token
    const okWrapped = response.ok && code === 0 && token
    const okLegacy = response.ok && payload.success && token
    if (!okWrapped && !okLegacy) {
      throw new Error(payload.message || inner?.message || '登录失败')
    }

    authStore.setAuth(token, {
      id: getUserIdFromAccessToken(token),
      username: inner.displayName ?? inner.DisplayName,
      email: inner.email ?? inner.Email ?? inner.displayName,
      name: inner.displayName ?? inner.DisplayName,
      role: inner.role ?? inner.Role,
      avatar: (inner.displayName || 'U').toString().charAt(0).toUpperCase()
    }, inner.refreshToken ?? inner.RefreshToken)

    message.success('登录成功')
    await nextTick()
    const returnUrl = payload.returnUrl || inner.returnUrl || '/dashboard'
    const target = typeof returnUrl === 'string' && returnUrl.startsWith('/') ? returnUrl : '/dashboard'
    try {
      if (target === '/dashboard' || target === '') {
        await router.replace({ name: 'Dashboard' })
      } else {
        await router.replace(target)
      }
    } catch (e) {
      console.warn('[SSO] router.replace 失败，使用 hash 跳转', e)
      const hashPath = target.startsWith('/') ? target : `/${target}`
      window.location.replace(`${window.location.origin}${window.location.pathname.split('#')[0]}#${hashPath}`)
    }
  } catch (err) {
    console.error('Microsoft SSO callback error:', err)
    message.error(err.message || 'SSO登录失败，请重试')
    router.push('/login')
  }
})
</script>

<style scoped>
.callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
}
</style>
