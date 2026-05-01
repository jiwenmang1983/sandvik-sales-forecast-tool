<template>
  <div class="orgchart-page">
    <a-card :bordered="false" class="filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input v-model:value="keyword" placeholder="搜索人员/大区/公司..." allow-clear style="width:260px" />
          <a-select v-model:value="filterRegion" style="width:140px" allow-clear placeholder="大区">
            <a-select-option value="">全部大区</a-select-option>
            <a-select-option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
        <div class="toolbar-right">
          <a-button @click="handleExport">📥 导出</a-button>
          <a-button type="primary" @click="openAddDialog">➕ 新增节点</a-button>
        </div>
      </div>
    </a-card>

    <!-- Org Tree Card -->
    <a-card :bordered="false" class="tree-card">
      <div class="tree-header">
        <div class="tree-title">
          <span class="tree-icon">🏢</span>
          <span>组织架构</span>
          <a-tag color="blue">{{ orgData.length }} 个节点</a-tag>
        </div>
        <div class="tree-actions">
          <a-button size="small" @click="expandAll">全部展开</a-button>
          <a-button size="small" @click="collapseAll">全部收起</a-button>
        </div>
      </div>

      <div class="org-tree-wrap">
        <a-tree
          v-if="treeData.length > 0"
          :tree-data="treeData"
          :expand-action="false"
          block-node
          @select="onNodeSelect"
        >
          <template #title="node">
            <div class="tree-node-content" :class="{ 'is-leaf': !node.children || node.children.length === 0 }">
              <div class="node-main">
                <div class="node-avatar" :style="{ background: avatarColor(node.title) }">
                  {{ node.title?.charAt(0) || '?' }}
                </div>
                <div class="node-info">
                  <div class="node-name">{{ node.title }}</div>
                  <div class="node-meta">
                    <a-tag v-if="node.type === 'sales'" color="green" size="small">销售</a-tag>
                    <a-tag v-if="node.type === 'manager'" color="blue" size="small">直线经理</a-tag>
                    <a-tag v-if="node.type === 'director'" color="orange" size="small">区域总监</a-tag>
                    <a-tag v-if="node.type === 'regionOwner'" color="purple" size="small">大区负责人</a-tag>
                    <a-tag v-if="node.type === 'finalApprover'" color="red" size="small">最终审批人</a-tag>
                    <span class="node-email">{{ node.email }}</span>
                  </div>
                </div>
              </div>
              <div class="node-actions">
                <a-button type="text" size="small" @click.stop="editNode(node)">✏️</a-button>
                <a-button type="text" size="small" danger @click.stop="deleteNode(node)">🗑️</a-button>
              </div>
            </div>
          </template>
        </a-tree>
        <div v-else class="empty-tree">
          <p>暂无组织架构数据</p>
          <a-button type="primary" @click="openAddDialog">新增第一个节点</a-button>
        </div>
      </div>
    </a-card>

    <!-- Approval Chain Panel (Right) -->
    <a-card :bordered="false" class="chain-card">
      <div class="chain-header">
        <span class="chain-icon">📋</span>
        <span>审批矩阵配置</span>
      </div>

      <div class="chain-list">
        <div v-for="item in chainConfig" :key="item.id" class="chain-item">
          <div class="chain-item-header">
            <div class="chain-level">
              <span class="level-badge">{{ item.level }}</span>
              <span class="level-name">{{ item.statusName }}</span>
            </div>
            <div class="chain-item-actions">
              <a-button type="text" size="small" @click="editChainItem(item)">✏️</a-button>
              <a-button type="text" size="small" danger @click="removeChainItem(item)">🗑️</a-button>
            </div>
          </div>
          <div class="chain-item-info">
            <div class="chain-info-row">
              <span class="chain-label">审批角色：</span>
              <span class="chain-value">{{ item.roleName }}</span>
            </div>
            <div class="chain-info-row">
              <span class="chain-label">审批人邮箱：</span>
              <span class="chain-value">{{ item.approverEmail || '未配置' }}</span>
            </div>
            <div class="chain-info-row">
              <span class="chain-label">允许跳过：</span>
              <a-switch v-model:checked="item.skippable" size="small" disabled />
            </div>
          </div>
        </div>
      </div>

      <a-button type="dashed" block @click="addChainItem" style="margin-top:12px">
        ➕ 添加审批节点
      </a-button>
    </a-card>

    <!-- Add/Edit Node Modal -->
    <a-modal
      v-model:open="showNodeModal"
      :title="editingNode ? '编辑节点' : '新增节点'"
      width="560px"
      @ok="saveNode"
      @cancel="showNodeModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">节点类型<span style="color:#ff4d4f">*</span></label>
          <a-select v-model:value="nodeForm.type" placeholder="选择类型">
            <a-select-option value="sales">销售</a-select-option>
            <a-select-option value="manager">直线经理</a-select-option>
            <a-select-option value="director">区域总监</a-select-option>
            <a-select-option value="regionOwner">大区负责人</a-select-option>
            <a-select-option value="finalApprover">最终审批人</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">姓名<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="nodeForm.name" placeholder="姓名" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">邮箱（用户账号）<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="nodeForm.email" placeholder="xxx@sandvik.com" />
        </div>
        <div class="form-group">
          <label class="form-label">所属大区</label>
          <a-select v-model:value="nodeForm.region" placeholder="选择大区" allow-clear>
            <a-select-option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">所属公司</label>
          <a-input v-model:value="nodeForm.company" placeholder="所属公司" />
        </div>
        <div class="form-group">
          <label class="form-label">上级节点</label>
          <a-select v-model:value="nodeForm.parentId" placeholder="选择上级（可不选）" allow-clear>
            <a-select-option v-for="n in flatOrgData" :key="n.id" :value="n.id">
              {{ n.name }} ({{ n.email }})
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row-full">
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-select v-model:value="nodeForm.status">
            <a-select-option value="active">激活</a-select-option>
            <a-select-option value="inactive">停用</a-select-option>
          </a-select>
        </div>
      </div>
    </a-modal>

    <!-- Add/Edit Chain Item Modal -->
    <a-modal
      v-model:open="showChainModal"
      :title="editingChainItem ? '编辑审批节点' : '新增审批节点'"
      width="480px"
      @ok="saveChainItem"
      @cancel="showChainModal = false"
    >
      <div class="form-group">
        <label class="form-label">节点名称（状态）<span style="color:#ff4d4f">*</span></label>
        <a-input v-model:value="chainForm.statusName" placeholder="如：区域总监审批" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">审批角色<span style="color:#ff4d4f">*</span></label>
          <a-select v-model:value="chainForm.roleName" placeholder="选择角色">
            <a-select-option value="直线经理">直线经理</a-select-option>
            <a-select-option value="区域总监">区域总监</a-select-option>
            <a-select-option value="大区负责人">大区负责人</a-select-option>
            <a-select-option value="最终审批人">最终审批人</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">审批人邮箱</label>
          <a-input v-model:value="chainForm.approverEmail" placeholder="可选，不填则自动匹配" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">允许跳过</label>
        <a-switch v-model:checked="chainForm.skippable" />
      </div>
      <div class="form-group" style="margin-top:12px">
        <label class="form-label">邮件通知模板</label>
        <a-textarea v-model:value="chainForm.emailTemplate" :rows="4" placeholder="可选：自定义邮件通知内容" />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const keyword = ref('')
