<template>
  <div class="approval-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">FC Name</span>
          <a-select v-model:value="filter.fcName" style="width:180px" allow-clear placeholder="选择FC">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="fc in fcList" :key="fc" :value="fc">{{ fc }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">区域总监</span>
          <a-select v-model:value="filter.director" style="width:140px" allow-clear placeholder="选择总监">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="d in directorList" :key="d" :value="d">{{ d }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">销售</span>
          <a-select v-model:value="filter.sales" style="width:140px" allow-clear placeholder="选择销售">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="s in salesList" :key="s" :value="s">{{ s }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <a-select v-model:value="filter.status" style="width:160px" allow-clear placeholder="选择状态">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="draft">草稿</a-select-option>
            <a-select-option value="pending">审批中</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已退回</a-select-option>
          </a-select>
        </div>
        <div class="filter-actions">
          <a-button type="primary" @click="handleQuery">查询</a-button>
          <a-button @click="handleReset">重置</a-button>
        </div>
        <!-- User Switcher for Demo -->
        <div class="demo-user-switcher">
          <span class="filter-label">👤 当前用户</span>
          <a-select
            ref="userSelectRef"
            v-model:value="currentUserEmail"
            style="width:220px"
            :dropdownMatchSelectWidth="true"
            @change="onUserChange"
            @keydown="handleUserSelectKeydown"
          >
            <a-select-option value="zhou.ting@sandvik.com">
              <span>👤 周婷（销售）- 待提交审批</span>
            </a-select-option>
            <a-select-option value="zhang.wei@sandvik.com">
              <span>👨‍💼 张伟（直线经理）- 待我审批</span>
            </a-select-option>
            <a-select-option value="li.na@sandvik.com">
              <span>📊 李娜（区域总监）- 待我审批</span>
            </a-select-option>
            <a-select-option value="frank.tao@sandvik.com">
              <span>🎯 Frank Tao（最终审批）- 待我审批</span>
            </a-select-option>
          </a-select>
        </div>
      </div>
    </a-card>

    <!-- My Pending Banner -->
    <div v-if="myPendingCount > 0" class="pending-banner" @click="filter.status = 'pending'">
      <span class="banner-icon">📋</span>
      <span>您有 <strong>{{ myPendingCount }}</strong> 条待审批记录</span>
      <span class="banner-link">查看 →</span>
    </div>

    <!-- Demo Flow Hint -->
    <div class="demo-hint">
      <span>🔔 <strong>演示流程：</strong>先用「周婷」提交 →「张伟」审批 →「李娜」审批 →「Frank Tao」最终审批 → 完成！</span>
    </div>

    <!-- List View -->
    <div v-show="!showDetail" class="list-section">
      <a-card :bordered="false" class="table-card">
        <div class="table-wrap">
          <table class="forecast-table">
            <thead>
              <tr>
                <th>FC Name</th>
                <th>区域总监</th>
                <th>销售</th>
                <th>订单数量</th>
                <th>订单金额</th>
                <th>审批进度</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredList" :key="item.id" @click="viewDetail(item)" class="clickable-row">
                <td><span class="fc-name-cell">{{ item.fcName }}</span></td>
                <td>{{ item.director }}</td>
                <td>{{ item.sales }}</td>
                <td class="num">{{ item.orderCount }}</td>
                <td class="num">¥{{ item.orderAmount.toLocaleString() }}</td>
                <!-- Progress -->
                <td>
                  <div class="progress-cell">
                    <span class="progress-text">{{ item._record?.currentLevel || 0 }}/{{ item._record?.approvalChain?.length || 0 }}</span>
                    <div class="progress-dots">
                      <span
                        v-for="(step, idx) in (item._record?.approvalChain || [])"
                        :key="idx"
                        class="progress-dot"
                        :class="{
                          'dot-done': idx < (item._record?.currentLevel || 0),
                          'dot-active': idx === (item._record?.currentLevel || 0) - 1,
                          'dot-waiting': idx >= (item._record?.currentLevel || 0)
                        }"
                        :title="step.statusName"
                      />
                    </div>
                  </div>
                </td>
                <td><span class="status-badge" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span></td>
                <td @click.stop>
                  <a-space>
                    <a-button size="small" type="primary" @click="viewDetail(item)">查看详情</a-button>
                  </a-space>
                </td>
              </tr>
              <tr v-if="filteredList.length === 0">
                <td colspan="8" class="empty-cell">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </a-card>
    </div>

    <!-- Detail View -->
    <div v-show="showDetail" class="detail-section">
      <!-- Header -->
      <a-card :bordered="false" class="detail-header-card">
        <div class="detail-header">
          <div class="detail-header-left">
            <a-button @click="backToList" class="back-btn">← 返回列表</a-button>
            <h4 class="detail-title">{{ currentItem?.fcName }}</h4>
            <span class="status-badge" :class="statusClass(currentItem?.status)">{{ statusLabel(currentItem?.status) }}</span>
          </div>
          <div class="detail-actions">
            <!-- Submitter: Draft -> Submit -->
            <a-button
              v-if="canIDoAction === 'submit'"
              type="primary"
              @click="handleSubmit"
            >🚀 提交审批</a-button>
            <!-- Approver: Pending -> Approve/Reject -->
            <a-button v-if="canIDoAction === 'approve'" type="primary" @click="handlePass">✅ 通过</a-button>
            <a-button v-if="canIDoAction === 'approve'" danger @click="handleReject">🔙 退回</a-button>
            <!-- Download -->
            <a-button v-if="canIDoAction">📥 下载数据</a-button>
          </div>
        </div>

        <!-- Workflow Timeline -->
        <div v-if="currentRecord" class="workflow-timeline">
          <div
            v-for="(step, idx) in currentRecord.approvalChain"
            :key="idx"
            class="timeline-step"
            :class="{
              'step-done': idx < currentRecord.currentLevel - 1,
              'step-active': idx === currentRecord.currentLevel - 1,
              'step-waiting': idx >= currentRecord.currentLevel
            }"
          >
            <div class="step-connector" v-if="idx > 0" />
            <div class="step-icon">
              <span v-if="idx < currentRecord.currentLevel - 1">✓</span>
              <span v-else-if="idx === currentRecord.currentLevel - 1">{{ idx + 1 }}</span>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="step-body">
              <div class="step-name">{{ step.statusName }}</div>
              <div class="step-approver">{{ step.approverEmail || '（待匹配）' }}</div>
              <!-- Done step: show result -->
              <div v-if="idx < currentRecord.currentLevel - 1 && getHistoryForLevel(idx + 1)" class="step-result">
                <span class="result-badge badge-approved">✓ 通过</span>
                <span class="result-opinion">{{ getHistoryForLevel(idx + 1).opinion }}</span>
                <span class="result-time">{{ formatTime(getHistoryForLevel(idx + 1).time) }}</span>
              </div>
              <!-- Active step -->
              <div v-else-if="idx === currentRecord.currentLevel - 1" class="step-pending-hint">
                ⏳ 待处理
                <span v-if="canIDoAction === 'approve'" class="approver-hint">（您就是当前审批人）</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Notification Log -->
        <div class="email-log">
          <div class="email-log-title">📧 邮件通知记录</div>
          <div v-if="emailLogs.length === 0" class="email-log-empty">暂无邮件发送</div>
          <div v-for="(log, idx) in emailLogs" :key="idx" class="email-log-item">
            <span class="email-time">{{ log.time }}</span>
            <span class="email-to">→ {{ log.to }}</span>
            <span class="email-subject">{{ log.subject }}</span>
            <span class="email-result" :class="log.success ? 'email-ok' : 'email-fail'">
              {{ log.success ? '✓' : '✗' }}{{ log.message }}
            </span>
          </div>
        </div>
      </a-card>

      <!-- Summary Tabs -->
      <a-card :bordered="false" class="summary-tabs-card">
        <div class="summary-tabs">
          <button
            v-for="tab in summaryTabs"
            :key="tab.key"
            :class="['summary-tab', { active: activeSummaryTab === tab.key }]"
            @click="activeSummaryTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </a-card>

      <!-- Summary Table -->
      <a-card :bordered="false" class="table-card">
        <div class="table-wrap">
          <table class="forecast-table">
            <thead>
              <tr>
                <th v-for="col in summaryColumns[activeSummaryTab]" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in summaryData[activeSummaryTab]" :key="idx">
                <td v-for="(col, cIdx) in summaryColumns[activeSummaryTab]" :key="cIdx">{{ row[col] }}</td>
              </tr>
              <tr v-if="!summaryData[activeSummaryTab]?.length">
                <td :colspan="summaryColumns[activeSummaryTab].length" class="empty-cell">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </a-card>
    </div>

    <!-- Reject Modal -->
    <a-modal
      v-model:open="showRejectModal"
      title="🔙 驳回审批"
      ok-text="确认退回"
      cancel-text="取消"
      @ok="confirmReject"
    >
      <div class="reject-modal-body">
        <p class="reject-hint">请填写驳回原因，提交人修改后可重新提交审批。</p>
        <div class="modal-form-item">
          <label class="form-label">驳回原因 <span style="color:#ff4d4f">*</span></label>
          <a-textarea v-model:value="rejectReason" :rows="4" placeholder="请详细说明退回原因，以便提交人修改..." />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  workflowEngine,
  initOrgChart,
  createApprovalRecord,
  submitForApproval,
  approveStep,
  rejectStep,
  getApprovalRecord,
  getPendingApprovals
} from '../utils/workflow.js'
import { fetchOrgChart } from '../utils/orgApi.js'

