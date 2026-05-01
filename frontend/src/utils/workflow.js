/**
 * 审批工作流引擎
 * ====================
 * 核心功能：
 * 1. 根据组织架构动态生成审批链（邮箱驱动）
 * 2. 逐级审批 + 逐级退回
 * 3. 跳过逻辑（无直线经理则跳过）
 * 4. 邮件通知模板
 */



// ==================== Types ====================

/**
 * @typedef {Object} OrgNode
 * @property {string} id
 * @property {string} name
 * @property {string} email  // 邮箱 = 用户唯一标识
 * @property {'sales'|'manager'|'director'|'regionOwner'|'finalApprover'} type
 * @property {string} region
 * @property {string} company
 * @property {'active'|'inactive'} status
 * @property {string|null} parentId
 * @property {OrgNode[]} children
 */

/**
 * @typedef {Object} ChainStep
 * @property {number} level - 层级（1, 2, 3...）
 * @property {string} statusName - 状态名称，如"直线经理审批"
 * @property {string} roleName - 角色名：直线经理/区域总监/大区负责人/最终审批人
 * @property {string|null} approverEmail - 审批人邮箱（可为空，自动匹配）
 * @property {boolean} skippable - 是否允许跳过
 * @property {string} emailTemplate - 邮件通知模板
 */

/**
 * @typedef {Object} ApprovalRecord
 * @property {string} id
 * @property {string} period - FC Name
 * @property {string} submitterEmail - 提交人邮箱
 * @property {string} submitterName - 提交人姓名
 * @property {string} status - 当前状态
 * @property {ChainStep[]} approvalChain - 审批链（按顺序排列）
 * @property {number} currentLevel - 当前审批层级（1-based）
 * @property {HistoryNode[]} history - 审批历史
 * @property {Object} forecastData - 预测数据（金额等）
 */

/**
 * @typedef {Object} HistoryNode
 * @property {string} time
 * @property {string} status
 * @property {string} opinion
 * @property {string} actor
 * @property {string} actorEmail
 */

// ==================== Org Chart Lookup ====================

/** 内存中的组织架构数据（从 OrgChart.vue 的 orgData 同步） */
let orgChart = []

/**
 * 初始化组织架构数据
 * @param {OrgNode[]} data
 */
export function initOrgChart(data) {
  orgChart = data || []
}

/**
 * 根据邮箱查找组织节点
 * @param {string} email
 * @returns {OrgNode|null}
 */
export function findNodeByEmail(email) {
  const search = (nodes) => {
    for (const n of nodes) {
      if (n.email.toLowerCase() === email.toLowerCase()) return n
      if (n.children) {
        const found = search(n.children)
        if (found) return found
      }
    }
    return null
  }
  return search(orgChart)
}

/**
 * 查找某节点的所有上级（按层级向上）
 * @param {string} email
 * @returns {OrgNode[]}
 */
export function getManagers(email) {
  const node = findNodeByEmail(email)
  if (!node) return []

  const managers = []
  const traverseUp = (n) => {
    if (!n.parentId) return
    const parent = findNodeById(n.parentId, orgChart)
    if (parent) {
      managers.push(parent)
      traverseUp(parent)
    }
  }
  traverseUp(node)
  return managers
}

/**
 * 根据ID查找节点
 */
function findNodeById(id, nodes) {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNodeById(id, n.children)
      if (found) return found
    }
  }
  return null
}

// ==================== Approval Chain Builder ====================

/**
 * 根据提交人邮箱 + 审批矩阵配置，动态构建审批链
 * @param {string} submitterEmail - 提交人邮箱
 * @param {ChainStep[]} chainConfig - 审批矩阵配置
 * @returns {ChainStep[]} - 实际审批链（已处理跳过逻辑）
 */
