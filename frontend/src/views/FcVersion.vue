<template>
  <div class="fcversion-page">
    <!-- Toolbar -->
    <a-card :bordered="false" class="toolbar-card">
      <div class="toolbar">
        <h3 class="section-title">预测周期管理</h3>
        <a-button type="primary" @click="openAddDialog">新增预测周期</a-button>
      </div>
    </a-card>

    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">FC Name</span>
          <a-input v-model:value="keyword" placeholder="输入FC Name关键字" allow-clear style="width:200px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <a-select v-model:value="statusFilter" style="width:130px" allow-clear placeholder="选择状态">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="Draft">草稿</a-select-option>
            <a-select-option value="Open">开放中</a-select-option>
            <a-select-option value="Closed">已关闭</a-select-option>
          </a-select>
        </div>
      </div>
    </a-card>

    <!-- Period Table -->
    <a-card :bordered="false" class="table-card">
      <div class="table-wrap">
        <a-table
          :columns="columns"
          :data-source="filteredPeriods"
          :loading="loading"
          row-key="id"
          :pagination="{pageSize: 20}"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fcName'">
              <span class="fc-name-cell">{{ record.fcName }}</span>
            </template>
            <template v-if="column.key === 'fillTime'">
              {{ formatDate(record.fillTimeStart) }} – {{ formatDate(record.fillTimeEnd) }}
            </template>
            <template v-if="column.key === 'period'">
              {{ record.periodStartYearMonth }} ~ {{ record.periodEndYearMonth }}
            </template>
            <template v-if="column.key === 'extension'">
              {{ record.extensionStart ? formatDate(record.extensionStart) : '—' }} – {{ record.extensionEnd ? formatDate(record.extensionEnd) : '—' }}
            </template>
            <template v-if="column.key === 'extensionUsers'">
              <span v-if="getExtensionUserNames(record.extensionUsers).length">
                {{ getExtensionUserNames(record.extensionUsers).join(', ') }}
              </span>
              <span v-else class="text-muted">—</span>
            </template>
            <template v-if="column.key === 'status'">
              <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button size="small" type="primary" ghost @click="editVersion(record)">编辑</a-button>
                <a-button size="small" @click="viewHistory(record)">历史</a-button>
                <a-popconfirm title="确定要删除吗?" @confirm="deleteVersion(record)">
                  <a-button size="small" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingVersion ? '编辑预测周期' : '新增预测周期'"
      width="700px"
      @ok="saveVersion"
      @cancel="showModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">FC Name<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.fcName" placeholder="如：2026FC3" />
        </div>
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-select v-model:value="formData.status" style="width:100%">
            <a-select-option value="Draft">草稿</a-select-option>
            <a-select-option value="Open">开放中</a-select-option>
            <a-select-option value="Closed">已关闭</a-select-option>
          </a-select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">销售预测周期开始</label>
          <a-date-picker v-model:value="formData.periodStart" style="width:100%" picker="month" />
        </div>
        <div class="form-group">
          <label class="form-label">销售预测周期结束</label>
          <a-date-picker v-model:value="formData.periodEnd" style="width:100%" picker="month" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">填报开始时间</label>
          <a-date-picker v-model:value="formData.fillTimeStart" style="width:100%" show-time />
        </div>
        <div class="form-group">
          <label class="form-label">填报截止时间</label>
          <a-date-picker v-model:value="formData.fillTimeEnd" style="width:100%" show-time />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">延期开始时间</label>
          <a-date-picker v-model:value="formData.extensionStart" style="width:100%" show-time />
        </div>
        <div class="form-group">
          <label class="form-label">延期截止时间</label>
          <a-date-picker v-model:value="formData.extensionEnd" style="width:100%" show-time />
        </div>
      </div>

      <div class="form-group-full">
        <label class="form-label">延期可填报人员</label>
        <div class="ext-users-wrapper">
          <!-- Selected chips -->
          <div class="ext-users-chips" v-if="formData.extensionUsers.length">
            <a-tag
              v-for="uid in formData.extensionUsers"
              :key="uid"
              closable
              @close="removeExtUser(uid)"
              color="blue"
            >
              {{ getUserDisplayName(uid) }}
            </a-tag>
          </div>
          <!-- Search input -->
          <div class="ext-users-search-row">
            <a-input
              v-model:value="userSearchKeyword"
              placeholder="输入用户名或姓名搜索"
              @change="debouncedSearchUsers"
              allow-clear
              style="flex:1"
            />
          </div>
          <!-- Search results dropdown -->
          <div class="ext-users-results" v-if="userSearchResults.length">
            <div
              v-for="u in userSearchResults"
              :key="u.id"
              class="ext-user-item"
              @click="addExtUser(u)"
            >
              <span class="ext-user-name">{{ u.displayName }}</span>
              <span class="ext-user-account">@{{ u.userName }}</span>
            </div>
          </div>
          <div class="ext-users-empty" v-if="userSearchKeyword && !userSearchResults.length && !userSearchLoading">
            未找到匹配用户
          </div>
          <div class="ext-users-loading" v-if="userSearchLoading">
            <a-spin size="small" /> 搜索中...
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const keyword = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editingVersion = ref(null)
const loading = ref(false)

