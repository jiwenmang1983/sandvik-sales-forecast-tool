<template>
  <div class="permissions-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">角色</span>
          <a-select v-model:value="selectedRoleId" style="width:180px" placeholder="选择角色" @change="onRoleChange">
            <a-select-option value="">选择角色</a-select-option>
            <a-select-option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-actions">
          <a-button type="primary" @click="savePermissions" :disabled="!selectedRoleId || saving">保存权限</a-button>
          <a-button @click="resetPermissions" :disabled="!selectedRoleId">恢复默认</a-button>
        </div>
      </div>
    </a-card>

    <!-- Permissions Table -->
    <a-card :bordered="false" class="table-card">
      <div class="table-wrap">
        <table class="forecast-table permission-table" v-if="selectedRoleId">
          <thead>
            <tr>
              <th>模块</th>
              <th>权限项</th>
              <th>查看</th>
              <th>新增</th>
              <th>编辑</th>
              <th>删除</th>
              <th>导出</th>
              <th>审批</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="module in permissionModules" :key="module.key">
              <tr class="module-row">
                <td :rowspan="module.permissions.length + 1" class="module-cell">
                  <span class="module-icon">{{ module.icon }}</span>
                  <span class="module-name">{{ module.name }}</span>
                </td>
              </tr>
              <tr v-for="perm in module.permissions" :key="perm.key" class="permission-row">
                <td class="perm-name">{{ perm.name }}</td>
                <td class="perm-check">
                  <a-checkbox v-model="perm.view" @change="updatePermission(module.key, perm.key, 'view', perm.view)" />
                </td>
                <td class="perm-check">
                  <a-checkbox v-model="perm.add" @change="updatePermission(module.key, perm.key, 'add', perm.add)" />
                </td>
                <td class="perm-check">
                  <a-checkbox v-model="perm.edit" @change="updatePermission(module.key, perm.key, 'edit', perm.edit)" />
                </td>
                <td class="perm-check">
                  <a-checkbox v-model="perm.delete" @change="updatePermission(module.key, perm.key, 'delete', perm.delete)" />
                </td>
                <td class="perm-check">
                  <a-checkbox v-model="perm.export" @change="updatePermission(module.key, perm.key, 'export', perm.export)" />
                </td>
                <td class="perm-check">
                  <a-checkbox v-model="perm.approve" @change="updatePermission(module.key, perm.key, 'approve', perm.approve)" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <span>请从上方选择一个角色</span>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const selectedRoleId = ref('')
const saving = ref(false)
const loading = ref(false)

const roles = ref([
  { id: '1', name: '管理员', desc: '系统全部权限' },
  { id: '2', name: '区域总监', desc: '区域内预测管理审批' },
  { id: '3', name: '财务', desc: '财务审核权限' },
  { id: '4', name: '销售', desc: '填报和查看本人数据' }
])

const permissionModules = reactive([
  {
    key: 'forecast',
    icon: '📊',
    name: '销售预测',
    permissions: [
      { key: 'forecast_view', name: '查看预测', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'forecast_edit', name: '填报预测', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'forecast_submit', name: '提交审批', view: false, add: false, edit: false, delete: false, export: false, approve: false }
    ]
  },
  {
    key: 'approval',
    icon: '✅',
    name: '审批管理',
    permissions: [
      { key: 'approval_view', name: '查看审批', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'approval_approve', name: '通过审批', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'approval_reject', name: '驳回审批', view: false, add: false, edit: false, delete: false, export: false, approve: false }
    ]
  },
  {
    key: 'basedata',
    icon: '🗂',
    name: '基础数据',
    permissions: [
      { key: 'basedata_view', name: '查看数据', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'basedata_product', name: '管理产品', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'basedata_customer', name: '管理客户', view: false, add: false, edit: false, delete: false, export: false, approve: false }
    ]
  },
  {
    key: 'users',
    icon: '👤',
    name: '用户权限',
    permissions: [
      { key: 'users_view', name: '查看用户', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'users_add', name: '添加用户', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'users_edit', name: '编辑用户', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'users_delete', name: '删除用户', view: false, add: false, edit: false, delete: false, export: false, approve: false }
    ]
  },
  {
    key: 'system',
    icon: '⚙️',
    name: '系统配置',
    permissions: [
      { key: 'system_period', name: '预测周期管理', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'system_flow', name: '审批流程配置', view: false, add: false, edit: false, delete: false, export: false, approve: false },
      { key: 'system_log', name: '查看日志', view: false, add: false, edit: false, delete: false, export: false, approve: false }
    ]
  }
])

