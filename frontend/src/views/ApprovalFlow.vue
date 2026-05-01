<template>
  <div class="approvalflow-page">
    <!-- Toolbar -->
    <a-card :bordered="false" style="margin-bottom:16px">
      <div class="toolbar">
        <span style="font-size:14px;font-weight:600;color:#1F2937;">审批流程配置</span>
        <a-button type="primary" @click="openAddDialog">➕ 新建流程</a-button>
      </div>
    </a-card>

    <!-- Flow List -->
    <div class="flow-list">
      <a-card
        v-for="flow in flows"
        :key="flow.id"
        :bordered="false"
        class="flow-card"
        hoverable
      >
        <div class="flow-header">
          <div class="flow-title">
            <span class="flow-icon">🔄</span>
            <span class="flow-name">{{ flow.name }}</span>
            <a-tag :color="flow.active ? 'green' : 'default'">{{ flow.active ? '启用' : '停用' }}</a-tag>
          </div>
          <div class="flow-actions">
            <a-button size="small" @click="editFlow(flow)">✏️</a-button>
            <a-button size="small" danger @click="deleteFlow(flow)">🗑️</a-button>
          </div>
        </div>

        <!-- Steps -->
        <div class="flow-steps-wrap">
          <a-steps :current="flow.steps.length - 1" size="small" style="padding: 0 8px;">
            <a-step v-for="(step, idx) in flow.steps" :key="idx" :title="step.name" :description="step.approver" />
          </a-steps>
        </div>

        <!-- Flow Info -->
        <div class="flow-info">
          <div class="flow-info-item">
            <span class="flow-info-label">适用范围</span>
            <span class="flow-info-value">{{ flow.scope }}</span>
          </div>
          <div class="flow-info-item">
            <span class="flow-info-label">触发条件</span>
            <span class="flow-info-value">{{ flow.condition }}</span>
          </div>
          <div class="flow-info-item">
            <span class="flow-info-label">创建人</span>
            <span class="flow-info-value">{{ flow.creator }}</span>
          </div>
          <div class="flow-info-item">
            <span class="flow-info-label">创建时间</span>
            <span class="flow-info-value">{{ flow.createTime }}</span>
          </div>
        </div>
      </a-card>
    </div>

    <!-- Add/Edit Flow Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingFlow ? '编辑流程' : '新建审批流程'"
      width="620px"
      @ok="saveFlow"
      @cancel="showModal = false"
    >
      <div class="form-group">
        <label class="form-label">流程名称<span style="color:#ff4d4f">*</span></label>
        <a-input v-model:value="formData.name" placeholder="如：标准预测审批流程" />
      </div>
      <div class="form-row" style="margin-top:12px;">
        <div class="form-group">
          <label class="form-label">适用范围</label>
          <a-select v-model:value="formData.scope">
            <a-select-option value="全区域">全区域</a-select-option>
            <a-select-option value="华东大区">华东大区</a-select-option>
            <a-select-option value="华南大区">华南大区</a-select-option>
            <a-select-option value="西南大区">西南大区</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">触发条件</label>
          <a-select v-model:value="formData.condition">
            <a-select-option value="手动提交">手动提交</a-select-option>
            <a-select-option value="金额≥50万">金额≥50万</a-select-option>
            <a-select-option value="金额≥100万">金额≥100万</a-select-option>
            <a-select-option value="全部自动">全部自动</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label class="form-label">流程步骤</label>
      </div>
      <div class="steps-editor">
        <div v-for="(step, idx) in formData.steps" :key="idx" class="step-row">
          <div class="step-num">{{ idx + 1 }}</div>
          <a-input v-model:value="step.name" placeholder="步骤名称" style="flex:1;" />
          <a-input v-model:value="step.approver" placeholder="审批人/角色" style="flex:1;" />
          <a-button size="small" danger @click="removeStep(idx)">🗑️</a-button>
        </div>
        <a-button size="small" @click="addStep">➕ 添加步骤</a-button>
      </div>
      <div class="form-row" style="margin-top:12px;">
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-switch v-model:checked="formData.active" checked-children="启用" un-checked-children="停用" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import request from '../api/axios'

const showModal = ref(false)
const editingFlow = ref(null)
const loading = ref(false)

const formData = reactive({
  name: '',
  scope: '全区域',
  condition: '手动提交',
  active: true,
  steps: [
    { name: '区域总监审批', approver: '张伟' },
    { name: '财务审核', approver: '李娜' }
  ]
})

const flows = ref([])
const approvers = ref([])

const fetchSteps = async () => {
  try {
    loading.value = true
    const res = await request.get('/approval-flow/steps')
    if (res.success) {
      // Steps are managed by backend, not displayed directly
    }
  } catch (e) {
    console.error('Failed to fetch steps', e)
  } finally {
    loading.value = false
  }
}