export function buildApprovalChain(submitterEmail, chainConfig) {
  const submitter = findNodeByEmail(submitterEmail)
  if (!submitter) {
    // 没找到组织架构，降级到默认链
    return chainConfig.filter(s => s.roleName === '最终审批人')
  }

  const managers = getManagers(submitterEmail)
  const managerEmailMap = {}
  managers.forEach(m => {
    managerEmailMap[m.type] = m.email
  })

  const result = []
  for (const step of chainConfig) {
    let approverEmail = step.approverEmail || null

    // 自动匹配审批人
    if (!approverEmail) {
      if (step.roleName === '直线经理') {
        approverEmail = managerEmailMap['manager'] || null
      } else if (step.roleName === '区域总监') {
        approverEmail = managerEmailMap['director'] || submitter.region ? findDirectorByRegion(submitter.region) : null
      } else if (step.roleName === '大区负责人') {
        approverEmail = managerEmailMap['regionOwner'] || null
      } else if (step.roleName === '最终审批人') {
        approverEmail = managerEmailMap['finalApprover'] || null
      }
    }

    // 跳过逻辑
    if (!approverEmail && step.skippable) {
      console.log(`[Workflow] Step "${step.statusName}" skipped (no approver found)`)
      continue
    }

    result.push({
      ...step,
      approverEmail
    })
  }

  return result
}

/**
 * 根据大区查找区域总监
 */
function findDirectorByRegion(region) {
  const search = (nodes) => {
    for (const n of nodes) {
      if (n.type === 'director' && n.region === region) return n.email
      if (n.children) {
        const found = search(n.children)
        if (found) return found
      }
    }
    return null
  }
  return search(orgChart)
}

// ==================== Approval Engine ====================

const SESSION_KEY = 'sandvik_approval_records'

/** 从 sessionStorage 恢复记录（Set 需要特殊处理） */
function loadFromSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    for (const id of Object.keys(parsed)) {
      if (Array.isArray(parsed[id].notifiedEmails)) {
        parsed[id].notifiedEmails = new Set(parsed[id].notifiedEmails)
      }
    }
    Object.assign(approvalRecords, parsed)
  } catch (e) {
    console.warn('[workflow] sessionStorage load failed:', e)
  }
}

