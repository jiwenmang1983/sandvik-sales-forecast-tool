import axios from 'axios'
import { message } from 'ant-design-vue'

const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Track ongoing token refresh to avoid multiple simultaneous refreshes
let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

// Request interceptor - add JWT token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 with token refresh
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is in progress, queue this request
        return new Promise(resolve => {
          subscribeTokenRefresh(newToken => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(request(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      const deviceId = localStorage.getItem('deviceId') || 'unknown'

      if (!refreshToken) {
        redirectToLogin()
        return Promise.reject(error)
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, deviceId })
        })
        const data = await response.json().catch(() => ({}))
        const code = Number(data.code)
        const inner = data.data ?? {}
        const newToken = inner.token ?? inner.Token
        const refreshOk =
          response.ok &&
          (code === 0 || data.success === true) &&
          typeof newToken === 'string' &&
          newToken.length > 0

        if (!refreshOk) {
          throw new Error('Token refresh failed')
        }

        localStorage.setItem('token', newToken)
        onTokenRefreshed(newToken)
        isRefreshing = false

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return request(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        refreshSubscribers = []
        redirectToLogin()
        return Promise.reject(refreshError)
      }
    }

    if (error.response) {
      const { status } = error.response
      if (status === 403) {
        message.error('无权限访问')
      } else if (status >= 500) {
        message.error('服务器错误')
      }
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Network error, using mock data')
      return { _mock: true, data: null }
    }

    return Promise.reject(error)
  }
)

function redirectToLogin() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('refreshToken')
  // Hash 路由：必须带 #，否则进入无 hash 的 URL 会与 Vue Router 不一致
  window.location.replace(`${window.location.origin}/#/login`)
}

export default request
export { API_BASE_URL }
