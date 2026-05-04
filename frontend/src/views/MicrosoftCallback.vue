<template>
  <div class="callback-page">
    <a-spin size="large" tip="正在处理登录，请稍候..." />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

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

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || '登录失败')
    }

    // Store the auth data
    authStore.setAuth(data.data.token, {
      id: '',
      username: data.data.displayName,
      email: data.data.displayName, // DisplayName is used as name
      name: data.data.displayName,
      role: data.data.role,
      avatar: data.data.displayName.charAt(0).toUpperCase()
    })

    message.success('登录成功')
    
    // Redirect to dashboard or the requested return URL
    const returnUrl = data.returnUrl || '/dashboard'
    router.push(returnUrl)
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
