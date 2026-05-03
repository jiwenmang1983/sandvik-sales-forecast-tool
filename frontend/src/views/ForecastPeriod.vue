<template>
  <div class="forecast-period-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">FC Name</span>
          <a-input v-model:value="filter.keyword" placeholder="输入关键字搜索" allow-clear style="width:200px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <a-select v-model:value="filter.status" style="width:130px" allow-clear placeholder="选择状态">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="Draft">草稿</a-select-option>
            <a-select-option value="Open">开放中</a-select-option>
            <a-select-option value="Closed">已关闭</a-select-option>
          </a-select>
        </div>
        <div class="filter-actions">
          <a-button @click="loadPeriods">刷新</a-button>
          <a-button type="primary" @click="openCreateDialog">新建周期</a-button>
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
          :pagination="{ pageSize: 20 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fcName'">
              <span class="fc-name-cell">{{ record.fcName }}</span>
            </template>
            <template v-if="column.key === 'fillTime'">
              {{ formatDate(record.fillTimeStart) }} ~ {{ formatDate(record.fillTimeEnd) }}
            </template>
            <template v-if="column.key === 'extensionWindow'">
              <span v-if="record.extensionEnd">
                {{ formatDate(record.extensionStart) }} ~ {{ formatDate(record.extensionEnd) }}
              </span>
              <span v-else class="text-muted">未设置</span>
            </template>
            <template v-if="column.key === 'extensionUsers'">
              <div class="ext-users-cell">
                <a-tag v-for="uid in parseExtUsers(record.extensionUsers)" :key="uid" color="blue" style="margin:1px">
                  {{ getUserDisplay(uid) }}
                </a-tag>
                <span v-if="!parseExtUsers(record.extensionUsers).length" class="text-muted">—</span>
              </div>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-badge" :class="'status-' + (record.status || 'draft').toLowerCase()">
                {{ statusLabel(record.status) }}
              </span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button size="small" type="primary" @click="openEditDialog(record)">编辑</a-button>
                <a-button size="small" danger @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- Create / Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingPeriod ? '编辑预测周期' : '新建预测周期'"
      width="640px"
      @ok="handleSave"
      @cancel="showModal = false"
      :confirm-loading="saving"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">FC Name <span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.fcName" placeholder="如：2026-Q2" />
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
          <label class="form-label">填报开始时间 <span style="color:#ff4d4f">*</span></label>
          <a-date-picker v-model:value="formData.fillTimeStart" style="width:100%" show-time format="YYYY-MM-DD HH:mm" />
        </div>
        <div class="form-group">
          <label class="form-label">填报截止时间 <span style="color:#ff4d4f">*</span></label>
          <a-date-picker v-model:value="formData.fillTimeEnd" style="width:100%" show-time format="YYYY-MM-DD HH:mm" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">预测周期开始 (年/月)</label>
          <a-input v-model:value="formData.periodStartYearMonth" placeholder="如：2026-01" />
        </div>
        <div class="form-group">
          <label class="form-label">预测周期结束 (年/月)</label>
          <a-input v-model:value="formData.periodEndYearMonth" placeholder="如：2026-06" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">延期开始时间</label>
          <a-date-picker v-model:value="formData.extensionStart" style="width:100%" show-time format="YYYY-MM-DD HH:mm" />
        </div>
        <div class="form-group">
          <label class="form-label">延期截止时间</label>
          <a-date-picker v-model:value="formData.extensionEnd" style="width:100%" show-time format="YYYY-MM-DD HH:mm" />
        </div>
      </div>

      <div class="form-group" style="margin-top:8px">
        <label class="form-label">延期用户（截止后仍可提交的用户）</label>
        <a-select
          v-model:value="formData.extensionUsers"
          mode="multiple"
          placeholder="搜索并选择用户..."
          style="width:100%"
          :filter-option="false"
          :not-found-content="userFetching ? '搜索中...' : (userSearchResults.length ? null : '无结果')"
          :loading="userFetching"
          show-search
          @search="handleUserSearch"
          @focus="loadUsers"
        >
          <a-select-option v-for="u in userSearchResults" :key="u.id" :value="u.id">
            <div style="display:flex;align-items:center;gap:6px">
              <a-avatar :size="20" :style="{ background: '#0D3D92', fontSize:'10px' }">{{ (u.userName || u.name || '?').charAt(0) }}</a-avatar>
              <span>{{ u.name || u.userName }}</span>
              <span style="color:#999;font-size:11px;margin-left:4px">{{ u.email }}</span>
            </div>
          </a-select-option>
        </a-select>
        <div v-if="selectedUserDisplays.length" class="ext-preview">
          已选：<a-tag v-for="uid in selectedUserDisplays" :key="uid.id" color="blue" style="margin:2px">{{ uid.label }}</a-tag>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getForecastPeriods, createForecastPeriod, updateForecastPeriod, deleteForecastPeriod, getAllUsers } from '@/api/forecast-period.js'

