<template>
  <div class="fcversion-page">
    <!-- Toolbar -->
    <a-card :bordered="false" style="margin-bottom:16px">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input v-model:value="keyword" placeholder="搜索周期名称..." allow-clear style="width:220px" @input="onSearch" />
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <a-select v-model:value="statusFilter" style="width:120px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="draft">草稿</a-select-option>
              <a-select-option value="open">开放</a-select-option>
              <a-select-option value="locked">已锁定</a-select-option>
              <a-select-option value="closed">已关闭</a-select-option>
            </a-select>
          </div>
        </div>
        <div class="toolbar-right">
          <a-button type="primary" @click="openAddDialog">➕ 创建新周期</a-button>
        </div>
      </div>
    </a-card>

    <!-- Version Table -->
    <a-card :bordered="false">
      <a-table :columns="columns" :data-source="filteredVersions" :pagination="{pageSize:15}" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'period'">
            <div class="period-cell">
              <span class="period-name">{{ record.period }}</span>
              <span class="period-year">{{ record.year }}年</span>
            </div>
          </template>
          <template v-if="column.key === 'months'">
            <span>{{ record.months.join('、') }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="statusTagColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
          </template>
          <template v-if="column.key === 'submitter'">
            <div style="display:flex;align-items:center;gap:6px;">
              <a-avatar :size="22" :style="{ background: '#0D3D92' }">{{ record.submitter?.charAt(0) }}</a-avatar>
              <span>{{ record.submitter }}</span>
            </div>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button v-if="record.status === 'draft'" size="small" type="primary" @click="openVersion(record)">📝 填报</a-button>
              <a-button v-if="record.status === 'open'" size="small" @click="lockVersion(record)">🔒 锁定</a-button>
              <a-button v-if="record.status === 'locked'" size="small" @click="unlockVersion(record)">🔓 解锁</a-button>
              <a-button size="small" @click="viewHistory(record)">📋 历史</a-button>
              <a-button size="small" danger @click="deleteVersion(record)">🗑️</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingVersion ? '编辑周期' : '创建预测周期'"
      @ok="saveVersion"
      @cancel="showModal = false"
    >
      <div class="form-group">
        <label class="form-label">周期名称<span style="color:#ff4d4f">*</span></label>
        <a-input v-model:value="formData.period" placeholder="如：2026FC3" />
      </div>
      <div class="form-row" style="margin-top:12px;">
        <div class="form-group">
          <label class="form-label">预测年份<span style="color:#ff4d4f">*</span></label>
          <a-input-number v-model:value="formData.year" :min="2020" :max="2030" style="width:100%" />
        </div>
        <div class="form-group">
          <label class="form-label">预测季度</label>
          <a-select v-model:value="formData.quarter">
            <a-select-option value="Q1">Q1</a-select-option>
            <a-select-option value="Q2">Q2</a-select-option>
            <a-select-option value="Q3">Q3</a-select-option>
            <a-select-option value="Q4">Q4</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <div class="form-group">
          <label class="form-label">填报开始日期</label>
          <a-date-picker v-model:value="formData.startDate" style="width:100%" />
        </div>
        <div class="form-group">
          <label class="form-label">填报截止日期</label>
          <a-date-picker v-model:value="formData.endDate" style="width:100%" />
        </div>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label class="form-label">状态</label>
        <a-select v-model:value="formData.status">
          <a-select-option value="draft">草稿</a-select-option>
          <a-select-option value="open">开放</a-select-option>
          <a-select-option value="locked">已锁定</a-select-option>
          <a-select-option value="closed">已关闭</a-select-option>
        </a-select>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const keyword = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editingVersion = ref(null)

const formData = reactive({
  period: '',
  year: 2026,
  quarter: 'Q2',
  startDate: null,
  endDate: null,
  status: 'draft'
})

const columns = [
  { title: '周期名称', key: 'period', width: 180 },
  { title: '预测季度', key: 'quarter', dataIndex: 'quarter', width: 100 },
  { title: '预测月份', key: 'months', width: 200 },
  { title: '填报窗口', key: 'window', dataIndex: 'window', width: 200 },
  { title: '状态', key: 'status', width: 100 },
  { title: '提交人', key: 'submitter', width: 140 },
  { title: '创建时间', key: 'createTime', dataIndex: 'createTime', width: 140 },
  { title: '操作', key: 'actions', width: 260 }
]

const versions = ref([
  { id: 1, period: '2026FC3', year: 2026, quarter: 'Q3', months: ['2026-07', '2026-08', '2026-09'], window: '2026-07-01 ~ 2026-07-31', status: 'draft', submitter: '陈明', createTime: '2026-04-28' },
  { id: 2, period: '2026FC2', year: 2026, quarter: 'Q2', months: ['2026-04', '2026-05', '2026-06'], window: '2026-04-01 ~ 2026-04-30', status: 'open', submitter: '张伟', createTime: '2026-03-28' },
  { id: 3, period: '2026FC1', year: 2026, quarter: 'Q1', months: ['2026-01', '2026-02', '2026-03'], window: '2026-01-01 ~ 2026-01-31', status: 'locked', submitter: '张伟', createTime: '2025-12-28' },
  { id: 4, period: '2025FC2', year: 2025, quarter: 'Q2', months: ['2025-07', '2025-08', '2025-09'], window: '2025-07-01 ~ 2025-07-31', status: 'closed', submitter: '王强', createTime: '2025-06-28' },
  { id: 5, period: '2025FC1', year: 2025, quarter: 'Q1', months: ['2025-01', '2025-02', '2025-03'], window: '2025-01-01 ~ 2025-01-31', status: 'closed', submitter: '吴昊', createTime: '2024-12-28' }
])

const filteredVersions = computed(() => {
  let list = versions.value
  if (keyword.value) list = list.filter(x => x.period.includes(keyword.value))
  if (statusFilter.value) list = list.filter(x => x.status === statusFilter.value)
  return list
})

const statusLabel = (s) => ({ draft: '草稿', open: '开放', locked: '已锁定', closed: '已关闭' }[s] || s)
const statusTagColor = (s) => ({ draft: 'default', open: 'green', locked: 'orange', closed: 'red' }[s] || 'default')

const onSearch = () => {}

const openAddDialog = () => {
  editingVersion.value = null
  Object.assign(formData, { period: '', year: 2026, quarter: 'Q2', startDate: null, endDate: null, status: 'draft' })
  showModal.value = true
}

const editVersion = (v) => {
  editingVersion.value = v
  Object.assign(formData, v)
  showModal.value = true
}

const saveVersion = () => {
  if (!formData.period) { message.error('请填写周期名称'); return }
  if (editingVersion.value) {
    const idx = versions.value.findIndex(x => x.id === editingVersion.value.id)
    if (idx >= 0) Object.assign(versions.value[idx], { ...formData })
    message.success('周期已更新')
  } else {
    versions.value.unshift({ id: Date.now(), ...formData, months: getMonths(formData.year, formData.quarter), window: '待设置', submitter: '当前用户', createTime: new Date().toISOString().split('T')[0] })
    message.success('周期已创建')
  }
  showModal.value = false
}

const getMonths = (year, quarter) => {
  const q = parseInt(quarter.replace('Q', ''))
  const startMonth = (q - 1) * 3 + 1
  return [year + '-' + String(startMonth).padStart(2, '0'), year + '-' + String(startMonth + 1).padStart(2, '0'), year + '-' + String(startMonth + 2).padStart(2, '0')]
}

const lockVersion = (v) => {
  v.status = 'locked'
  message.success('周期已锁定')
}

const unlockVersion = (v) => {
  v.status = 'open'
  message.success('周期已解锁')
}

const deleteVersion = (v) => {
  const idx = versions.value.findIndex(x => x.id === v.id)
  if (idx >= 0) versions.value.splice(idx, 1)
  message.success('周期已删除')
}

const openVersion = (v) => { message.info('进入填报：' + v.period) }
const viewHistory = (v) => { message.info('查看历史：' + v.period) }
</script>

<style scoped>
.fcversion-page { }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.toolbar-left { display: flex; gap: 12px; align-items: center; }
.toolbar-right { display: flex; gap: 8px; }
.filter-item { display: flex; flex-direction: column; gap: 3px; }
.filter-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.period-cell { display: flex; flex-direction: column; }
.period-name { font-weight: 700; font-size: 14px; color: #0D3D92; }
.period-year { font-size: 11px; color: #6B7280; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 12px; font-weight: 600; color: #6B7280; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>