/** 把记录存入 sessionStorage（Set 转 Array 以支持 JSON） */
function saveToSession() {
  try {
    // 序列化前把 Set 换成数组
    const toSave = {}
    for (const [id, rec] of Object.entries(approvalRecords)) {
      toSave[id] = {
        ...rec,
        notifiedEmails: [...rec.notifiedEmails]
      }
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.warn('[workflow] sessionStorage save failed:', e)
  }
}

// 模块加载时自动恢复
loadFromSession()

/** 内存中的审批记录 */
const approvalRecords = {}

/**
 * 创建一条新的审批记录
 * @param {Object} params
 * @returns {ApprovalRecord}
 */
export function createApprovalRecord({ id, period, submitterEmail, submitterName, chainConfig, forecastData }) {
  const chain = buildApprovalChain(submitterEmail, chainConfig)

  const record = {
    id,
    period,
    submitterEmail,
    submitterName,
    status: 'draft',
    approvalChain: chain,
    currentLevel: 0, // 0 = 草稿未提交
    history: [
      {
        time: new Date().toISOString(),
        status: 'draft',
        opinion: '初始草稿保存',
        actor: submitterName,
        actorEmail: submitterEmail
      }
    ],
    forecastData,
    // 邮件通知记录（防止重复发）
    notifiedEmails: new Set()
  }

  approvalRecords[id] = record
  saveToSession()
  return record
}

/**
 * 加载已有审批记录
 */
export function getApprovalRecord(id) {
  return approvalRecords[id] || null
}

/**
 * 获取某用户的待审批列表
 * @param {string} email
 * @returns {ApprovalRecord[]}
 */
export function getPendingApprovals(email) {
  return Object.values(approvalRecords).filter(r => {
    if (r.status === 'draft' || r.status === 'approved' || r.status === 'rejected') return false
    const currentStep = r.approvalChain[r.currentLevel - 1]
    return currentStep && currentStep.approverEmail?.toLowerCase() === email.toLowerCase()
  })
}

/**
 * 提交预测（草稿 → 第一级审批）
 * @param {string} recordId
 * @returns {{ success: boolean, message: string, nextApprover?: string }}
 */
export function submitForApproval(recordId) {
  const record = approvalRecords[recordId]
  if (!record) return { success: false, message: '记录不存在' }
  if (record.status !== 'draft') return { success: false, message: '只能提交草稿状态' }

  const chain = record.approvalChain
  if (!chain || chain.length === 0) {
    // 没有审批链，直接通过
    record.status = 'approved'
    record.history.push({
      time: new Date().toISOString(),
      status: 'approved',
      opinion: '无需审批，直接通过',
      actor: record.submitterName,
      actorEmail: record.submitterEmail
    })
    saveToSession()
    return { success: true, message: '提交成功（无需审批）', nextApprover: null }
  }

  // 进入第一级
  record.currentLevel = 1
  record.status = 'pending_level_1'
  const firstStep = chain[0]

  record.history.push({
    time: new Date().toISOString(),
    status: record.status,
    opinion: `提交预测，等待${firstStep.statusName}`,
    actor: record.submitterName,
    actorEmail: record.submitterEmail
  })

  saveToSession()
  return {
    success: true,
    message: '提交成功',
    nextApprover: firstStep.approverEmail,
    emailTemplate: firstStep.emailTemplate
  }
}

/**
 * 审批通过
 * @param {string} recordId
 * @param {string} approverEmail
 * @param {string} opinion
 * @returns {{ success: boolean, message: string, isFinal?: boolean, nextApprover?: string }}
 */
export function approveStep(recordId, approverEmail, opinion = '') {
  const record = approvalRecords[recordId]
  if (!record) return { success: false, message: '记录不存在' }

  const currentStep = record.approvalChain[record.currentLevel - 1]
  if (!currentStep) return { success: false, message: '当前审批步骤不存在' }

  // 验证审批人权限
  if (currentStep.approverEmail?.toLowerCase() !== approverEmail.toLowerCase()) {
    return { success: false, message: '您没有此记录的审批权限' }
  }

  const nextLevel = record.currentLevel + 1
  const nextStep = record.approvalChain[nextLevel - 1]

  if (!nextStep) {
    // 最后一关，通过
    record.status = 'approved'
    record.history.push({
      time: new Date().toISOString(),
      status: 'approved',
      opinion: opinion || '审批通过',
      actor: approverEmail,
      actorEmail: approverEmail
    })
    saveToSession()
    return { success: true, message: '审批完成，预测已通过', isFinal: true }
  }

  // 进入下一级
  record.currentLevel = nextLevel
  record.status = `pending_level_${nextLevel}`

  record.history.push({
    time: new Date().toISOString(),
    status: record.status,
    opinion: opinion || `${currentStep.statusName}通过，转${nextStep.statusName}`,
    actor: approverEmail,
    actorEmail: approverEmail
  })

  saveToSession()
  return {
    success: true,
    message: `${currentStep.statusName}通过，已提交${nextStep.statusName}`,
    isFinal: false,
    nextApprover: nextStep.approverEmail,
    emailTemplate: nextStep.emailTemplate
  }
}

/**
 * 审批退回（逐级退回）
 * @param {string} recordId
 * @param {string} approverEmail
 * @param {string} reason
 * @returns {{ success: boolean, message: string,退回至?: 'draft'|'level_N' }}
 */
export function rejectStep(recordId, approverEmail, reason) {
  const record = approvalRecords[recordId]
  if (!record) return { success: false, message: '记录不存在' }

  const currentStep = record.approvalChain[record.currentLevel - 1]
  if (!currentStep) return { success: false, message: '当前审批步骤不存在' }

  // 验证审批人权限
  if (currentStep.approverEmail?.toLowerCase() !== approverEmail.toLowerCase()) {
    return { success: false, message: '您没有此记录的审批权限' }
  }

  // 退回：退回给提交人重新修改（状态变为 draft）
  record.status = 'draft'
  record.currentLevel = 0

  record.history.push({
    time: new Date().toISOString(),
    status: 'draft',
    opinion: `退回：${reason}`,
    actor: approverEmail,
    actorEmail: approverEmail
  })

  saveToSession()
  return {
    success: true,
    message: '已退回给提交人修改',
   退回至: 'draft'
  }
}

/**
 * 调整后再次提交
 * @param {string} recordId
 * @param {Object} newForecastData
 * @returns {{ success: boolean, message: string }}
 */
export function resubmitAfterAdjust(recordId, newForecastData) {
  const record = approvalRecords[recordId]
  if (!record) return { success: false, message: '记录不存在' }
  if (record.status !== 'draft') return { success: false, message: '只能调整草稿状态的记录' }

  if (newForecastData) {
    record.forecastData = { ...record.forecastData, ...newForecastData }
    saveToSession()
  }

  return submitForApproval(recordId)
}

// ==================== Email Notification (Node.js only) ====================

/**
 * 渲染邮件内容（替换模板变量）
 * @param {string} template
 * @param {Object} vars
 * @returns {string}
 */
export function renderEmailTemplate(template, vars) {
  if (!template) return ''
  return template
    .replace('{submitter}', vars.submitterName || '')
    .replace('{period}', vars.period || '')
    .replace('{amount}', vars.amount ? '¥' + Number(vars.amount).toLocaleString() : '')
    .replace('{status}', vars.status || '')
}

/**
 * 发送邮件 — 调用后端真实邮件 API
 * @param {string} toEmail
 * @param {string} subject
 * @param {string} body
 */
export async function sendEmail(toEmail, subject, body) {
  // 调用后端真实邮件 API
  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail, subject, body })
    })
    const data = await res.json()
    if (data.success) {
      console.log(`[Email] ✓ Sent to ${toEmail}: ${subject}`)
    } else {
      console.warn(`[Email] ✗ Failed to send to ${toEmail}: ${data.message}`)
    }
    return data
  } catch (err) {
    // 后端 API 不可用时降级到日志
    console.warn(`[Email] ✗ API unavailable — mock email to ${toEmail}: ${subject}`)
    return { success: false, message: err.message }
  }
}