const periods = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingPeriod = ref(null)
const allUsers = ref([])

// Form state
const formData = ref({
  fcName: '',
  fillTimeStart: null,
  fillTimeEnd: null,
  periodStartYearMonth: '',
  periodEndYearMonth: '',
  extensionStart: null,
  extensionEnd: null,
  extensionUsers: [],
  status: 'Draft'
})

// Filter state
const filter = ref({ keyword: '', status: '' })

// User search
const userSearchResults = ref([])
const userFetching = ref(false)
const userSearchTimer = ref(null)

const columns = [
  { title: 'FC Name', dataIndex: 'fcName', key: 'fcName', width: 140 },
  { title: '填报时间窗口', key: 'fillTime', width: 240 },
  { title: '销售预测周期', dataIndex: 'periodStartYearMonth', key: 'period', width: 180 },
  { title: '延期时间窗口', key: 'extensionWindow', width: 220 },
  { title: '延期用户', key: 'extensionUsers', width: 200 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 130 }
]

const filteredPeriods = computed(() => {
  let list = periods.value
  if (filter.value.keyword) {
    const kw = filter.value.keyword.toLowerCase()
    list = list.filter(p => (p.fcName || '').toLowerCase().includes(kw))
  }
  if (filter.value.status) {
    list = list.filter(p => p.status === filter.value.status)
  }
  return list
})

const selectedUserDisplays = computed(() => {
  return (formData.value.extensionUsers || []).map(id => {
    const u = allUsers.value.find(x => x.id === id)
    return { id, label: u ? (u.name || u.userName || id) : id }
  })
})

function parseExtUsers(json) {
  try { return JSON.parse(json || '[]') } catch { return [] }
}

function formatDate(val) {
  if (!val) return '—'
  return dayjs(val).format('YYYY-MM-DD HH:mm')
}

function statusLabel(s) {
  const m = { Draft: '草稿', Open: '开放中', Closed: '已关闭' }
  return m[s] || s || '草稿'
}

function getUserDisplay(id) {
  const u = allUsers.value.find(x => x.id === id)
  return u ? (u.name || u.userName || id) : id
}

