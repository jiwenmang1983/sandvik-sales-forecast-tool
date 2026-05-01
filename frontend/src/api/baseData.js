import request from './axios'

// Mock base data
const mockOrganizations = [
  { id: 1, code: 'BJ', name: '北京分公司', type: '分公司', parent: null, status: 'active', manager: '张伟' },
  { id: 2, code: 'SH', name: '上海分公司', type: '分公司', parent: null, status: 'active', manager: '李娜' },
  { id: 3, code: 'GZ', name: '广州分公司', type: '分公司', parent: null, status: 'active', manager: '王强' },
  { id: 4, code: 'CD', name: '成都分公司', type: '分公司', parent: null, status: 'active', manager: '赵敏' },
  { id: 5, code: 'WH', name: '武汉分公司', type: '分公司', parent: null, status: 'inactive', manager: '孙磊' },
]

const mockCustomers = [
  { id: 1, code: 'C001', name: '中国建筑集团', type: '总包商', region: '华北', status: 'active', contact: '李经理', phone: '13800138001' },
  { id: 2, code: 'C002', name: '中铁建设集团', type: '总包商', region: '华北', status: 'active', contact: '王经理', phone: '13800138002' },
  { id: 3, code: 'C003', name: '上海建工集团', type: '总包商', region: '华东', status: 'active', contact: '张经理', phone: '13800138003' },
  { id: 4, code: 'C004', name: '广州建筑集团', type: '总包商', region: '华南', status: 'active', contact: '刘经理', phone: '13800138004' },
  { id: 5, code: 'C005', name: '四川路桥集团', type: '总包商', region: '西南', status: 'pending', contact: '陈经理', phone: '13800138005' },
]

const mockProducts = [
  { id: 1, code: 'P001', name: '凿岩钻具', category: '钻探设备', unit: '件', price: 1250, status: 'active' },
  { id: 2, code: 'P002', name: '破碎设备', category: '破碎设备', unit: '台', price: 85000, status: 'active' },
  { id: 3, code: 'P003', name: '钻杆', category: '钻探设备', unit: '根', price: 3800, status: 'active' },
  { id: 4, code: 'P004', name: '锚杆', category: '加固设备', unit: '根', price: 280, status: 'active' },
  { id: 5, code: 'P005', name: '喷浆机', category: '喷射设备', unit: '台', price: 45000, status: 'inactive' },
]

const mockProductHierarchy = [
  { id: 1, code: 'H01', name: '钻探设备', level: 1, children: [
    { id: 2, code: 'H01-01', name: '凿岩钻具', level: 2, children: [] },
    { id: 3, code: 'H01-02', name: '钻杆', level: 2, children: [] },
  ]},
  { id: 4, code: 'H02', name: '破碎设备', level: 1, children: [
    { id: 5, code: 'H02-01', name: '颚式破碎机', level: 2, children: [] },
    { id: 6, code: 'H02-02', name: '圆锥破碎机', level: 2, children: [] },
  ]},
  { id: 7, code: 'H03', name: '喷射设备', level: 1, children: [] },
]

const mockDataDict = [
  { id: 1, category: '客户类型', code: 'TYPE001', name: '总包商', status: 'active' },
  { id: 2, category: '客户类型', code: 'TYPE002', name: '分包商', status: 'active' },
  { id: 3, category: '客户类型', code: 'TYPE003', name: '经销商', status: 'active' },
  { id: 4, category: '产品状态', code: 'PST001', name: '正常销售', status: 'active' },
  { id: 5, category: '产品状态', code: 'PST002', name: '停产', status: 'active' },
  { id: 6, category: '审批状态', code: 'APR001', name: '待审批', status: 'active' },
  { id: 7, category: '审批状态', code: 'APR002', name: '已通过', status: 'active' },
  { id: 8, category: '审批状态', code: 'APR003', name: '已驳回', status: 'active' },
]

const mockUsers = [
  { id: 1, username: 'admin', name: 'Admin User', email: 'admin@sandvik.com', role: '管理员', department: 'IT', status: 'active', lastLogin: '2026-04-30 10:00' },
  { id: 2, username: 'zhangwei', name: '张伟', email: 'zhang.wei@sandvik.com', role: '销售', department: '销售部', status: 'active', lastLogin: '2026-04-30 08:32' },
  { id: 3, username: 'lina', name: '李娜', email: 'li.na@sandvik.com', role: '区域总监', department: '销售部', status: 'active', lastLogin: '2026-04-30 08:45' },
  { id: 4, username: 'wangqiang', name: '王强', email: 'wang.qiang@sandvik.com', role: '销售', department: '销售部', status: 'active', lastLogin: '2026-04-30 08:50' },
  { id: 5, username: 'zhaomin', name: '赵敏', email: 'zhao.min@sandvik.com', role: '财务', department: '财务部', status: 'active', lastLogin: '2026-04-30 09:12' },
]

