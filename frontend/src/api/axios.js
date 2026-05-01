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

// Response interceptor - handle errors and mock data mode
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else if (status === 403) {
        message.error('无权限访问')
      } else if (status === 404) {
        // API not available - switch to mock mode
        console.warn('API not available, using mock data')
        return { _mock: true, data: null }
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

export default request
export { API_BASE_URL }