async function loadPeriods() {
  loading.value = true
  try {
    const res = await getForecastPeriods()
    periods.value = res.data || []
  } catch (e) {
    message.error('加载周期列表失败')
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  if (allUsers.value.length) {
    userSearchResults.value = allUsers.value
    return
  }
  userFetching.value = true
  try {
    const res = await getAllUsers()
    allUsers.value = res.data || []
    userSearchResults.value = allUsers.value
  } catch (e) {
    userSearchResults.value = []
  } finally {
    userFetching.value = false
  }
}

function handleUserSearch(val) {
  clearTimeout(userSearchTimer.value)
  userSearchTimer.value = setTimeout(() => {
    if (!val) {
      userSearchResults.value = allUsers.value
      return
    }
    const kw = val.toLowerCase()
    userSearchResults.value = allUsers.value.filter(u =>
      (u.name || '').toLowerCase().includes(kw) ||
      (u.userName || '').toLowerCase().includes(kw) ||
      (u.email || '').toLowerCase().includes(kw)
    )
  }, 250)
}

function openCreateDialog() {
  editingPeriod.value = null
  formData.value = {
    fcName: '',
    fillTimeStart: null,
    fillTimeEnd: null,
    periodStartYearMonth: '',
    periodEndYearMonth: '',
    extensionStart: null,
    extensionEnd: null,
    extensionUsers: [],
    status: 'Draft'
  }
  showModal.value = true
}

function openEditDialog(record) {
  editingPeriod.value = record
  let extUsers = []
  try { extUsers = JSON.parse(record.extensionUsers || '[]') } catch {}

  formData.value = {
    fcName: record.fcName,
    fillTimeStart: record.fillTimeStart ? dayjs(record.fillTimeStart) : null,
    fillTimeEnd: record.fillTimeEnd ? dayjs(record.fillTimeEnd) : null,
    periodStartYearMonth: record.periodStartYearMonth || '',
    periodEndYearMonth: record.periodEndYearMonth || '',
    extensionStart: record.extensionStart ? dayjs(record.extensionStart) : null,
    extensionEnd: record.extensionEnd ? dayjs(record.extensionEnd) : null,
    extensionUsers: extUsers,
    status: record.status || 'Draft'
  }
  showModal.value = true
}

function toPayload() {
  const f = formData.value
  return {
    fcName: f.fcName,
    fillTimeStart: f.fillTimeStart ? f.fillTimeStart.toDate() : new Date(),
    fillTimeEnd: f.fillTimeEnd ? f.fillTimeEnd.toDate() : new Date(),
    periodStartYearMonth: f.periodStartYearMonth,
    periodEndYearMonth: f.periodEndYearMonth,
    extensionStart: f.extensionStart ? f.extensionStart.toDate() : null,
    extensionEnd: f.extensionEnd ? f.extensionEnd.toDate() : null,
    extensionUsers: JSON.stringify(f.extensionUsers || []),
    status: f.status
  }
}

async function handleSave() {
  if (!formData.value.fcName) {
    message.warning('请填写 FC Name')
    return
  }
  saving.value = true
  try {
    const payload = toPayload()
    if (editingPeriod.value) {
      await updateForecastPeriod(editingPeriod.value.id, payload)
      message.success('更新成功')
    } else {
      await createForecastPeriod(payload)
      message.success('创建成功')
    }
    showModal.value = false
    await loadPeriods()
  } catch (e) {
    message.error(editingPeriod.value ? '更新失败' : '创建失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(record) {
  try {
    await deleteForecastPeriod(record.id)
    message.success('删除成功')
    await loadPeriods()
  } catch {
    message.error('删除失败')
  }
}

onMounted(async () => {
  await loadPeriods()
  await loadUsers()
})
</script>

<style scoped>
.forecast-period-page { padding: 0; }
.filter-card, .table-card { margin-bottom: 12px; border-radius: 16px; box-shadow: 0 2px 8px rgba(13,61,146,0.06); }
.filter-bar { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 4px; }
.filter-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.filter-actions { display: flex; gap: 8px; margin-left: auto; }
.table-wrap { overflow-x: auto; }
.fc-name-cell { font-weight: 600; color: #0D3D92; }
.ext-users-cell { display: flex; flex-wrap: wrap; gap: 2px; max-width: 180px; }
.text-muted { color: #aaa; font-size: 12px; }
.status-badge { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status-draft { background: #F3F4F6; color: #6B7280; }
.status-open { background: #DCFCE7; color: #166534; }
.status-closed { background: #FEE2E2; color: #991B1B; }
.form-row { display: flex; gap: 12px; margin-bottom: 10px; }
.form-row .form-group { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
.form-label { font-size: 12px; color: #374151; font-weight: 500; }
.ext-preview { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px; }
</style>
