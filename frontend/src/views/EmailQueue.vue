<template>
  <div class="emailqueue-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <a-select v-model:value="filterStatus" style="width:130px" allow-clear placeholder="全部">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="Pending">待发送</a-select-option>
            <a-select-option value="Sent">已发送</a-select-option>
            <a-select-option value="Failed">失败</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">收件人</span>
          <a-input v-model:value="filterRecipient" placeholder="收件人邮箱" allow-clear style="width:200px" />
        </div>
        <div class="filter-actions">
          <a-button @click="handleSearch">🔍 查询</a-button>
        </div>
      </div>
    </a-card>

    <!-- Email Queue Table -->
    <a-card :bordered="false" class="table-card">
      <div class="table-wrap">
        <a-table
          :columns="columns"
          :data-source="emails"
          :loading="loading"
          :pagination="{pageSize: 20, total: total, current: currentPage, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`}"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span class="status-badge" :class="'status-' + record.status.toLowerCase()">{{ statusLabel(record.status) }}</span>
            </template>
            <template v-if="column.key === 'toEmail'">
              <span class="email-cell">{{ record.toEmail }}</span>
            </template>
            <template v-if="column.key === 'subject'">
              <span class="subject-cell" :title="record.subject">{{ record.subject }}</span>
            </template>
            <template v-if="column.key === 'retryCount'">
              <span v-if="record.retryCount > 0" class="retry-badge">{{ record.retryCount }}次</span>
              <span v-else>-</span>
            </template>
            <template v-if="column.key === 'errorMessage'">
              <a-tooltip v-if="record.errorMessage" :title="record.errorMessage">
                <span class="error-text">{{ record.errorMessage }}</span>
              </a-tooltip>
              <span v-else>-</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleResend(record)" :loading="resendingId === record.id">重发</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import request from '../api/axios'

const filterStatus = ref('')
const filterRecipient = ref('')
const loading = ref(false)
const emails = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const resendingId = ref(null)

const columns = [
  { title: 'ID', key: 'id', dataIndex: 'id', width: 60 },
  { title: '收件人', key: 'toEmail', width: 200 },
  { title: '抄送', key: 'ccEmail', dataIndex: 'ccEmail', width: 150 },
  { title: '主题', key: 'subject', width: 250 },
  { title: '状态', key: 'status', width: 100 },
  { title: '重试次数', key: 'retryCount', width: 90 },
  { title: '错误信息', key: 'errorMessage', width: 150 },
  { title: '创建时间', key: 'createdAt', dataIndex: 'createdAt', width: 160 },
  { title: '发送时间', key: 'sentAt', dataIndex: 'sentAt', width: 160 },
  { title: '操作', key: 'action', width: 80 }
]

const statusLabel = (status) => {
  const labels = {
    'Pending': '待发送',
    'Sent': '已发送',
    'Failed': '失败'
  }
  return labels[status] || status
}

const fetchEmails = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    if (filterStatus.value) params.status = filterStatus.value
    if (filterRecipient.value) params.recipient = filterRecipient.value

    const res = await request.get('/email-queue', { params })

    if (res.success) {
      emails.value = res.data || []
      total.value = res.total || emails.value.length
    }
  } catch (e) {
    message.error('获取邮件队列失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchEmails()
}

const handleResend = async (record) => {
  try {
    resendingId.value = record.id
    const res = await request.post(`/email-queue/${record.id}/resend`)
    if (res.success) {
      message.success('邮件已重新加入队列')
      fetchEmails()
    } else {
      message.error(res.message || '重发失败')
    }
  } catch (e) {
    message.error('重发失败')
  } finally {
    resendingId.value = null
  }
}

const handleTableChange = (pag) => {
  currentPage.value = pag.current
  pageSize.value = pag.pageSize
  fetchEmails()
}

onMounted(() => {
  fetchEmails()
})
</script>

<style scoped>
.emailqueue-page {
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

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending { background: #FEF3C7; color: #D97706; }
.status-sent { background: #D1FAE5; color: #059669; }
.status-failed { background: #FEE2E2; color: #DC2626; }

.email-cell {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: #1F2937;
}

.subject-cell {
  display: inline-block;
  max-width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #1F2937;
}

.retry-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  background: #FEE2E2;
  color: #DC2626;
}

.error-text {
  color: #DC2626;
  font-size: 12px;
  cursor: pointer;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
</style>