const fetchFlows = async () => {
  try {
    loading.value = true
    const res = await request.get('/approval-flow/flows')
    if (res.success) {
      flows.value = res.data || []
    }
  } catch (e) {
    console.error('Failed to fetch flows', e)
    // Use default mock data if API fails
    flows.value = [
      {
        id: 1, name: '标准预测审批流程', active: true, scope: '全区域', condition: '手动提交',
        creator: '陈明', createTime: '2026-01-15',
        steps: [
          { name: '区域总监审批', approver: '张伟' },
          { name: '财务审核', approver: '李娜' }
        ]
      },
      {
        id: 2, name: '大金额自动审批', active: true, scope: '全区域', condition: '金额≥100万',
        creator: '陈明', createTime: '2026-02-20',
        steps: [
          { name: '区域总监审批', approver: '张伟' },
          { name: '财务初审', approver: '李娜' },
          { name: '财务总监终审', approver: '王强' }
        ]
      },
      {
        id: 3, name: '华东区快速流程', active: false, scope: '华东大区', condition: '手动提交',
        creator: '张伟', createTime: '2026-03-10',
        steps: [
          { name: '华东区总监', approver: '张伟' }
        ]
      }
    ]
  } finally {
    loading.value = false
  }
}

const fetchApprovers = async () => {
  try {
    const res = await request.get('/approval-flow/approvers')
    if (res.success) {
      approvers.value = res.data || []
    }
  } catch (e) {
    console.error('Failed to fetch approvers', e)
  }
}

const addStep = () => { formData.steps.push({ name: '', approver: '' }) }
const removeStep = (idx) => { formData.steps.splice(idx, 1) }

const openAddDialog = () => {
  editingFlow.value = null
  Object.assign(formData, { name: '', scope: '全区域', condition: '手动提交', active: true, steps: [{ name: '区域总监审批', approver: '张伟' }, { name: '财务审核', approver: '李娜' }] })
  showModal.value = true
}

const editFlow = (flow) => {
  editingFlow.value = flow
  Object.assign(formData, { ...flow, steps: flow.steps.map(s => ({ ...s })) })
  showModal.value = true
}

const deleteFlow = async (flow) => {
  try {
    const res = await request.delete(`/approval-flow/flows/${flow.id}`)
    if (res.success) {
      message.success('流程已删除')
      fetchFlows()
    } else {
      message.error(res.message || '删除失败')
    }
  } catch (e) {
    message.error('删除失败')
  }
}

const handleSave = async () => {
  if (!formData.name) { message.error('请填写流程名称'); return }
  if (formData.steps.length === 0) { message.error('请至少添加一个步骤'); return }
  
  try {
    if (editingFlow.value) {
      // Update existing flow
      const res = await request.put(`/approval-flow/flows/${editingFlow.value.id}`, {
        name: formData.name,
        scope: formData.scope,
        condition: formData.condition,
        active: formData.active,
        steps: formData.steps.map((s, idx) => ({
          stepName: s.name,
          approverId: `user_${idx + 1}`,
          approverName: s.approver,
          approverEmail: `${s.approver}@sandvik.com`,
          stepOrder: idx + 1,
          isActive: true
        }))
      })
      if (res.success) {
        message.success('流程已更新')
        showModal.value = false
        fetchFlows()
      } else {
        message.error(res.message || '更新失败')
      }
    } else {
      // Create new flow
      const res = await request.post('/approval-flow/flows', {
        name: formData.name,
        scope: formData.scope,
        condition: formData.condition,
        active: formData.active,
        creator: '当前用户',
        createTime: new Date().toISOString().split('T')[0],
        steps: formData.steps.map((s, idx) => ({
          stepName: s.name,
          approverId: `user_${idx + 1}`,
          approverName: s.approver,
          approverEmail: `${s.approver}@sandvik.com`,
          stepOrder: idx + 1,
          isActive: true
        }))
      })
      if (res.success) {
        message.success('流程已创建')
        showModal.value = false
        fetchFlows()
      } else {
        message.error(res.message || '创建失败')
      }
    }
  } catch (e) {
    message.error('保存失败')
  }
}

onMounted(() => {
  fetchFlows()
  fetchApprovers()
})
</script>

<style scoped>
.approvalflow-page { }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.flow-list { display: flex; flex-direction: column; gap: 16px; }
.flow-card { border-radius: 8px; }
.flow-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.flow-title { display: flex; align-items: center; gap: 10px; }
.flow-icon { font-size: 20px; }
.flow-name { font-size: 16px; font-weight: 600; color: #1F2937; }
.flow-actions { display: flex; gap: 4px; }
.flow-steps-wrap { margin-bottom: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; }
.flow-info { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.flow-info-item { display: flex; flex-direction: column; gap: 2px; }
.flow-info-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.flow-info-value { font-size: 13px; color: #1F2937; font-weight: 500; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 12px; font-weight: 600; color: #6B7280; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.steps-editor { background: #f9fafb; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.step-row { display: flex; align-items: center; gap: 8px; }
.step-num { width: 24px; height: 24px; border-radius: 50%; background: #0D3D92; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
</style>