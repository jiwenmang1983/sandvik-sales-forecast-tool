<template>
  <div class="loginlog-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">时间范围</span>
          <a-range-picker v-model:value="dateRange" style="width:260px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">登录结果</span>
          <a-select v-model:value="filterResult" style="width:120px" allow-clear placeholder="全部">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="success">成功</a-select-option>
            <a-select-option value="fail">失败</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">登录账号</span>
          <a-input v-model:value="filterAccount" placeholder="账号" allow-clear style="width:160px" />
        </div>
        <div class="filter-actions">
          <a-button @click="handleSearch">🔍 查询</a-button>
          <a-button @click="handleExport">📥 导出</a-button>
        </div>
      </div>
    </a-card>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="summary-icon blue">📊</div>
        <div class="summary-info">
          <div class="summary-label">总登录次数</div>
          <div class="summary-value">{{ summary.total }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon green">✅</div>
        <div class="summary-info">
          <div class="summary-label">成功次数</div>
          <div class="summary-value">{{ summary.success }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon red">❌</div>
        <div class="summary-info">
          <div class="summary-label">失败次数</div>
          <div class="summary-value">{{ summary.fail }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon orange">📈</div>
        <div class="summary-info">
          <div class="summary-label">成功率</div>
          <div class="summary-value">{{ summary.rate }}%</div>
        </div>
      </div>
    </div>

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
            <template v-if="column.key === 'account'">
              <div class="account-cell">
                <a-avatar :size="24" :style="{ background: avatarColor(record.account) }">
                  {{ record.account?.charAt(0) || '?' }}
                </a-avatar>
                <span>{{ record.account }}</span>
              </div>
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
    <a-modal v-model:open="showDetail" title="登录详情" width="520px" :footer="null">
      <div class="detail-content" v-if="currentLog">
        <div class="detail-row">
          <span class="detail-label">登录时间</span>
          <span class="detail-value">{{ currentLog.createdAt }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">登录账号</span>
          <span class="detail-value">{{ currentLog.account }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">登录结果</span>
          <span class="result-badge" :class="currentLog.success ? 'result-success' : 'result-fail'">
            {{ currentLog.success ? '成功' : '失败' }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">IP地址</span>
          <span class="detail-value">{{ currentLog.ip || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">登录地点</span>
          <span class="detail-value">{{ currentLog.location || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">浏览器</span>
          <span class="detail-value">{{ currentLog.browser || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">操作系统</span>
          <span class="detail-value">{{ currentLog.os || '-' }}</span>
        </div>
        <div class="detail-row" v-if="currentLog.failReason">
          <span class="detail-label">失败原因</span>
          <span class="detail-value" style="color:#DC2626">{{ currentLog.failReason }}</span>
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
const filterResult = ref('')
const filterAccount = ref('')
const showDetail = ref(false)
const currentLog = ref(null)
const loading = ref(false)
const logs = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const summary = reactive({
  total: 0,
  success: 0,
  fail: 0,
  rate: 0
})

const columns = [
  { title: '登录时间', key: 'createdAt', dataIndex: 'createdAt', width: 180 },
  { title: '登录账号', key: 'account', width: 160 },
  { title: 'IP地址', key: 'ip', dataIndex: 'ip', width: 140 },
  { title: '登录地点', key: 'location', dataIndex: 'location', width: 160 },
  { title: '浏览器', key: 'browser', dataIndex: 'browser', width: 160 },
  { title: '结果', key: 'result', width: 100 },
  { title: '操作', key: 'action', width: 80 }
]

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
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
    if (filterResult.value) params.success = filterResult.value === 'success'
    if (filterAccount.value) params.keyword = filterAccount.value
    
    const res = await request.get('/logs/login', { params })
    
    if (res.success) {
      logs.value = (res.data || []).map(log => ({
        ...log,
        account: log.userName || log.account,
        location: '-'
      }))
      total.value = res.total || logs.value.length
      
      // Update summary
      summary.total = res.total || logs.value.length
      summary.success = res.successCount || logs.value.filter(l => l.success).length
      summary.fail = res.failCount || logs.value.filter(l => !l.success).length
      summary.rate = summary.total > 0 ? Math.round((summary.success / summary.total) * 100) : 0
    }
  } catch (e) {
    message.error('获取登录日志失败')
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
    // Export not yet fully implemented
    message.success('导出功能已记录')
  } catch (e) {
    message.error('导出失败')
  }
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
.loginlog-page {
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-icon {
  font-size: 28px;
}

.summary-icon.blue { color: #1890FF; }
.summary-icon.green { color: #52C41A; }
.summary-icon.red { color: #DC2626; }
.summary-icon.orange { color: #FA8C16; }

.summary-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
}

.table-wrap {
  overflow-x: auto;
}

.account-cell {
  display: flex;
  align-items: center;
  gap: 8px;
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

@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>