const formData = reactive({
  fcName: '',
  status: 'Draft',
  periodStart: null,
  periodEnd: null,
  fillTimeStart: null,
  fillTimeEnd: null,
  extensionStart: null,
  extensionEnd: null,
  extensionUsers: []
})

const userSearchKeyword = ref('')
const userSearchResults = ref([])
const userSearchLoading = ref(false)
let userSearchTimer = null

const allUsers = ref([])

const columns = [
  { title: 'FC Name', key: 'fcName', dataIndex: 'fcName', width: 160 },
  { title: '填报时间', key: 'fillTime', width: 220 },
  { title: '销售预测周期', key: 'period', width: 200 },
  { title: '延期窗口', key: 'extension', width: 220 },
  { title: '延期人员', key: 'extensionUsers', width: 160 },
  { title: '状态', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' }
]

const periods = ref([])

const filteredPeriods = computed(() => {
  let list = periods.value
  if (keyword.value) {
    list = list.filter(x => (x.fcName || '').toLowerCase().includes(keyword.value.toLowerCase()))
  }
  if (statusFilter.value) list = list.filter(x => x.status === statusFilter.value)
  return list
})

const formatDate = (d) => {
  if (!d) return '—'
  return dayjs(d).format('YYYY-MM-DD HH:mm')
}

const statusColor = (s) => {
  if (s === 'Open') return 'green'
  if (s === 'Closed') return 'red'
  return 'default'
}

const statusLabel = (s) => {
  if (s === 'Open') return '开放中'
  if (s === 'Closed') return '已关闭'
  if (s === 'Draft') return '草稿'
  return s || '—'
}

const getExtensionUserNames = (extUsersJson) => {
  if (!extUsersJson) return []
  try {
    const arr = JSON.parse(extUsersJson)
    return arr.map(uid => getUserDisplayName(uid))
  } catch {
    return []
  }
}

const getUserDisplayName = (uid) => {
  const u = allUsers.value.find(x => x.id === uid)
  return u ? (u.displayName || u.userName || uid) : uid
}

const fetchPeriods = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/forecast-periods', {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    })
    const data = await res.json()
    if (data.success) {
      periods.value = (data.data || []).filter(p => !p.isDeleted)
    } else {
      message.error(data.message || '获取预测周期失败')
    }
  } catch (e) {
    message.error('获取预测周期失败')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/users', {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    })
    const data = await res.json()
    if (data.success) {
      allUsers.value = data.data || []
    }
  } catch { /* silent */ }
}

const debouncedSearchUsers = () => {
  clearTimeout(userSearchTimer)
  if (!userSearchKeyword.value.trim()) {
    userSearchResults.value = []
    userSearchLoading.value = false
    return
  }
  userSearchLoading.value = true
  userSearchTimer = setTimeout(() => doSearchUsers(), 300)
}