const filterRegion = ref('')
const showNodeModal = ref(false)
const showChainModal = ref(false)
const editingNode = ref(null)
const editingChainItem = ref(null)

const regionOptions = ['华东大区', '华南大区', '华北东北大区', '西南大区', '北部销售大区']

// ==================== Org Data ====================
const orgData = ref([
  {
    id: 'o1',
    type: 'director',
    name: '李华东',
    email: 'huadong.li@sandvik.com',
    region: '华东大区',
    company: '山特维克商贸(上海)',
    status: 'active',
    parentId: null,
    children: [
      {
        id: 'o2',
        type: 'manager',
        name: '张伟',
        email: 'wei.zhang@sandvik.com',
        region: '华东大区',
        company: '山特维克商贸(上海)',
        status: 'active',
        parentId: 'o1',
        children: []
      },
      {
        id: 'o3',
        type: 'manager',
        name: '李娜',
        email: 'na.li@sandvik.com',
        region: '华东大区',
        company: '山特维克商贸(上海)',
        status: 'active',
        parentId: 'o1',
        children: []
      }
    ]
  },
  {
    id: 'o4',
    type: 'director',
    name: '陈志远',
    email: 'zhiyuan.chen@sandvik.com',
    region: '华南大区',
    company: '山特维克商贸(上海)',
    status: 'active',
    parentId: null,
    children: [
      {
        id: 'o5',
        type: 'sales',
        name: '周婷',
        email: 'ting.zhou@sandvik.com',
        region: '华南大区',
        company: '山特维克商贸(上海)',
        status: 'active',
        parentId: 'o4',
        children: []
      }
    ]
  },
  {
    id: 'o6',
    type: 'regionOwner',
    name: '杨依柱',
    email: 'yizhu.yang@sandvik.com',
    region: '北部销售大区',
    company: '阿诺（北京）精密工具有限公司',
    status: 'active',
    parentId: null,
    children: [
      {
        id: 'o7',
        type: 'manager',
        name: '李长春',
        email: 'changchun.li@ahno-tool.com',
        region: '北部销售大区',
        company: '阿诺（北京）精密工具有限公司',
        status: 'active',
        parentId: 'o6',
        children: [
          {
            id: 'o8',
            type: 'sales',
            name: '韩学健',
            email: 'xuejian.han@ahno-tool.com',
            region: '北部销售大区',
            company: '阿诺（北京）精密工具有限公司',
            status: 'active',
            parentId: 'o7',
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'o9',
    type: 'finalApprover',
    name: 'Frank Tao',
    email: 'frank.tao@sandvik.com',
    region: '',
    company: '山特维克集团',
    status: 'active',
    parentId: null,
    children: []
  }
])

const flatOrgData = computed(() => {
  const result = []
  const flatten = (nodes) => {
    nodes.forEach(n => {
      result.push({ id: n.id, name: n.name, email: n.email, type: n.type })
      if (n.children) flatten(n.children)
    })
  }
  flatten(orgData.value)
  return result
})

// Convert orgData to tree structure for Ant Tree component
const treeData = computed(() => {
  const filter = (nodes) => {
    return nodes
      .filter(n => {
        if (keyword.value) {
          const k = keyword.value.toLowerCase()
          if (!n.name.toLowerCase().includes(k) && !n.email.toLowerCase().includes(k) && !n.region?.toLowerCase().includes(k)) {
            return false
          }
        }
        if (filterRegion.value && n.region !== filterRegion.value) {
          return false
        }
        return true
      })
      .map(n => ({
        key: n.id,
        title: n.name,
        email: n.email,
        type: n.type,
        region: n.region,
        children: n.children ? filter(n.children) : undefined
      }))
  }
  return filter(orgData.value)
})

// ==================== Approval Chain Config ====================
const chainConfig = ref([
  {
    id: 'c1',
    level: 1,
    statusName: '直线经理审批',
    roleName: '直线经理',
    approverEmail: '',
    skippable: true,
    emailTemplate: '您有一笔销售预测待审批，请及时处理。\n提交人：{submitter}\n预测周期：{period}\n金额：{amount}'
  },
  {
    id: 'c2',
    level: 2,
    statusName: '区域总监审批',
    roleName: '区域总监',
    approverEmail: '',
    skippable: false,
    emailTemplate: '您有一笔销售预测待最终审批，请及时处理。\n提交人：{submitter}\n预测周期：{period}\n金额：{amount}'
  },
  {
    id: 'c3',
    level: 3,
    statusName: '大区负责人审批',
    roleName: '大区负责人',
    approverEmail: '',
    skippable: true,
    emailTemplate: '您有一笔销售预测待最终审批，请及时处理。\n提交人：{submitter}\n预测周期：{period}\n金额：{amount}'
  },
  {
    id: 'c4',
    level: 4,
    statusName: '最终审批',
    roleName: '最终审批人',
    approverEmail: 'frank.tao@sandvik.com',
    skippable: false,
    emailTemplate: '销售预测已完成全部审批流程。\n提交人：{submitter}\n预测周期：{period}\n金额：{amount}\n状态：已通过'
  }
])

// ==================== Node Form ====================
const nodeForm = reactive({
  type: 'sales',
  name: '',
  email: '',
  region: '',
  company: '',
  parentId: null,
  status: 'active'
})

// ==================== Chain Form ====================
const chainForm = reactive({
  statusName: '',
  roleName: '',
  approverEmail: '',
  skippable: false,
  emailTemplate: ''
})

// ==================== Methods ====================
const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A', '#722ED1']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

const expandAll = () => {
  // Tree expand handled by :default-expand-all on a-tree
  message.info('已展开全部节点')
}

const collapseAll = () => {
  message.info('已收起全部节点')
}

const onNodeSelect = (selectedKeys) => {
  if (selectedKeys.length > 0) {
    const node = findNode(selectedKeys[0], orgData.value)
    if (node) {
      // Show node details or do something
    }
  }
}

const findNode = (id, nodes) => {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNode(id, n.children)
      if (found) return found
    }
  }
  return null
}

const openAddDialog = () => {
  editingNode.value = null
  Object.assign(nodeForm, { type: 'sales', name: '', email: '', region: '', company: '', parentId: null, status: 'active' })
  showNodeModal.value = true
}

const editNode = (node) => {
  const orig = findNode(node.key, orgData.value)
  if (!orig) return
  editingNode.value = orig
  Object.assign(nodeForm, { type: orig.type, name: orig.name, email: orig.email, region: orig.region || '', company: orig.company || '', parentId: orig.parentId, status: orig.status })
  showNodeModal.value = true
}

const deleteNode = (node) => {
  const remove = (nodes, id) => {
    const idx = nodes.findIndex(n => n.id === id)
    if (idx >= 0) {
      nodes.splice(idx, 1)
      return true
    }
    for (const n of nodes) {
      if (n.children && remove(n.children, id)) return true
    }
    return false
  }
  remove(orgData.value, node.key)
  message.success('节点已删除')
}

const saveNode = () => {
  if (!nodeForm.name || !nodeForm.email) {
    message.error('请填写必填项')
    return
  }
  if (editingNode.value) {
    Object.assign(editingNode.value, { ...nodeForm })
    message.success('节点已更新')
  } else {
    const newNode = { id: 'o_' + Date.now(), ...nodeForm, children: [] }
    if (nodeForm.parentId) {
      const parent = findNode(nodeForm.parentId, orgData.value)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(newNode)
      }
    } else {
      orgData.value.push(newNode)
    }
    message.success('节点已添加')
  }
  showNodeModal.value = false
}

const handleExport = () => {
  message.info('导出组织架构（演示）')
}

const addChainItem = () => {
  editingChainItem.value = null
  Object.assign(chainForm, { statusName: '', roleName: '', approverEmail: '', skippable: false, emailTemplate: '' })
  showChainModal.value = true
}

const editChainItem = (item) => {
  editingChainItem.value = item
  Object.assign(chainForm, { ...item })
  showChainModal.value = true
}

const removeChainItem = (item) => {
  const idx = chainConfig.value.findIndex(c => c.id === item.id)
  if (idx >= 0) chainConfig.value.splice(idx, 1)
  message.success('审批节点已删除')
}

const saveChainItem = () => {
  if (!chainForm.statusName || !chainForm.roleName) {
    message.error('请填写必填项')
    return
  }
  if (editingChainItem.value) {
    Object.assign(editingChainItem.value, { ...chainForm })
    message.success('审批节点已更新')
  } else {
    chainConfig.value.push({
      id: 'c_' + Date.now(),
      level: chainConfig.value.length + 1,
      ...chainForm
    })
    message.success('审批节点已添加')
  }
  showChainModal.value = false
}
</script>

<style scoped>
.orgchart-page {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  padding: 0;
}

.filter-card {
  grid-column: 1 / -1;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.tree-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E8F0;
}

.tree-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.tree-icon {
  font-size: 20px;
}

.tree-actions {
  display: flex;
  gap: 8px;
}

.org-tree-wrap {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.15s;
  width: 100%;
}

.tree-node-content:hover {
  background: #F1F5F9;
}

.node-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-name {
  font-weight: 600;
  font-size: 14px;
  color: #1F2937;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-email {
  font-size: 12px;
  color: #6B7280;
}

.node-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.tree-node-content:hover .node-actions {
  opacity: 1;
}

.empty-tree {
  text-align: center;
  padding: 48px;
  color: #94A3B8;
}

.empty-tree p {
  margin-bottom: 16px;
}

/* Chain Card */
.chain-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.chain-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E8F0;
}

.chain-icon {
  font-size: 20px;
}

.chain-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 480px;
  overflow-y: auto;
}

.chain-item {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #E2E8F0;
}

.chain-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chain-level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #0D3D92;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.level-name {
  font-weight: 600;
  font-size: 14px;
  color: #1F2937;
}

.chain-item-actions {
  display: flex;
  gap: 2px;
}

.chain-item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 32px;
}

.chain-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.chain-label {
  color: #6B7280;
  font-weight: 500;
}

.chain-value {
  color: #1F2937;
  font-weight: 500;
}

/* Form */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.form-row-full {
  margin-top: 12px;
}

.form-row-full .form-group {
  width: 100%;
}
</style>