/**
 * 触发审批通知
 * @param {ApprovalRecord} record
 * @param {'submit'|'approve'|'reject'|'final'} eventType
 * @param {Object} extra
 */
export async function notifyApprovalEvent(record, eventType, extra = {}) {
  const vars = {
    submitterName: record.submitterName,
    period: record.period,
    amount: record.forecastData?.orderAmount || 0,
    status: record.status
  }

  if (eventType === 'submit') {
    const step = record.approvalChain[0]
    if (step?.approverEmail) {
      const body = renderEmailTemplate(step.emailTemplate, vars)
      await sendEmail(step.approverEmail, `[待审批] ${record.period} - 销售预测审批`, body)
    }
  } else if (eventType === 'approve' && extra.nextApproverEmail) {
    const currentStep = record.approvalChain[record.currentLevel - 2] // currentLevel already updated
    const body = renderEmailTemplate(
      record.approvalChain[record.currentLevel - 1]?.emailTemplate || '',
      vars
    )
    await sendEmail(extra.nextApproverEmail, `[待审批] ${record.period} - 销售预测审批`, body)
  } else if (eventType === 'reject') {
    const body = `您的销售预测已被退回，请修改后重新提交。\n原因：${extra.reason || ''}`
    await sendEmail(record.submitterEmail, `[退回] ${record.period} - 销售预测退回通知`, body)
  } else if (eventType === 'final') {
    const body = `您的销售预测已通过全部审批流程。\n预测周期：${record.period}\n金额：¥${Number(vars.amount).toLocaleString()}`
    await sendEmail(record.submitterEmail, `[通过] ${record.period} - 销售预测审批完成`, body)
  }
}

const workflowEngine = {
  initOrgChart,
  findNodeByEmail,
  getManagers,
  buildApprovalChain,
  createApprovalRecord,
  getApprovalRecord,
  getPendingApprovals,
  submitForApproval,
  approveStep,
  rejectStep,
  resubmitAfterAdjust,
  renderEmailTemplate,
  sendEmail,
  notifyApprovalEvent
}

// ==================== Export ====================
export { workflowEngine }
export default workflowEngine

// ==================== Debug ====================
// Expose key functions to window for browser console debugging
if (typeof window !== 'undefined') {
  window.__wf_getApprovalRecord = getApprovalRecord
  window.__wf_submitForApproval = submitForApproval
  window.__wf_approveStep = approveStep
  window.__wf_rejectStep = rejectStep
  window.__wf_records = () => JSON.parse(JSON.stringify(approvalRecords))
}