const doSearchUsers = async () => {
  const kw = userSearchKeyword.value.trim()
  if (!kw) return
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/users?keyword=${encodeURIComponent(kw)}`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    })
    const data = await res.json()
    if (data.success) {
      userSearchResults.value = (data.data || []).filter(u => !formData.extensionUsers.includes(u.id))
    }
  } catch { userSearchResults.value = [] }
  userSearchLoading.value = false
}

const addExtUser = (user) => {
  if (!formData.extensionUsers.includes(user.id)) {
    formData.extensionUsers.push(user.id)
  }
  userSearchKeyword.value = ''
  userSearchResults.value = []
}

const removeExtUser = (uid) => {
  formData.extensionUsers = formData.extensionUsers.filter(id => id !== uid)
}

const openAddDialog = () => {
  editingVersion.value = null
  Object.assign(formData, {
    fcName: '',
    status: 'Draft',
    periodStart: null,
    periodEnd: null,
    fillTimeStart: null,
    fillTimeEnd: null,
    extensionStart: null,
    extensionEnd: null,
    extensionUsers: []
  })
  userSearchKeyword.value = ''
  userSearchResults.value = []
  showModal.value = true
}

const editVersion = (v) => {
  editingVersion.value = v
  let extUsers = []
  try { extUsers = JSON.parse(v.extensionUsers || '[]') } catch { extUsers = [] }
  Object.assign(formData, {
    fcName: v.fcName || '',
    status: v.status || 'Draft',
    periodStart: v.periodStartYearMonth ? dayjs(v.periodStartYearMonth, 'YYYY-MM') : null,
    periodEnd: v.periodEndYearMonth ? dayjs(v.periodEndYearMonth, 'YYYY-MM') : null,
    fillTimeStart: v.fillTimeStart ? dayjs(v.fillTimeStart) : null,
    fillTimeEnd: v.fillTimeEnd ? dayjs(v.fillTimeEnd) : null,
    extensionStart: v.extensionStart ? dayjs(v.extensionStart) : null,
    extensionEnd: v.extensionEnd ? dayjs(v.extensionEnd) : null,
    extensionUsers: extUsers
  })
  userSearchKeyword.value = ''
  userSearchResults.value = []
  showModal.value = true
}

const saveVersion = async () => {
  if (!formData.fcName) {
    message.error('FC Name 为必填项')
    return
  }
  try {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' }

    const body = {
      fcName: formData.fcName,
      fillTimeStart: formData.fillTimeStart ? formData.fillTimeStart.toDate() : null,
      fillTimeEnd: formData.fillTimeEnd ? formData.fillTimeEnd.toDate() : null,
      periodStartYearMonth: formData.periodStart ? formData.periodStart.format('YYYY-MM') : '',
      periodEndYearMonth: formData.periodEnd ? formData.periodEnd.format('YYYY-MM') : '',
      extensionStart: formData.extensionStart ? formData.extensionStart.toDate() : null,
      extensionEnd: formData.extensionEnd ? formData.extensionEnd.toDate() : null,
      extensionUsers: JSON.stringify(formData.extensionUsers),
      status: formData.status
    }

    let url = '/api/forecast-periods'
    let method = 'POST'
    if (editingVersion.value) {
      url = `/api/forecast-periods/${editingVersion.value.id}`
      method = 'PUT'
    }

    const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
    const data = await res.json()

    if (data.success) {
      message.success(editingVersion.value ? '预测周期已更新' : '预测周期已创建')
      showModal.value = false
      fetchPeriods()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (e) {
    message.error('操作失败: ' + e.message)
  }
}

const viewHistory = (v) => {
  message.info('查看历史: ' + v.fcName)
}

const deleteVersion = async (v) => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/forecast-periods/${v.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' }
    })
    const data = await res.json()
    if (data.success) {
      message.success('预测周期已删除')
      fetchPeriods()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (e) {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchPeriods()
  fetchUsers()
})
</script>

<style scoped>
.fcversion-page { padding: 0; }

.toolbar-card, .filter-card, .table-card {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
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

.table-wrap { overflow-x: auto; }

.fc-name-cell { font-weight: 600; color: #0D3D92; }
.text-muted { color: #aaa; font-size: 12px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-group-full { margin-bottom: 12px; }

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

/* Extension users multi-select styles */
.ext-users-wrapper {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px;
  min-height: 60px;
  background: #fff;
}

.ext-users-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.ext-users-search-row {
  display: flex;
  gap: 8px;
}

.ext-users-results {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  margin-top: 4px;
  max-height: 180px;
  overflow-y: auto;
  background: #fff;
}

.ext-user-item {
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s;
}

.ext-user-item:hover { background: #f0f0f0; }

.ext-user-name { font-weight: 600; color: #374151; }
.ext-user-account { color: #888; font-size: 12px; }
.ext-users-empty, .ext-users-loading {
  padding: 8px 12px;
  color: #888;
  font-size: 13px;
}
</style>