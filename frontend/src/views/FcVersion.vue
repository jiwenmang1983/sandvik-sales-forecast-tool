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
            <a-select-option value="open">开放中</a-select-option>
            <a-select-option value="closed">已关闭</a-select-option>
          </a-select>
        </div>
      </div>
    </a-card>

    <!-- Version Table -->
    <a-card :bordered="false" class="table-card">
      <div class="table-wrap">
        <table class="forecast-table">
          <thead>
            <tr>
              <th>FC Name</th>
              <th>销售预测周期</th>
              <th>填报时间</th>
              <th>延期填报时间</th>
              <th>可延期人员</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in filteredVersions" :key="v.id">
              <td><span class="fc-name-cell">{{ v.fcName }}</span></td>
              <td>{{ v.period }}</td>
              <td>{{ v.fillTime }}</td>
              <td>{{ v.extendTime || '-' }}</td>
              <td>{{ v.extendUsers || '-' }}</td>
              <td>
                <a-space>
                  <a-button size="small" @click="editVersion(v)">编辑</a-button>
                  <a-button size="small" @click="viewHistory(v)">历史</a-button>
                  <a-button size="small" danger @click="deleteVersion(v)">删除</a-button>
                </a-space>
              </td>
            </tr>
            <tr v-if="filteredVersions.length === 0">
              <td colspan="6" class="empty-cell">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingVersion ? '编辑预测周期' : '新增预测周期'"
      @ok="saveVersion"
      @cancel="showModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">FC Name<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.fcName" placeholder="如：2026FC3" />
        </div>
        <div class="form-group">
          <label class="form-label">销售预测周期<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.period" placeholder="如：2026FC3-Q3" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">填报开始时间</label>
          <a-date-picker v-model:value="formData.startDate" style="width:100%" />
        </div>
        <div class="form-group">
          <label class="form-label">填报截止时间</label>
          <a-date-picker v-model:value="formData.endDate" style="width:100%" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">延期填报时间</label>
          <a-date-picker v-model:value="formData.extendDate" style="width:100%" />
        </div>
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-select v-model:value="formData.status">
            <a-select-option value="open">开放中</a-select-option>
            <a-select-option value="closed">已关闭</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-group-full">
        <label class="form-label">可延期人员</label>
        <a-input v-model:value="formData.extendUsers" placeholder="填写可延期人员名单，用逗号分隔" />
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
  fcName: '',
  period: '',
  startDate: null,
  endDate: null,
  extendDate: null,
  extendUsers: '',
  status: 'open'
})

const versions = ref([
  { id: 1, fcName: '2026FC3', period: '2026FC3-Q3', fillTime: '2026-07-01 ~ 2026-07-31', extendTime: '', extendUsers: '', status: 'open' },
  { id: 2, fcName: '2026FC2', period: '2026FC2-Q2', fillTime: '2026-04-01 ~ 2026-04-30', extendTime: '2026-05-05', extendUsers: '张伟, 王强', status: 'closed' },
  { id: 3, fcName: '2026FC1', period: '2026FC1-Q1', fillTime: '2026-01-01 ~ 2026-01-31', extendTime: '', extendUsers: '', status: 'closed' },
  { id: 4, fcName: '2025FC2', period: '2025FC2-Q2', fillTime: '2025-07-01 ~ 2025-07-31', extendTime: '', extendUsers: '', status: 'closed' }
])

const filteredVersions = computed(() => {
  let list = versions.value
  if (keyword.value) {
    list = list.filter(x => x.fcName.toLowerCase().includes(keyword.value.toLowerCase()) || x.period.toLowerCase().includes(keyword.value.toLowerCase()))
  }
  if (statusFilter.value) list = list.filter(x => x.status === statusFilter.value)
  return list
})

const openAddDialog = () => {
  editingVersion.value = null
  Object.assign(formData, { fcName: '', period: '', startDate: null, endDate: null, extendDate: null, extendUsers: '', status: 'open' })
  showModal.value = true
}

const editVersion = (v) => {
  editingVersion.value = v
  Object.assign(formData, v)
  showModal.value = true
}

const saveVersion = () => {
  if (!formData.fcName || !formData.period) {
    message.error('请填写必填项')
    return
  }
  if (editingVersion.value) {
    const idx = versions.value.findIndex(x => x.id === editingVersion.value.id)
    if (idx >= 0) Object.assign(versions.value[idx], { ...formData })
    message.success('周期已更新')
  } else {
    versions.value.push({ id: Date.now(), ...formData, fillTime: formData.startDate && formData.endDate ? `${formData.startDate.format('YYYY-MM-DD')} ~ ${formData.endDate.format('YYYY-MM-DD')}` : '' })
    message.success('周期已创建')
  }
  showModal.value = false
}

const viewHistory = (v) => {
  message.info('查看历史：' + v.fcName)
}

const deleteVersion = (v) => {
  const idx = versions.value.findIndex(x => x.id === v.id)
  if (idx >= 0) versions.value.splice(idx, 1)
  message.success('周期已删除')
}
</script>

<style scoped>
.fcversion-page {
  padding: 0;
}

.toolbar-card,
.filter-card,
.table-card {
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

.table-wrap {
  overflow-x: auto;
}

.forecast-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.forecast-table th {
  background: #F8FAFC;
  color: #475569;
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #E2E8F0;
  white-space: nowrap;
}

.forecast-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #F1F5F9;
  color: #1E293B;
}

.fc-name-cell {
  font-weight: 600;
  color: #0D3D92;
}

.empty-cell {
  text-align: center;
  color: #94A3B8;
  padding: 32px !important;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group-full {
  margin-bottom: 12px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}
</style>
