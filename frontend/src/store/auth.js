import { ref, computed } from 'vue'

const token = ref(localStorage.getItem('token') || '')
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

export function useAuthStore() {
  const isLoggedIn = computed(() => !!token.value)

  function setAuth(newToken, newUser, newRefreshToken = null) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
    }
  }

  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
  }

  return {
    token,
    user,
    isLoggedIn,
    setAuth,
    clearAuth
  }
}

export default useAuthStore
