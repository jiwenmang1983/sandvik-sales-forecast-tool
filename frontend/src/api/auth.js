import request from './axios'

// Mock data for auth
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@sandvik.com', name: 'Admin User', role: '管理员', avatar: 'A' },
  { id: 2, username: 'zhangwei', email: 'zhang.wei@sandvik.com', name: '张伟', role: '销售', avatar: 'Z' },
  { id: 3, username: 'lina', email: 'li.na@sandvik.com', name: '李娜', role: '区域总监', avatar: 'L' },
]

const mockLoginLogs = [
  { id: 1, user: '张伟', role: '销售', loginTime: '2026-04-30 08:32:15', ip: '10.0.1.101', device: 'Windows PC / Chrome', result: '成功', browser: 'Chrome 123.0 / Windows 11' },
  { id: 2, user: '李娜', role: '区域总监', loginTime: '2026-04-30 08:45:22', ip: '10.0.1.102', device: 'MacBook Pro / Safari', result: '成功', browser: 'Safari 17.4 / macOS 14.4' },
  { id: 3, user: '王强', role: '销售', loginTime: '2026-04-30 08:50:01', ip: '192.168.1.201', device: 'iPhone 15 / Safari', result: '成功', browser: 'Safari Mobile / iOS 17.4' },
  { id: 4, user: '赵敏', role: '财务', loginTime: '2026-04-30 09:12:08', ip: '10.0.1.103', device: 'Windows PC / Edge', result: '成功', browser: 'Edge 123.0 / Windows 10' },
  { id: 5, user: '孙磊', role: '销售', loginTime: '2026-04-30 09:30:44', ip: '10.0.1.104', device: 'Windows PC / Chrome', result: '失败', browser: 'Chrome 123.0 / Windows 11' },
]

// Login with SSO (mock)
export async function login(domain) {
  // Try API first
  try {
    const result = await request.post('/auth/login', { domain })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    // Mock login - simulate success after delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockToken = 'mock_jwt_token_' + Date.now()
        const mockUser = domain === 'sandvik' ? mockUsers[0] : mockUsers[1]
        resolve({
          token: mockToken,
          user: mockUser
        })
      }, 800)
    })
  }
}

// Logout
export async function logout() {
  try {
    await request.post('/auth/logout')
  } catch {
    // Ignore errors in mock mode
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const result = await request.get('/auth/me')
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

// Get login logs
export async function getLoginLogs(params) {
  try {
    const result = await request.get('/auth/login-logs', { params })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    // Return mock data
    let filtered = [...mockLoginLogs]
    if (params?.user) {
      filtered = filtered.filter(log => log.user === params.user)
    }
    if (params?.result) {
      filtered = filtered.filter(log => log.result === params.result)
    }
    return { data: filtered, total: filtered.length }
  }
}

export default { login, logout, getCurrentUser, getLoginLogs }
