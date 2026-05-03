<template>
  <div class="template-page">
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">模板名称</span>
          <a-input v-model:value="keyword" placeholder="搜索模板" allow-clear style="width:200px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <a-select v-model:value="statusFilter" style="width:120px" placeholder="选择状态">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="active">激活</a-select-option>
            <a-select-option value="inactive">未激活</a-select-option>
          </a-select>
        </div>
        <div class="filter-actions">
          <a-button @click="fetchTemplates">刷新</a-button>
          <a-button type="primary" @click="openAddDialog">新增模板</a-button>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="table-card">
      <div class="table-wrap">
        <a-table
          :columns="columns"
          :data-source="filteredTemplates"
          :loading="loading"
          row-key="id"
          :pagination="{pageSize: 15}"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <div class="name-cell">
                <FileTextOutlined class="name-icon" />
                <span>{{ record.name }}</span>
              </div>
            </template>
            <template v-if="column.key === 'subject'">
              <span class="subject-text" :title="record.subject">{{ record.subject }}</span>
            </template>
            <template v-if="column.key === 'isActive'">
              <a-tag :color="record.isActive ? 'green' : 'default'" style="border-radius:12px">
                {{ record.isActive ? '已激活' : '未激活' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="viewTemplate(record)">查看</a-button>
                <a-button size="small" @click="editTemplate(record)">编辑</a-button>
                <a-button size="small" type="primary" ghost @click="activateTemplate(record)" :disabled="record.isActive">激活</a-button>
                <a-popconfirm title="确定删除该模板？" @confirm="handleDeleteTemplate(record)">
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
      :title="editingTemplate ? '编辑模板' : '新增模板'"
      width="640px"
      @ok="saveTemplate"
      @cancel="showModal = false"
    >
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label">模板名称<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.name" placeholder="如：审批通知模板" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label">邮件主题<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.subject" placeholder="支持占位符：{periodName}、{submitter}、{action}、{comments}、{timestamp}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label">邮件正文</label>
          <a-textarea v-model:value="formData.body" placeholder="支持占位符：{periodName}、{submitter}、{action}、{comments}、{timestamp}" :rows="6" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label">占位符说明</label>
          <div class="placeholder-hint">
            <a-tag color="blue">{'{periodName}'}</a-tag> 预测周期
            <a-tag color="blue">{'{submitter}'}</a-tag> 提交人
            <a-tag color="blue">{'{action}'}</a-tag> 操作类型
            <a-tag color="blue">{'{comments}'}</a-tag> 备注
            <a-tag color="blue">{'{timestamp}'}</a-tag> 时间
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label">设为默认激活</label>
          <a-switch v-model:checked="formData.isActive" />
        </div>
      </div>
    </a-modal>

    <!-- View Modal -->
    <a-modal v-model:open="showViewModal" title="模板详情" width="640px" :footer="null">
      <div class="view-section">
        <div class="view-label">模板名称</div>
        <div class="view-value">{{ viewData.name }}</div>
      </div>
      <div class="view-section">
        <div class="view-label">状态</div>
        <a-tag :color="viewData.isActive ? 'green' : 'default'">{{ viewData.isActive ? '已激活' : '未激活' }}</a-tag>
      </div>
      <div class="view-section">
        <div class="view-label">邮件主题</div>
        <div class="view-value subject-box">{{ viewData.subject }}</div>
      </div>
      <div class="view-section">
        <div class="view-label">邮件正文</div>
        <div class="view-value body-box">{{ viewData.body || '(空)' }}</div>
      </div>
      <div class="view-section">
        <div class="view-label">创建时间</div>
        <div class="view-value">{{ viewData.createdAt }}</div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { FileTextOutlined } from '@ant-design/icons-vue'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate as deleteTemplateApi, activateTemplate as activateTplApi } from '@/api/templates'

const keyword = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const showViewModal = ref(false)
const editingTemplate = ref(null)
const loading = ref(false)
const templates = ref([])

const viewData = reactive({
  name: '',
  subject: '',
  body: '',
  isActive: false,
  createdAt: ''
})

const formData = reactive({
  name: '',
  subject: '',
  body: '',
  placeholders: '{periodName},{submitter},{action},{comments},{timestamp}',
  isActive: false
})

const columns = [
  { title: '模板名称', key: 'name', dataIndex: 'name' },
  { title: '邮件主题', key: 'subject', dataIndex: 'subject' },
  { title: '状态', key: 'isActive' },
  { title: '操作', key: 'action', width: 220 }
]

const filteredTemplates = computed(() => {
  let list = templates.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(x => x.name.toLowerCase().includes(kw) || x.subject.toLowerCase().includes(kw))
  }
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active'
    list = list.filter(x => x.isActive === isActive)
  }
  return list
})

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const fetchTemplates = async () => {
  try {
    loading.value = true
    const res = await getTemplates()
    if (res.success) {
      templates.value = res.data || []
    }
  } catch {
    message.error('获取模板列表失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  editingTemplate.value = null
  Object.assign(formData, { name: '', subject: '', body: '', placeholders: '{periodName},{submitter},{action},{comments},{timestamp}', isActive: false })
  showModal.value = true
}

const editTemplate = (tpl) => {
  editingTemplate.value = tpl
  Object.assign(formData, { name: tpl.name, subject: tpl.subject, body: tpl.body, placeholders: tpl.placeholders || '', isActive: tpl.isActive })
  showModal.value = true
}

const viewTemplate = (tpl) => {
  Object.assign(viewData, tpl)
  showViewModal.value = true
}

const saveTemplate = async () => {
  if (!formData.name || !formData.subject) {
    message.error('请填写模板名称和邮件主题')
    return
  }
  try {
    let res
    if (editingTemplate.value) {
      res = await updateTemplate(editingTemplate.value.id, formData)
    } else {
      res = await createTemplate(formData)
    }
    if (res.success) {
      message.success(editingTemplate.value ? '模板已更新' : '模板已创建')
      showModal.value = false
      fetchTemplates()
    } else {
      message.error(res.message || '操作失败')
    }
  } catch {
    message.error('操作失败')
  }
}

const activateTemplate = async (tpl) => {
  try {
    const res = await activateTplApi(tpl.id)
    if (res.success) {
      message.success('模板已激活为默认模板')
      fetchTemplates()
    } else {
      message.error(res.message || '激活失败')
    }
  } catch {
    message.error('激活失败')
  }
}

const handleDeleteTemplate = async (tpl) => {
  try {
    const res = await deleteTemplateApi(tpl.id)
    if (res.success) {
      message.success('模板已删除')
      fetchTemplates()
    } else {
      message.error(res.message || '删除失败')
    }
  } catch {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.template-page {
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

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.name-icon {
  color: #0D3D92;
}

.subject-text {
  max-width: 280px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #64748B;
  font-size: 13px;
}

.view-section {
  margin-bottom: 16px;
}

.view-label {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.view-value {
  font-size: 14px;
  color: #374151;
}

.subject-box {
  background: #F3F4F6;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
}

.body-box {
  background: #F3F4F6;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  white-space: pre-wrap;
  min-height: 80px;
}

.form-row {
  margin-bottom: 12px;
}

.form-group.full-width {
  width: 100%;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  display: block;
}

.placeholder-hint {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: #6B7280;
}
</style>