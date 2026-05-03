import request from './axios'

// Mock approval data
const mockApprovals = [
  { id: 1, period: '2026-Q2', region: '华北区域', submitter: '张伟', submitTime: '2026-04-28 14:30', amount: 1250000, status: 'pending', currentStep: 1, totalSteps: 3 },
  { id: 2, period: '2026-Q2', region: '华东区域', submitter: '李娜', submitTime: '2026-04-28 10:15', amount: 2380000, status: 'approved', currentStep: 3, totalSteps: 3 },
  { id: 3, period: '2026-Q2', region: '华南区域', submitter: '王强', submitTime: '2026-04-29 09:45', amount: 1890000, status: 'pending', currentStep: 1, totalSteps: 3 },
  { id: 4, period: '2026-Q2', region: '西南区域', submitter: '赵敏', submitTime: '2026-04-29 11:20', amount: 980000, status: 'rejected', currentStep: 2, totalSteps: 3 },
  { id: 5, period: '2026-Q2', region: '华中区域', submitter: '孙磊', submitTime: '2026-04-30 08:00', amount: 1560000, status: 'pending', currentStep: 2, totalSteps: 3 },
  { id: 6, period: '2026-Q1', region: '华北区域', submitter: '张伟', submitTime: '2026-01-28 14:30', amount: 1180000, status: 'approved', currentStep: 3, totalSteps: 3 },
]

// Get approvals by status
export async function getApprovals(status) {
  try {
    const result = await request.get('/approvals', { params: { status } })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    let filtered = status ? mockApprovals.filter(a => a.status === status) : mockApprovals
    return { data: filtered, total: filtered.length }
  }
}

// Get approval detail
export async function getApprovalDetail(id) {
  try {
    const result = await request.get(`/approvals/${id}`)
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { data: mockApprovals.find(a => a.id === id) }
  }
}

// Approve forecast
export async function approveForecast(id, comment) {
  try {
    const result = await request.post(`/approvals/${id}/approve`, { comment })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { success: true, message: '审批通过（模拟数据）' }
  }
}

// Reject forecast
export async function rejectForecast(id, comment) {
  try {
    const result = await request.post(`/approvals/${id}/reject`, { comment })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { success: true, message: '审批驳回（模拟数据）' }
  }
}

// Get approval counts by status
export async function getApprovalCounts() {
  try {
    const result = await request.get('/approvals/counts')
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return {
      data: {
        pending: mockApprovals.filter(a => a.status === 'pending').length,
        approved: mockApprovals.filter(a => a.status === 'approved').length,
        rejected: mockApprovals.filter(a => a.status === 'rejected').length,
        total: mockApprovals.length
      }
    }
  }
}

// Get approval history
export async function getApprovalHistory(id) {
  try {
    const result = await request.get(`/approval-flow/${id}/history`)
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { data: [], success: true }
  }
}

// Adjust forecast amounts
export async function adjustForecast(id, data) {
  try {
    const result = await request.post(`/approval-flow/adjust`, { ApprovalRequestId: id, ...data })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { success: true, message: '调整已记录（模拟数据）' }
  }
}

export default { getApprovals, getApprovalDetail, approveForecast, rejectForecast, getApprovalCounts, getApprovalHistory, adjustForecast }
