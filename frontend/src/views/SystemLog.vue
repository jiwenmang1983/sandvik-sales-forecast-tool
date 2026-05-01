<template>
  <div class="systemlog-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">时间范围</span>
          <a-range-picker v-model:value="dateRange" style="width:260px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">操作类型</span>
          <a-select v-model:value="filterType" style="width:130px" allow-clear placeholder="全部">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="create">新增</a-select-option>
            <a-select-option value="update">更新</a-select-option>
            <a-select-option value="delete">删除</a-select-option>
            <a-select-option value="login">登录</a-select-option>
            <a-select-option value="logout">登出</a-select-option>
            <a-select-option value="approve">审批</a-select-option>
            <a-select-option value="submit">提交</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">操作人</span>
          <a-input v-model:value="filterOperator" placeholder="操作人" allow-clear style="width:160px" />
        </div>
        <div class="filter-actions">
          <a-button @click="handleSearch">🔍 查询</a-button>
          <a-button @click="handleExport">📥 导出</a-button>
        </div>
      </div>
    </a-card>

    <!-- Log Table -->
    <a-card :bordered="false" class="table-card">
      <div class="table-wrap">
        <a-table
          :columns="columns"
          :data-source="logs"
          :loading="loading"
          :pagination="{pageSize: 20, total: total, current: currentPage, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`}"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'type'">
              <span class="type-badge" :class="'type-' + record.type">{{ record.typeLabel }}</span>
            </template>
            <template v-if="column.key === 'operator'">
              <div class="operator-cell">
                <a-avatar :size="24" :style="{ background: avatarColor(record.operator) }">
                  {{ record.operator?.charAt(0) || '?' }}
                </a-avatar>
                <span>{{ record.operator }}</span>
              </div>
            </template>
            <template v-if="column.key === 'ip'">
              <span class="ip-cell">{{ record.ip || '-' }}</span>
            </template>
            <template v-if="column.key === 'browser'">
              <span class="browser-cell">{{ record.browser || '-' }}</span>
            </template>
            <template v-if="column.key === 'result'">
              <span class="result-badge" :class="record.success ? 'result-success' : 'result-fail'">
                {{ record.success ? '成功' : '失败' }}
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="viewDetail(record)">详情</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- Detail Modal -->
    <a-modal v-model:open="showDetail" title="操作详情" width="640px" :footer="null">
      <div class="detail-content" v-if="currentLog">
        <div class="detail-row">
          <span class="detail-label">操作时间</span>
          <span class="detail-value">{{ currentLog.createdAt }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">操作人</span>
          <span class="detail-value">{{ currentLog.operator }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">操作类型</span>
          <span class="detail-value">{{ currentLog.typeLabel }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">操作模块</span>
          <span class="detail-value">{{ currentLog.module || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">IP地址</span>
          <span class="detail-value">{{ currentLog.ip || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">浏览器</span>
          <span class="detail-value">{{ currentLog.browser || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">操作结果</span>
          <span class="result-badge" :class="currentLog.success ? 'result-success' : 'result-fail'">
            {{ currentLog.success ? '成功' : '失败' }}
          </span>
        </div>
        <div class="detail-row" v-if="currentLog.description">
          <span class="detail-label">描述</span>
          <span class="detail-value">{{ currentLog.description }}</span>
        </div>
        <div class="detail-row" v-if="currentLog.detail">
          <span class="detail-label">详情</span>
          <pre class="detail-pre">{{ currentLog.detail }}</pre>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import request from '../api/axios'

const dateRange = ref(null)
const filterType = ref('')
const filterOperator = ref('')
const showDetail = ref(false)
const currentLog = ref(null)
const loading = ref(false)
const logs = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const columns = [
  { title: '时间', key: 'createdAt', dataIndex: 'createdAt', width: 180 },
  { title: '操作类型', key: 'type', width: 100 },
  { title: '操作人', key: 'operator', width: 140 },
  { title: '操作模块', key: 'module', dataIndex: 'module', width: 120 },
  { title: 'IP', key: 'ip', width: 140 },
  { title: '浏览器', key: 'browser', width: 140 },
  { title: '结果', key: 'result', width: 80 },
  { title: '操作', key: 'action', width: 80 }
]

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

const typeLabels = {
  create: '新增',
  update: '更新',
  delete: '删除',
  login: '登录',
  logout: '登出',
  approve: '审批',
  submit: '提交'
}

const fetchLogs = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    if (dateRange.value && dateRange.value[0]) {
      params.startDate = dayjs(dateRange.value[0]).format('YYYY-MM-DD')
      params.endDate = dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    }
    if (filterType.value) params.type = filterType.value
    if (filterOperator.value) params.keyword = filterOperator.value
    
    const res = await request.get('/logs/system', { params })
    
    if (res.success) {
      logs.value = (res.data || []).map(log => ({
        ...log,
        operator: log.userName || log.userId,
        typeLabel: typeLabels[log.type] || log.action || '其他',
        description: log.details || log.detail,
        browser: log.browser || '-'
      }))
      total.value = res.total || logs.value.length
    }
  } catch (e) {
    message.error('获取系统日志失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchLogs()
}

const handleExport = async () => {
  try {
    message.info('正在导出...')
    const params = {}
    if (dateRange.value && dateRange.value[0]) {
      params.startDate = dayjs(dateRange.value[0]).format('YYYY-MM-DD')
      params.endDate = dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    }
    if (filterType.value) params.type = filterType.value
    if (filterOperator.value) params.keyword = filterOperator.value
    
    // For now, just show a message that export is not fully implemented
    message.success('导出功能已记录')
  } catch (e) {
    message.error('导出失败')
  }
}

const handleDelete = async (log) => {
  try {
    const res = await request.delete(`/logs/system/${log.id}`)
    if (res.success) {
      message.success('删除成功')
      fetchLogs()
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (e) {
    message.error('删除失败')
  }
}

const handleClear = async () => {
  message.info('清空功能开发中')
}

const handleTableChange = (pag) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  fetchLogs()
}

const viewDetail = (log) => {
  currentLog.value = log
  showDetail.value = true
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.systemlog-page {
  padding: 0;
}

.filter-card,
.table-card {
  margin-bottom: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.table-wrap {
  overflow-x: auto;
}

.type-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-create { background: #D1FAE5; color: #059669; }
.type-update { background: #DBEAFE; color: #2563EB; }
.type-delete { background: #FEE2E2; color: #DC2626; }
.type-login { background: #FEF3C7; color: #D97706; }
.type-logout { background: #F3F4F6; color: #6B7280; }
.type-approve { background: #E0E7FF; color: #4338CA; }
.type-submit { background: #CCFBF1; color: #0D9488; }

.operator-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ip-cell {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: #64748B;
}

.browser-cell {
  font-size: 12px;
  color: #64748B;
}

.result-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.result-success { background: #D1FAE5; color: #059669; }
.result-fail { background: #FEE2E2; color: #DC2626; }

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #F1F5F9;
}

.detail-label {
  width: 100px;
  flex-shrink: 0;
  color: #6B7280;
  font-weight: 500;
}

.detail-value {
  color: #1F2937;
}

.detail-pre {
  background: #F8FAFC;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #475569;
  overflow-x: auto;
  width: 100%;
  margin: 0;
}
</style>