const onRoleChange = async (roleId) => {
  if (!roleId) return
  await fetchRolePermissions(roleId)
}

const fetchRolePermissions = async (roleId) => {
  try {
    loading.value = true
    const res = await fetch(`/api/permissions/${roleId}`)
    const data = await res.json()
    
    if (data.success) {
      const perms = data.data || []
      permissionModules.forEach(mod => {
        mod.permissions.forEach(perm => {
          perm.view = perms.includes(perm.key)
          perm.add = perms.includes(perm.key + '_add')
          perm.edit = perms.includes(perm.key + '_edit')
          perm.delete = perms.includes(perm.key + '_delete')
          perm.export = perms.includes(perm.key + '_export')
          perm.approve = perms.includes(perm.key + '_approve')
        })
      })
    }
  } catch (e) {
    message.error('获取权限数据失败')
  } finally {
    loading.value = false
  }
}

const updatePermission = (moduleKey, permKey, action, value) => {
  // Update logic handled by v-model
}

const savePermissions = async () => {
  if (!selectedRoleId.value) return
  
  try {
    saving.value = true
    const enabledPerms = []
    permissionModules.forEach(mod => {
      mod.permissions.forEach(perm => {
        if (perm.view) enabledPerms.push(perm.key)
        if (perm.add) enabledPerms.push(perm.key + '_add')
        if (perm.edit) enabledPerms.push(perm.key + '_edit')
        if (perm.delete) enabledPerms.push(perm.key + '_delete')
        if (perm.export) enabledPerms.push(perm.key + '_export')
        if (perm.approve) enabledPerms.push(perm.key + '_approve')
      })
    })
    
    const res = await fetch(`/api/permissions/${selectedRoleId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: enabledPerms })
    })
    const data = await res.json()
    
    if (data.success) {
      message.success('权限配置已保存')
    } else {
      message.error(data.message || '保存失败')
    }
  } catch (e) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetPermissions = async () => {
  if (!selectedRoleId.value) return
  
  try {
    const res = await fetch(`/api/permissions/${selectedRoleId.value}/reset`, { method: 'POST' })
    const data = await res.json()
    
    if (data.success) {
      message.success('已恢复默认权限')
      await fetchRolePermissions(selectedRoleId.value)
    } else {
      message.error(data.message || '重置失败')
    }
  } catch (e) {
    message.error('重置失败')
  }
}

onMounted(async () => {
  // Fetch roles from API
  try {
    const res = await fetch('/api/permissions/roles')
    const data = await res.json()
    if (data.success) {
      roles.value = data.data || roles.value
    }
  } catch (e) {
    console.error('Failed to fetch roles:', e)
  }
})
</script>

<style scoped>
.permissions-page {
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

.permission-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.permission-table th {
  background: #F8FAFC;
  color: #475569;
  font-weight: 600;
  text-align: center;
  padding: 12px 16px;
  border-bottom: 2px solid #E2E8F0;
}

.permission-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #F1F5F9;
  color: #1E293B;
}

.module-cell {
  background: #F8FAFC;
  vertical-align: middle;
}

.module-icon {
  font-size: 16px;
  margin-right: 8px;
}

.module-name {
  font-weight: 600;
  color: #0D3D92;
}

.perm-name {
  text-align: left;
  padding-left: 24px;
}

.perm-check {
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 64px 32px;
  color: #94A3B8;
  font-size: 14px;
}
</style>
