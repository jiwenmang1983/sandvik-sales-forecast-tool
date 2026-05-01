<template>
  <div class="permissions-page">
    <a-row :gutter="24">
      <!-- Left: Role List -->
      <a-col :span="8">
        <a-card :bordered="false" title="角色列表">
          <template #extra>
            <a-button type="primary" size="small" @click="openAddRoleDialog">➕ 添加角色</a-button>
          </template>
          <div class="role-list">
            <div
              v-for="role in roles"
              :key="role.id"
              class="role-item"
              :class="{ active: selectedRole?.id === role.id }"
              @click="selectRole(role)"
            >
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-desc">{{ role.desc }}</div>
                <div class="role-count">{{ role.userCount }} 人</div>
              </div>
              <div class="role-actions">
                <a-button size="small" @click.stop="editRole(role)">✏️</a-button>
                <a-button size="small" danger @click.stop="deleteRole(role)">🗑️</a-button>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Right: Permission Tree -->
      <a-col :span="16">
        <a-card :bordered="false" :title="selectedRole ? '权限配置 - ' + selectedRole.name : '请选择角色'">
          <template #extra>
            <a-button v-if="selectedRole" type="primary" @click="savePermissions">💾 保存配置</a-button>
          </template>
          <div v-if="selectedRole" class="permission-tree-wrap">
            <a-tree
              v-model:checkedKeys="checkedPermissions"
              :tree-data="permissionTree"
              checkable
              :expand-all="true"
              @check="onPermissionChange"
            >
              <template #title="{ title, key }">
                <span>
                  <span v-if="permissionIcons[key]" style="margin-right:6px;">{{ permissionIcons[key] }}</span>
                  {{ title }}
                </span>
              </template>
            </a-tree>
          </div>
          <a-empty v-else description="请从左侧选择一个角色" />
        </a-card>
      </a-col>
    </a-row>

    <!-- Add/Edit Role Modal -->
    <a-modal
      v-model:open="showRoleModal"
      :title="editingRole ? '编辑角色' : '新增角色'"
      @ok="saveRole"
      @cancel="showRoleModal = false"
    >
      <div class="form-group">
        <label class="form-label">角色名称<span style="color:#ff4d4f">*</span></label>
        <a-input v-model:value="roleForm.name" placeholder="如：区域总监" />
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label class="form-label">角色描述</label>
        <a-input v-model:value="roleForm.desc" placeholder="描述角色职责" />
      </div>
      <div class="form-group" style="margin-top:12px;">
        <label class="form-label">关联用户数</label>
        <a-input-number v-model:value="roleForm.userCount" :min="0" style="width:100%" />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const selectedRole = ref(null)
const showRoleModal = ref(false)
const editingRole = ref(null)
const checkedPermissions = ref([])

const roleForm = reactive({ name: '', desc: '', userCount: 0 })

const roles = ref([
  { id: 1, name: '管理员', desc: '系统全部权限', userCount: 2 },
  { id: 2, name: '区域总监', desc: '区域内预测管理审批', userCount: 4 },
  { id: 3, name: '财务', desc: '财务审核权限', userCount: 2 },
  { id: 4, name: '销售', desc: '填报和查看本人数据', userCount: 12 }
])

const permissionCategories = [
  {
    title: '📊 销售预测',
    key: 'forecast',
    children: [
      { title: '查看预测', key: 'forecast:view', icon: '👁' },
      { title: '填报预测', key: 'forecast:edit', icon: '✏️' },
      { title: '提交审批', key: 'forecast:submit', icon: '🚀' },
      { title: '删除预测', key: 'forecast:delete', icon: '🗑️' },
      { title: '导出数据', key: 'forecast:export', icon: '📥' }
    ]
  },
  {
    title: '✅ 审批管理',
    key: 'approval',
    children: [
      { title: '查看审批', key: 'approval:view', icon: '👁' },
      { title: '通过审批', key: 'approval:approve', icon: '✅' },
      { title: '驳回审批', key: 'approval:reject', icon: '❌' },
      { title: '批量审批', key: 'approval:batch', icon: '📋' }
    ]
  },
  {
    title: '🗂 基础数据',
    key: 'basedata',
    children: [
      { title: '查看基础数据', key: 'basedata:view', icon: '👁' },
      { title: '管理产品', key: 'basedata:product', icon: '📦' },
      { title: '管理客户', key: 'basedata:customer', icon: '🏢' },
      { title: '管理区域', key: 'basedata:region', icon: '🗺️' },
      { title: '管理价格', key: 'basedata:price', icon: '💰' }
    ]
  },
  {
    title: '👤 用户权限',
    key: 'users',
    children: [
      { title: '查看用户', key: 'users:view', icon: '👁' },
      { title: '添加用户', key: 'users:add', icon: '➕' },
      { title: '编辑用户', key: 'users:edit', icon: '✏️' },
      { title: '删除用户', key: 'users:delete', icon: '🗑️' },
      { title: '管理角色', key: 'users:role', icon: '🎭' }
    ]
  },
  {
    title: '⚙️ 系统配置',
    key: 'system',
    children: [
      { title: '预测周期管理', key: 'system:period', icon: '📅' },
      { title: '审批流程配置', key: 'system:flow', icon: '🔄' },
      { title: '查看日志', key: 'system:log', icon: '📋' },
      { title: '系统设置', key: 'system:setting', icon: '⚙️' }
    ]
  }
]

