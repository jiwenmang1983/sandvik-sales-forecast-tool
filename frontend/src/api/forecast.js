import request from './axios'

// Mock data for forecast periods
const mockPeriods = [
  { id: 1, period: '2026-Q1', openTime: '2026-01-01 至 2026-03-31', months: ['2026-01', '2026-02', '2026-03'], status: 'closed', approval: 'history', submitRate: 100 },
  { id: 2, period: '2026-Q2', openTime: '2026-04-01 至 2026-06-30', months: ['2026-04', '2026-05', '2026-06'], status: 'open', approval: 'history', submitRate: 85 },
  { id: 3, period: '2026-Q3', openTime: '2026-07-01 至 2026-09-30', months: ['2026-07', '2026-08', '2026-09'], status: 'open', approval: 'open', submitRate: 45 },
  { id: 4, period: '2025-Q4', openTime: '2025-10-01 至 2025-12-31', months: ['2025-10', '2025-11', '2025-12'], status: 'history', approval: 'history', submitRate: 100 },
]

const mockForecastData = [
  { id: 1, product: '凿岩钻具', specification: 'TD-50', unit: '件', q1: 1200, q2: 1350, q3: 1100, q4: 1400, remark: '' },
  { id: 2, product: '破碎设备', specification: 'CG-800', unit: '台', q1: 85, q2: 92, q3: 78, q4: 95, remark: '' },
  { id: 3, product: '钻杆', specification: 'DP-120', unit: '根', q1: 450, q2: 520, q3: 480, q4: 550, remark: '' },
]

// Get forecast periods
export async function getPeriods(params) {
  try {
    const result = await request.get('/forecast/periods', { params })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    let filtered = [...mockPeriods]
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(p => p.status === params.status)
    }
    if (params?.keyword) {
      filtered = filtered.filter(p => p.period.includes(params.keyword))
    }
    return { data: filtered, total: filtered.length }
  }
}

// Get forecast data for a period
export async function getForecastData(periodId) {
  return request.get(`/forecast/${periodId}`)
}

// Save forecast data
export async function saveForecastData(periodId, data) {
  try {
    const result = await request.post(`/forecast/${periodId}`, data)
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { success: true, message: '保存成功（模拟数据）' }
  }
}

// Submit forecast
export async function submitForecast(periodId) {
  try {
    const result = await request.post(`/forecast/${periodId}/submit`)
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { success: true, message: '提交成功（模拟数据）' }
  }
}

// Get dashboard KPIs
export async function getDashboardKPIs() {
  try {
    const result = await request.get('/forecast/dashboard')
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return {
      data: {
        totalForecast: 45680000,
        totalForecastYoY: 12.5,
        pendingApprovals: 8,
        pendingSubmit: 5,
        approvedRate: 78.5,
        onTimeRate: 92.3,
        submittedCount: 45,
        totalCount: 52
      }
    }
  }
}

// Get forecast chart data
export async function getForecastChartData() {
  try {
    const result = await request.get('/forecast/chart')
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return {
      data: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月'],
        actual: [3200, 3520, 2980, 4100, 4350, 3980, 4200, 4580, 4100],
        forecast: [3800, 4100, 3650, 4500, 4800, 4200, 4600, 4900, 4500],
        lastYear: [2800, 3100, 2650, 3600, 3850, 3500, 3700, 4050, 3700]
      }
    }
  }
}

export default { getPeriods, getForecastData, saveForecastData, submitForecast, getDashboardKPIs, getForecastChartData }