const mockPermissions = [
  { id: 1, name: '管理员', description: '系统管理员，拥有所有权限', userCount: 2, permissions: ['*'] },
  { id: 2, name: '区域总监', description: '区域负责人，可审批区域内预测', userCount: 5, permissions: ['forecast.view', 'forecast.approve', 'report.view'] },
  { id: 3, name: '销售', description: '销售人员，可填报和查看预测', userCount: 35, permissions: ['forecast.view', 'forecast.edit', 'report.view'] },
  { id: 4, name: '财务', description: '财务人员，可查看和分析数据', userCount: 3, permissions: ['report.view', 'forecast.view'] },
]

const mockSystemLogs = [
  { id: 1, user: '张伟', action: '登录系统', module: '认证', ip: '10.0.1.101', time: '2026-04-30 08:32:15', status: '成功' },
  { id: 2, user: '张伟', action: '提交预测', module: '预测管理', ip: '10.0.1.101', time: '2026-04-30 09:15:30', status: '成功' },
  { id: 3, user: '李娜', action: '审批通过', module: '审批管理', ip: '10.0.1.102', time: '2026-04-30 10:00:00', status: '成功' },
  { id: 4, user: '王强', action: '编辑产品', module: '基础数据', ip: '192.168.1.201', time: '2026-04-30 11:20:45', status: '成功' },
  { id: 5, user: '赵敏', action: '导出报表', module: '报表', ip: '10.0.1.103', time: '2026-04-30 14:30:00', status: '成功' },
]

const mockFcVersions = [
  { id: 1, name: '2026-Q1', year: 2026, quarter: 1, startDate: '2026-01-01', endDate: '2026-03-31', status: 'closed', submitRate: 100 },
  { id: 2, name: '2026-Q2', year: 2026, quarter: 2, startDate: '2026-04-01', endDate: '2026-06-30', status: 'open', submitRate: 85 },
  { id: 3, name: '2026-Q3', year: 2026, quarter: 3, startDate: '2026-07-01', endDate: '2026-09-30', status: 'open', submitRate: 45 },
  { id: 4, name: '2026-Q4', year: 2026, quarter: 4, startDate: '2026-10-01', endDate: '2026-12-31', status: 'planning', submitRate: 0 },
]

const mockApprovalFlows = [
  { id: 1, name: '预测审批流程v1', description: '标准三级审批流程', levels: 3, approvers: '区域总监 → 销售总监 → 财务总监', status: 'active' },
  { id: 2, name: '预测审批流程v2', description: '简化二级审批流程', levels: 2, approvers: '区域总监 → 销售总监', status: 'active' },
  { id: 3, name: '紧急预测流程', description: '紧急情况下的快速审批', levels: 1, approvers: '销售总监', status: 'inactive' },
]

// Generic CRUD functions
async function fetchData(endpoint, mockData, params) {
  try {
    const result = await request.get(endpoint, { params })
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    let filtered = [...mockData]
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase()
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(kw) ||
        item.code?.toLowerCase().includes(kw)
      )
    }
    if (params?.status) {
      filtered = filtered.filter(item => item.status === params.status)
    }
    return { data: filtered, total: filtered.length }
  }
}

// Organizations
export async function getOrganizations(params) {
  return fetchData('/baseData/organizations', mockOrganizations, params)
}

// Customers
export async function getCustomers(params) {
  return fetchData('/baseData/customers', mockCustomers, params)
}

// Products
export async function getProducts(params) {
  return fetchData('/baseData/products', mockProducts, params)
}

// Product Hierarchy
export async function getProductHierarchy() {
  try {
    const result = await request.get('/baseData/product-hierarchy')
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { data: mockProductHierarchy }
  }
}

// Data Dictionary
export async function getDataDict(params) {
  return fetchData('/baseData/data-dict', mockDataDict, params)
}

// Users
export async function getUsers(params) {
  return fetchData('/users', mockUsers, params)
}

// Permissions
export async function getPermissions() {
  try {
    const result = await request.get('/permissions')
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { data: mockPermissions }
  }
}

// System Logs
export async function getSystemLogs(params) {
  return fetchData('/system/logs', mockSystemLogs, params)
}

// Fc Versions
export async function getFcVersions() {
  try {
    const result = await request.get('/forecast/versions')
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { data: mockFcVersions }
  }
}

// Approval Flows
export async function getApprovalFlows() {
  try {
    const result = await request.get('/approval/flows')
    if (result._mock) throw new Error('mock')
    return result
  } catch {
    return { data: mockApprovalFlows }
  }
}

export default {
  getOrganizations, getCustomers, getProducts, getProductHierarchy,
  getDataDict, getUsers, getPermissions, getSystemLogs,
  getFcVersions, getApprovalFlows
}