// 邮件发送：前端演示用 mock，统一发到 Mark 的邮箱，标题区分角色
// 后端实现时改为 API 调用真实发送
const TEST_EMAIL = '93891594@qq.com'

async function mockSendEmail({ to, subject, text }) {
  // subject 格式：[角色] 原标题 -> 方便 Mark 在同一邮箱里区分不同通知
  const labeledSubject = `[${getRoleLabel(to)}] ${subject}`
  try {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: TEST_EMAIL, subject: labeledSubject, body: text })
    })
    const data = await res.json()
    if (data.success) {
      console.log(`[Email] ✓ Sent to ${TEST_EMAIL}: ${labeledSubject}`)
      return { success: true, message: 'sent' }
    } else {
      console.warn(`[Email] ✗ Failed: ${data.message}`)
      return { success: false, message: data.message }
    }
  } catch (err) {
    console.warn(`[Email] ✗ API unavailable — mock to ${TEST_EMAIL}: ${labeledSubject}`)
    return { success: false, message: err.message }
  }
}

// 根据目标邮箱返回角色标签（辅助测试区分）
function getRoleLabel(email) {
  const map = {
    'zhou.ting@sandvik.com': '周婷(销售)',
    'zhang.wei@sandvik.com': '张伟(直线经理)',
    'li.na@sandvik.com': '李娜(区域总监)',
    'frank.tao@sandvik.com': 'Frank Tao(最终审批)',
    'zhiyuan.chen@sandvik.com': '陈志远(区域总监)',
  }
  return map[email.toLowerCase()] || email
}

