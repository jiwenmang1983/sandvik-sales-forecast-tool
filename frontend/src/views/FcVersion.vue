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
        <a-table :columns="columns" :data-source="filteredVersions" :loading="loading" row-key="id" :pagination="{pageSize: 20}">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fcName'">
              <span class="fc-name-cell">{{ record.fcName }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="editVersion(record)">编辑</a-button>
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
  period: '',
  startDate: null,
  endDate: null,
  extendDate: null,
  extendUsers: '',
  status: 'open'
})

const columns = [
  { title: 'FC Name', key: 'fcName', dataIndex: 'fcName' },
  { title: '销售预测周期', key: 'period', dataIndex: 'period' },
  { title: '填报时间', key: 'fillTime', dataIndex: 'fillTime' },
  { title: '延期填报时间', key: 'extendTime', dataIndex: 'extendTime' },
  { title: '可延期人员', key: 'extendUsers', dataIndex: 'extendUsers' },
  { title: '操作', key: 'action' }
]

const versions = ref([])

const filteredVersions = computed(() => {
  let list = versions.value
  if (keyword.value) {
    list = list.filter(x => x.fcName.toLowerCase().includes(keyword.value.toLowerCase()) || x.period.toLowerCase().includes(keyword.value.toLowerCase()))
  }
  if (statusFilter.value) list = list.filter(x => x.status === statusFilter.value)
  return list
})

const fetchVersions = async () => {
  try {
    loading.value = true
    const res = await fetch('/api/versions')
    const data = await res.json()
    if (data.success) {
      // Map backend data to frontend expected format
      versions.value = (data.data || []).map(v => ({
        id: v.id,
        fcName: v.versionNumber,
        period: v.versionName,
        fillTime: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '',
        extendTime: v.updatedAt ? new Date(v.updatedAt).toLocaleDateString() : '',
        extendUsers: '',
        status: v.status,
        // Keep original data for editing
        _original: v
      }))
    }
  } catch (e) {
    message.error('获取预测周期数据失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  editingVersion.value = null
  Object.assign(formData, { fcName: '', period: '', startDate: null, endDate: null, extendDate: null, extendUsers: '', status: 'open' })
  showModal.value = true
}

const editVersion = (v) => {
  editingVersion.value = v
  // Use original backend data if available
  const original = v._original || v
  Object.assign(formData, {
    fcName: original.versionNumber || v.fcName,
    period: original.versionName || v.period,
    startDate: null,
    endDate: null,
    extendDate: null,
    extendUsers: v.extendUsers || '',
    status: original.status || v.status
  })
  showModal.value = true
}

const saveVersion = async () => {
  if (!formData.fcName || !formData.period) {
    message.error('请填写必填项')
    return
  }
  try {
    const body = {
      versionNumber: formData.fcName,
      versionName: formData.period,
      description: '',
      status: formData.status
    }
    
    let res, data
    if (editingVersion.value) {
      res = await fetch(`/api/versions/${editingVersion.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } else {
      res = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    }
    data = await res.json()
    
    if (data.success) {
      message.success(editingVersion.value ? '周期已更新' : '周期已创建')
      showModal.value = false
      fetchVersions()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (e) {
    message.error('操作失败')
  }
}

const viewHistory = (v) => {
  message.info('查看历史：' + v.fcName)
}

const deleteVersion = async (v) => {
  try {
    const res = await fetch(`/api/versions/${v.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      message.success('周期已删除')
      fetchVersions()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (e) {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchVersions()
})
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
