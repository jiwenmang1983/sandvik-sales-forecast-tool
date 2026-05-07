import request from './axios'

const mockUserInvoicePermissions = [
  { id: 1, userId: 2, userEmail: 'zhang.wei@sandvik.com', userName: '张伟', invoiceCompanyId: 1, invoiceCompanyName: '山特维克（中国）有限公司' },
  { id: 2, userId: 3, userEmail: 'li.na@sandvik.com', userName: '李娜', invoiceCompanyId: 2, invoiceCompanyName: '山特维克矿山机械贸易有限公司' },
  { id: 3, userId: 4, userEmail: 'wang.qiang@sandvik.com', userName: '王强', invoiceCompanyId: 1, invoiceCompanyName: '山特维克（中国）有限公司' },
]

export async function getUserInvoicePermissions(params) {
  try {
    const result = await request.get('/user-invoice-permissions', { params })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { data: mockUserInvoicePermissions, total: mockUserInvoicePermissions.length }
  }
}

export async function createUserInvoicePermission(data) {
  try {
    const result = await request.post('/user-invoice-permissions', data)
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { success: true, message: '权限配置已添加（本地模式）' }
  }
}

export async function updateUserInvoicePermission(id, data) {
  try {
    const result = await request.put(`/user-invoice-permissions/${id}`, data)
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { success: true, message: '权限配置已更新（本地模式）' }
  }
}

export async function deleteUserInvoicePermission(id) {
  try {
    const result = await request.delete(`/user-invoice-permissions/${id}`)
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { success: true, message: '权限配置已删除（本地模式）' }
  }
}

export default {
  getUserInvoicePermissions,
  createUserInvoicePermission,
  updateUserInvoicePermission,
  deleteUserInvoicePermission
}