const permissionIcons = {
  'forecast:view': '👁', 'forecast:edit': '✏️', 'forecast:submit': '🚀', 'forecast:delete': '🗑️', 'forecast:export': '📥',
  'approval:view': '👁', 'approval:approve': '✅', 'approval:reject': '❌', 'approval:batch': '📋',
  'basedata:view': '👁', 'basedata:product': '📦', 'basedata:customer': '🏢', 'basedata:region': '🗺️', 'basedata:price': '💰',
  'users:view': '👁', 'users:add': '➕', 'users:edit': '✏️', 'users:delete': '🗑️', 'users:role': '🎭',
  'system:period': '📅', 'system:flow': '🔄', 'system:log': '📋', 'system:setting': '⚙️'
}

// Convert to tree nodes
const permissionTree = permissionCategories.map(cat => ({
  title: cat.title,
  key: cat.key,
  children: cat.children.map(ch => ({ title: ch.title, key: ch.key }))
}))

// Role -> permissions mapping
const rolePermissions = {
  1: ['forecast:view','forecast:edit','forecast:submit','forecast:delete','forecast:export','approval:view','approval:approve','approval:reject','approval:batch','basedata:view','basedata:product','basedata:customer','basedata:region','basedata:price','users:view','users:add','users:edit','users:delete','users:role','system:period','system:flow','system:log','system:setting'],
  2: ['forecast:view','forecast:edit','forecast:submit','basedata:view','approval:view','approval:approve','approval:reject'],
  3: ['forecast:view','basedata:view','approval:view','approval:approve'],
  4: ['forecast:view','forecast:edit','forecast:submit']
}

const selectRole = (role) => {
  selectedRole.value = role
  checkedPermissions.value = rolePermissions[role.id] || []
}

const onPermissionChange = (checked) => {
  // Handle permission change
}

const openAddRoleDialog = () => {
  editingRole.value = null
  roleForm.name = ''
  roleForm.desc = ''
  roleForm.userCount = 0
  showRoleModal.value = true
}

const editRole = (role) => {
  editingRole.value = role
  Object.assign(roleForm, role)
  showRoleModal.value = true
}

const deleteRole = (role) => {
  const idx = roles.value.findIndex(r => r.id === role.id)
  if (idx >= 0) roles.value.splice(idx, 1)
  if (selectedRole.value?.id === role.id) selectedRole.value = null
  message.success('角色已删除')
}

const saveRole = () => {
  if (!roleForm.name) { message.error('请填写角色名称'); return }
  if (editingRole.value) {
    const idx = roles.value.findIndex(r => r.id === editingRole.value.id)
    if (idx >= 0) Object.assign(roles.value[idx], { ...roleForm })
    message.success('角色已更新')
  } else {
    roles.value.push({ id: Date.now(), ...roleForm })
    message.success('角色已添加')
  }
  showRoleModal.value = false
}

const savePermissions = () => {
  if (!selectedRole.value) return
  rolePermissions[selectedRole.value.id] = [...checkedPermissions.value]
  message.success('权限配置已保存')
}
</script>

<style scoped>
.permissions-page { }
.role-list { display: flex; flex-direction: column; gap: 8px; }
.role-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.15s; background: #fff; }
.role-item:hover { border-color: #0D3D92; background: #f8faff; }
.role-item.active { border-color: #0D3D92; background: #e8f0fe; }
.role-info { flex: 1; }
.role-name { font-weight: 600; font-size: 14px; color: #1F2937; }
.role-desc { font-size: 12px; color: #6B7280; margin-top: 2px; }
.role-count { font-size: 11px; color: #0D3D92; margin-top: 4px; }
.role-actions { display: flex; gap: 4px; }
.permission-tree-wrap { padding: 8px 0; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 12px; font-weight: 600; color: #6B7280; }
</style>