// ==================== Current User ====================
const currentUserEmail = ref('zhou.ting@sandvik.com') // 默认：周婷（销售）
const showDetail = ref(false)
const showRejectModal = ref(false)
const currentItem = ref(null)
const currentRecord = ref(null)
const rejectReason = ref('')
const activeSummaryTab = ref('customer')
const emailLogs = ref([])
const userSelectRef = ref(null)

const filter = reactive({
  fcName: '',
  director: '',
  sales: '',
  status: ''
})

// ==================== Org Chart (from API) ====================
/**
 * 将后端返回的扁平数据转成树形结构，供 workflow.js 使用
 */
function buildOrgTree(flatNodes) {
  const map = {}
  const roots = []
  flatNodes.forEach(n => {
    map[n.Id] = { ...n, id: String(n.Id), parentId: n.ParentId != null ? String(n.ParentId) : null, children: [] }
  })
  Object.values(map).forEach(node => {
    if (node.parentId && map[node.parentId]) {
      map[node.parentId].children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

// 内嵌 fallback org chart（与后端数据一致，确保审批链能正确构建）
// 结构：Frank Tao → Li Na → Zhang Wei → Zhou Ting/王强  |  Frank Tao → Chen Zhiyuan
const fallbackOrgData = [
  {
    id: '1', type: 'finalApprover', name: 'Frank Tao', email: 'frank.tao@sandvik.com',
    region: '', company: '山特维克集团', status: 'active', parentId: null, children: [
      {
        id: '2', type: 'director', name: '李娜', email: 'li.na@sandvik.com',
        region: '华东大区', company: '山特维克商贸(上海)', status: 'active', parentId: '1', children: [
          {
            id: '3', type: 'manager', name: '张伟', email: 'zhang.wei@sandvik.com',
            region: '华东大区', company: '山特维克商贸(上海)', status: 'active', parentId: '2', children: [
              { id: '4', type: 'sales', name: '周婷', email: 'zhou.ting@sandvik.com', region: '华东大区', company: '山特维克商贸(上海)', status: 'active', parentId: '3', children: [] },
              { id: '5', type: 'sales', name: '王强', email: 'qiang.wang@sandvik.com', region: '华东大区', company: '山特维克商贸(上海)', status: 'active', parentId: '3', children: [] }
            ]
          }
        ]
      },
      { id: '6', type: 'director', name: '陈志远', email: 'zhiyuan.chen@sandvik.com', region: '华南大区', company: '山特维克商贸(上海)', status: 'active', parentId: '1', children: [] }
    ]
  }
]

// 同步初始化（确保 demo 记录创建时 org chart 已就绪）
try {
  initOrgChart(fallbackOrgData)
} catch (err) {
  console.warn('[Approval] initOrgChart failed:', err)
}

// 异步从 API 更新（不阻塞初始化）
;(async () => {
  try {
    const flat = await fetchOrgChart()
    if (flat && flat.length > 0) {
      const tree = buildOrgTree(flat)
      initOrgChart(tree)
      console.log(`[Org] Loaded ${flat.length} nodes from API`)
    }
  } catch (err) {
    console.warn('[Approval] fetchOrgChart failed:', err)
  }
})()

// 默认审批链配置
const defaultChainConfig = [
  { id: 'c1', level: 1, statusName: '直线经理审批', roleName: '直线经理', approverEmail: '', skippable: false,
    emailTemplate: '您有一笔销售预测待审批，请及时处理。\n提交人：{submitter}\n预测周期：{period}\n金额：{amount}' },
  { id: 'c2', level: 2, statusName: '区域总监审批', roleName: '区域总监', approverEmail: '', skippable: false,
    emailTemplate: '区域总监审批通知：您有一笔销售预测待最终审批。\n提交人：{submitter}\n预测周期：{period}\n金额：{amount}' },
  { id: 'c3', level: 3, statusName: '最终审批', roleName: '最终审批人', approverEmail: 'frank.tao@sandvik.com', skippable: false,
    emailTemplate: '销售预测已完成全部审批流程。\n提交人：{submitter}\n预测周期：{period}\n金额：{amount}\n状态：已通过！' }
]

// 确保 demo 记录只创建一次（防止 HMR 重载模块时覆盖已审批的数据）
let demoRecordCreated = false

// Expose store helpers to window for debugging
// Note: getApprovalRecord and submitForApproval are available via import
window.__approval = {
  getRecord: (id) => window.__wf_getApprovalRecord ? window.__wf_getApprovalRecord(id) : null,
  submit: (id) => window.__wf_submit ? window.__wf_submit(id) : null,
  // Debug helpers
  getState: () => ({
    filter: JSON.parse(JSON.stringify(filter)),
    filteredListLength: filteredList.value.length,
    firstFiltered: filteredList.value[0] ? {
      id: filteredList.value[0].id,
      fcName: filteredList.value[0].fcName,
      status: filteredList.value[0].status,
    } : null,
    myPendingCount: myPendingCount.value,
    currentUserEmail: currentUserEmail.value
  })
}

// ==================== Demo Data: Full Flow Record ====================
// 周婷提交 -> 张伟(manager) -> 李娜(director) -> Frank Tao(finalApprover)
try {
  if (!getApprovalRecord('demo_zhou')) {
    createApprovalRecord({
      id: 'demo_zhou',
      period: '2026FC2-华东区Q2预测',
      submitterEmail: 'zhou.ting@sandvik.com',
      submitterName: '周婷',
      chainConfig: defaultChainConfig,
      forecastData: { orderAmount: 1500000, orderCount: 150, invoiceAmount: 1200000, invoiceCount: 120 }
    })
  }
} catch (err) {
  console.warn('[Approval] createApprovalRecord failed:', err)
}

const approvalData = ref([
  {
    id: 'demo_zhou',
    fcName: '2026FC2-华东区Q2预测',
    director: '李娜',
    sales: '周婷',
    orderCount: 150,
    invoiceCount: 120,
    orderAmount: 1500000,
    invoiceAmount: 1200000,
    status: '草稿',
    _record: null // 始终从 getApprovalRecord 获取最新引用
  },
  {
    id: 'demo_wang',
    fcName: '2026FC2-华东区Q2预测-王强',
    director: '李娜',
    sales: '王强',
    orderCount: 200,
    invoiceCount: 180,
    orderAmount: 2000000,
    invoiceAmount: 1800000,
    status: '已通过',
    _record: null
  },
  {
    id: 'demo_chen',
    fcName: '2026FC2-华南区Q2预测',
    director: '陈志远',
    sales: '周婷',
    orderCount: 120,
    invoiceCount: 100,
    orderAmount: 1200000,
    invoiceAmount: 1000000,
    status: '已通过',
    _record: null
  }
])

// Update record status to draft for display
const syncRecordStatus = () => {
  approvalData.value.forEach(item => {
    const rec = getApprovalRecord(item.id)
    if (rec) {
      item.status = rec.status === 'draft' ? '草稿' :
                    rec.status.startsWith('pending') ? '审批中' :
                    rec.status === 'approved' ? '已通过' :
                    rec.status === 'rejected' ? '已退回' : rec.status
      item._record = rec
    }
  })
}

// 页面加载时同步状态（从持久化的 approvalRecords 读取最新状态）
onMounted(() => {
  try {
    syncRecordStatus()
  } catch (err) {
    console.warn('[Approval] onMounted syncRecordStatus failed:', err)
  }
})

// 用户切换时：如果正在看详情，重新加载当前记录（刷新审批人权限）
watch(currentUserEmail, () => {
  if (showDetail.value && currentItem.value) {
    syncRecordStatus()
    currentRecord.value = getApprovalRecord(currentItem.value.id)
    emailLogs.value = []
  }
})

// ==================== Computed ====================
const canIDoAction = computed(() => {
  if (!currentRecord.value) return null
  const rec = currentRecord.value
  const user = currentUserEmail.value.toLowerCase()

  if (rec.status === 'draft' && rec.submitterEmail?.toLowerCase() === user) return 'submit'
  if (rec.status.startsWith('pending')) {
    const step = rec.approvalChain[rec.currentLevel - 1]
    if (step?.approverEmail?.toLowerCase() === user) return 'approve'
  }
  return null
})

const myPendingCount = computed(() => {
  return getPendingApprovals(currentUserEmail.value).length
})

const filteredList = computed(() => {
  return approvalData.value.filter(item => {
    if (filter.fcName && item.fcName !== filter.fcName) return false
    if (filter.director && item.director !== filter.director) return false
    if (filter.sales && item.sales !== filter.sales) return false
    if (filter.status && item.status !== filter.status) return false
    return true
  })
})

const statusLabel = (s) => ({
  draft: '草稿', '草稿': '草稿',
  pending: '审批中', '审批中': '审批中',
  approved: '已通过', '已通过': '已通过',
  rejected: '已退回', '已退回': '已退回'
}[s] || s)

const statusClass = (s) => ({
  draft: 'status-draft', '草稿': 'status-draft',
  pending: 'status-pending', '审批中': 'status-pending',
  approved: 'status-approved', '已通过': 'status-approved',
  rejected: 'status-rejected', '已退回': 'status-rejected'
}[s] || '')

const handleQuery = () => {
  // filteredList is a computed property that auto-responds to filter changes
  // no manual refresh needed
}

const STATUS_MAP = {
  draft: '草稿',
  pending: '审批中',
  approved: '已通过',
  rejected: '已退回'
}

const handleReset = () => {
  filter.fcName = ''
  filter.director = ''
  filter.sales = ''
  filter.status = ''
}

// 修复：键盘 ArrowDown 打开 dropdown 时直接定位到第一个选项，无需额外按键
const handleUserSelectKeydown = (e) => {
  if (e.key === 'ArrowDown' || e.key === 'Enter') {
    // 手动触发 Ant Design Select 打开 dropdown
    const selectEl = userSelectRef.value?.$el || userSelectRef.value
    if (selectEl) {
      selectEl.focus()
      // 让浏览器默认处理 — Ant Design Select 会在 focus 后自动打开 dropdown
    }
  }
}

const onUserChange = () => {
  // Auto-show pending records for the new user
  // First go back to list if we were in detail view
  showDetail.value = false
  currentItem.value = null
  currentRecord.value = null
  filter.status = '审批中'
  // CRITICAL: re-sync record statuses from sessionStorage so item.status reflects current workflow state
  syncRecordStatus()
  emailLogs.value = []
}

// ==================== Email Logging ====================
const logEmail = (to, subject, success, msg) => {
  emailLogs.value.unshift({
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    to: TEST_EMAIL,
    subject: `[${getRoleLabel(to)}] ${subject}`,
    success, message: msg
  })
}

// ==================== Actions ====================
const viewDetail = (item) => {
  try {
    if (!item) return
    currentItem.value = item
    currentRecord.value = item._record || (item.id ? getApprovalRecord(item.id) : null)
    emailLogs.value = []
    showDetail.value = true
  } catch (err) {
    console.warn('[Approval] viewDetail failed:', err)
    message.error('加载详情失败')
    showDetail.value = false
  }
}

const backToList = () => {
  showDetail.value = false
  currentItem.value = null
  currentRecord.value = null
  syncRecordStatus()
}

const getHistoryForLevel = (level) => {
  if (!currentRecord.value) return null
  return currentRecord.value.history.find(h => {
    if (level === 1 && h.status === 'pending_level_1') return true
    if (level > 1) {
      const step = currentRecord.value.approvalChain[level - 1]
      return step && h.status === `pending_level_${level}`
    }
    return false
  })
}

const formatTime = (isoStr) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// 提交审批
const handleSubmit = async () => {
  if (!currentItem.value) return
  const result = submitForApproval('demo_zhou')
  if (result.success) {
    syncRecordStatus()
    currentRecord.value = getApprovalRecord('demo_zhou')
    const rec = currentRecord.value
    const step = rec.approvalChain[0]

    // 发邮件通知审批人
    if (step?.approverEmail) {
      const r = await mockSendEmail({
        to: step.approverEmail,
        subject: `【待审批】${rec.period}`,
        text: `您有一笔销售预测待审批，请及时处理。\n提交人：${rec.submitterName}\n预测周期：${rec.period}\n金额：¥${rec.forecastData?.orderAmount?.toLocaleString()}`
      })
      logEmail(step.approverEmail, `【待审批】${rec.period}`, r.success, r.message)
    }
    message.success('✅ 已提交审批，通知邮件已发送！')
  } else {
    message.error(result.message)
  }
}

// 审批通过
const handlePass = async () => {
  if (!currentRecord.value) return
  const rec = currentRecord.value
  const result = approveStep(rec.id, currentUserEmail.value)
  if (result.success) {
    syncRecordStatus()
    currentRecord.value = getApprovalRecord(rec.id)
    const updated = currentRecord.value

    if (result.isFinal) {
      // 发邮件通知提交人
      const r = await mockSendEmail({
        to: updated.submitterEmail,
        subject: `【完成】${updated.period}`,
        text: `您的销售预测已完成全部审批流程！\n预测周期：${updated.period}\n金额：¥${updated.forecastData?.orderAmount?.toLocaleString()}\n状态：已通过`
      })
      logEmail(updated.submitterEmail, `【完成】${updated.period}`, r.success, r.message)
      message.success('🎉 预测已完成全部审批流程！')
    } else {
      // 发邮件通知下一级审批人
      const nextStep = updated.approvalChain[updated.currentLevel - 1]
      if (nextStep?.approverEmail) {
        const r = await mockSendEmail({
          to: nextStep.approverEmail,
          subject: `【待审批】${updated.period}`,
          text: `您有一笔销售预测待审批，请及时处理。\n提交人：${updated.submitterName}\n预测周期：${updated.period}\n金额：¥${updated.forecastData?.orderAmount?.toLocaleString()}`
        })
        logEmail(nextStep.approverEmail, `【待审批】${updated.period}`, r.success, r.message)
      }
      message.success(`✅ 已通过，当前等待 ${result.nextApprover} 审批`)
    }
  } else {
    message.error(result.message)
  }
}

// 退回
const handleReject = () => {
  showRejectModal.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value) {
    message.error('请填写退回原因')
    return
  }
  if (!currentRecord.value) return
  const rec = currentRecord.value
  const result = rejectStep(rec.id, currentUserEmail.value, rejectReason.value)
  if (result.success) {
    syncRecordStatus()
    currentRecord.value = getApprovalRecord(rec.id)

    // 通知提交人被退回
    const r = await mockSendEmail({
      to: currentRecord.value.submitterEmail,
      subject: `【退回】${currentRecord.value.period}`,
      text: `您的销售预测已被退回，请修改后重新提交。\n原因：${rejectReason.value}`
    })
    logEmail(currentRecord.value.submitterEmail, `【退回】${currentRecord.value.period}`, r.success, r.message)

    message.success('🔙 已退回给提交人')
    showRejectModal.value = false
    rejectReason.value = ''
  } else {
    message.error(result.message)
  }
}

// ==================== Summary ====================
const fcList = ['2026FC2-华东区Q2预测', '2026FC2-华南区Q2预测']
const directorList = ['李娜', '陈志远']
const salesList = ['周婷', '王强']

const summaryTabs = [
  { key: 'customer', label: '按客户' },
  { key: 'performance', label: '按业绩归属' },
  { key: 'region', label: '按销售大区' },
  { key: 'detail', label: '明细' }
]

const summaryColumns = {
  customer: ['客户名称', '订单数量', '订单金额'],
  performance: ['业绩归属', '订单数量', '订单金额'],
  region: ['销售大区', '订单数量', '订单金额'],
  detail: ['客户', '开票公司', 'PA', '订单数量', '订单金额']
}

const summaryData = {
  customer: [
    { '客户名称': '苏州精密工具', '订单数量': 150, '订单金额': '¥1,500,000' },
    { '客户名称': '昆山智造装备', '订单数量': 80, '订单金额': '¥800,000' }
  ],
  performance: [
    { '业绩归属': '精密工具事业部', '订单数量': 150, '订单金额': '¥1,500,000' },
    { '业绩归属': '刀具事业部', '订单数量': 80, '订单金额': '¥800,000' }
  ],
  region: [
    { '销售大区': '华东大区', '订单数量': 230, '订单金额': '¥2,300,000' }
  ],
  detail: [
    { '客户': '苏州精密工具', '开票公司': '山特维克商贸(上海)', 'PA': '刀具', '订单数量': 150, '订单金额': '¥1,500,000' },
    { '客户': '昆山智造装备', '开票公司': '山特维克商贸(上海)', 'PA': '钻头', '订单数量': 80, '订单金额': '¥800,000' }
  ]
}
</script>

<style scoped>
.approval-page { padding: 0; }

.filter-card {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item { display: flex; flex-direction: column; gap: 4px; }
.filter-label { font-size: 12px; color: #6B7280; font-weight: 600; }
.filter-actions { display: flex; gap: 8px; }

.demo-user-switcher {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: auto;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 10px;
  padding: 8px 12px;
}

.demo-hint {
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  border-radius: 10px;
  padding: 8px 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #15803D;
}

.pending-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #1D4ED8;
  font-size: 14px;
}
.pending-banner:hover { background: #DBEAFE; }
.banner-link { margin-left: auto; font-weight: 600; }

.table-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.table-wrap { overflow-x: auto; }

.forecast-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.forecast-table thead th {
  background: #F8FAFC;
  color: #64748B;
  font-weight: 600;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #E2E8F0;
  white-space: nowrap;
}

.forecast-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #F1F5F9;
  color: #334155;
}

.clickable-row { cursor: pointer; transition: background 0.1s; }
.clickable-row:hover { background: #F8FAFC; }
.num { text-align: right; font-variant-numeric: tabular-nums; }
.fc-name-cell { font-weight: 600; color: #0D3D92; }
.empty-cell { text-align: center; color: #94A3B8; padding: 32px; }

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.status-draft { background: #F1F5F9; color: #64748B; }
.status-pending { background: #FEF3C7; color: #92400E; }
.status-approved { background: #D1FAE5; color: #065F46; }
.status-rejected { background: #FEE2E2; color: #991B1B; }

/* Progress */
.progress-cell { display: flex; flex-direction: column; gap: 4px; }
.progress-text { font-size: 12px; color: #64748B; font-weight: 500; }
.progress-dots { display: flex; gap: 4px; }
.progress-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1;
}
.progress-dot.dot-done { background: #10B981; }
.progress-dot.dot-active { background: #F59E0B; box-shadow: 0 0 0 2px #FEF3C7; }
.progress-dot.dot-waiting { background: #E2E8F0; }

/* Detail */
.detail-header-card {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.detail-header-left { display: flex; align-items: center; gap: 12px; }
.back-btn { border-radius: 8px; }
.detail-title { margin: 0; font-size: 18px; font-weight: 700; }
.detail-actions { display: flex; gap: 8px; }

/* Timeline */
.workflow-timeline {
  display: flex;
  align-items: flex-start;
  gap: 0;
  overflow-x: auto;
  padding: 16px 0;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 130px;
  position: relative;
}

.step-connector {
  position: absolute;
  top: 18px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: #E2E8F0;
  z-index: 0;
}

.step-done .step-connector { background: #10B981; }

.step-icon {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
  z-index: 1;
  background: #E2E8F0;
  color: #64748B;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.step-done .step-icon { background: #10B981; color: #fff; }
.step-active .step-icon { background: #F59E0B; color: #fff; box-shadow: 0 0 0 4px #FEF3C7; }

.step-body { margin-top: 8px; text-align: center; }
.step-name { font-size: 12px; font-weight: 600; color: #334155; white-space: nowrap; }
.step-waiting .step-name { color: #94A3B8; }
.step-approver { font-size: 11px; color: #6B7280; margin-top: 2px; }

.step-result {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.result-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
  background: #D1FAE5;
  color: #065F46;
}

.result-opinion { font-size: 11px; color: #374151; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.result-time { font-size: 10px; color: #9CA3AF; }
.step-pending-hint { font-size: 11px; color: #F59E0B; margin-top: 4px; }
.approver-hint { color: #15803D; font-weight: 600; }

/* Email Log */
.email-log {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #E2E8F0;
}

.email-log-title {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 8px;
}

.email-log-empty { font-size: 12px; color: #9CA3AF; font-style: italic; }

.email-log-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid #F1F5F9;
}

.email-time { color: #9CA3AF; min-width: 60px; }
.email-to { color: #0D3D92; font-weight: 500; min-width: 160px; }
.email-subject { color: #374151; flex: 1; }
.email-ok { color: #15803D; font-weight: 600; }
.email-fail { color: #DC2626; font-weight: 600; }

/* Summary Tabs */
.summary-tabs-card {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.summary-tabs { display: flex; gap: 4px; }
.summary-tab {
  padding: 8px 20px;
  border: none;
  background: none;
  color: #64748B;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.15s;
}
.summary-tab:hover { background: #F1F5F9; color: #1F2937; }
.summary-tab.active { background: #EFF6FF; color: #1D4ED8; font-weight: 600; }

/* Modal */
.reject-modal-body { padding: 8px 0; }
.reject-hint { color: #6B7280; margin-bottom: 16px; }
.modal-form-item { margin-bottom: 8px; }
.form-label { display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 4px; }
</style>
