<template>
  <div class="users-page">
    <!-- Filter Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">关键词</span>
          <a-input v-model:value="keyword" placeholder="姓名/账号/域" allow-clear style="width:200px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">角色</span>
          <a-select v-model:value="roleFilter" style="width:140px" allow-clear placeholder="选择角色">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="r in roleList" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <a-select v-model:value="statusFilter" style="width:120px" allow-clear placeholder="选择状态">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="enabled">启用</a-select-option>
            <a-select-option value="disabled">停用</a-select-option>
          </a-select>
        </div>
        <div class="filter-actions">
          <a-button @click="handleRefresh">刷新</a-button>
          <a-button type="primary" @click="openAddDialog">新增用户</a-button>
        </div>
      </div>
    </a-card>

    <!-- User Table -->
    <a-card :bordered="false" class="table-card">
      <div class="table-wrap">
        <a-table :columns="columns" :data-source="filteredUsers" :loading="loading" row-key="id" :pagination="{pageSize: 20}">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'account'">
              <span class="user-account">{{ record.account }}</span>
            </template>
            <template v-if="column.key === 'name'">
              <div class="user-cell">
                <a-avatar :size="32" :style="{ background: avatarColor(record.name) }">
                  {{ record.name?.charAt(0) || 'U' }}
                </a-avatar>
                <span class="user-name">{{ record.name }}</span>
              </div>
            </template>
            <template v-if="column.key === 'role'">
              <span class="role-badge" :class="'role-' + record.role">{{ record.role }}</span>
            </template>
            <template v-if="column.key === 'status'">
              <span class="status-badge" :class="record.status === 'enabled' ? 'status-enabled' : 'status-disabled'">{{ record.status === 'enabled' ? '启用' : '停用' }}</span>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button size="small" @click="editUser(record)">编辑</a-button>
                <a-button size="small" @click="toggleStatus(record)">{{ record.status === 'enabled' ? '停用' : '启用' }}</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingUser ? '编辑用户' : '新增用户'"
      width="520px"
      @ok="saveUser"
      @cancel="showModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">姓名<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.name" placeholder="请输入姓名" />
        </div>
        <div class="form-group">
          <label class="form-label">用户账号<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.account" placeholder="请输入账号" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">邮箱<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.email" placeholder="请输入邮箱" />
        </div>
        <div class="form-group">
          <label class="form-label">角色<span style="color:#ff4d4f">*</span></label>
          <a-select v-model:value="formData.role" placeholder="选择角色">
            <a-select-option v-for="r in roleList" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">所属大区</label>
          <a-select v-model:value="formData.region" placeholder="选择大区" allow-clear>
            <a-select-option v-for="r in regionList" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-select v-model:value="formData.status">
            <a-select-option value="enabled">启用</a-select-option>
            <a-select-option value="disabled">停用</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row" v-if="!editingUser">
        <div class="form-group">
          <label class="form-label">初始密码</label>
          <a-input-password v-model:value="formData.password" placeholder="默认密码123456" />
        </div>
        <div class="form-group"></div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const keyword = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editingUser = ref(null)
const loading = ref(false)

const formData = reactive({
  name: '',
  account: '',
  email: '',
  role: '',
  region: '',
  status: 'enabled',
  password: ''
})

const roleList = ['管理员', '区域总监', '财务', '销售']
const regionList = ['华东大区', '华南大区', '华北东北大区', '西南大区']

const columns = [
  { title: '用户账号', key: 'account', dataIndex: 'account' },
  { title: '姓名', key: 'name' },
  { title: '角色', key: 'role', dataIndex: 'role' },
  { title: '邮箱', key: 'email', dataIndex: 'email' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

const users = ref([])

const filteredUsers = computed(() => {
  let list = users.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(x => x.name.toLowerCase().includes(kw) || x.account.toLowerCase().includes(kw) || x.email.toLowerCase().includes(kw))
  }
  if (roleFilter.value) list = list.filter(x => x.role === roleFilter.value)
  if (statusFilter.value) list = list.filter(x => x.status === statusFilter.value)
  return list
})

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

// Auth header helper
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const fetchUsers = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams()
    if (roleFilter.value) params.append('role', roleFilter.value)
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (keyword.value) params.append('keyword', keyword.value)
    
    const res = await fetch(`/api/users?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    })
    const data = await res.json()
    if (data.success) users.value = data.data || []
  } catch (e) {
    message.error('获取用户数据失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  fetchUsers()
  message.success('已刷新')
}

const openAddDialog = () => {
  editingUser.value = null
  Object.assign(formData, { name: '', account: '', email: '', role: '', region: '', status: 'enabled', password: '' })
  showModal.value = true
}

const editUser = (user) => {
  editingUser.value = user
  Object.assign(formData, { ...user, password: '' })
  showModal.value = true
}

const toggleStatus = async (user) => {
  try {
    const res = await fetch(`/api/users/${user.id}/toggle-status`, { 
      method: 'POST',
      headers: { ...getAuthHeader() }
    })
    const data = await res.json()
    if (data.success) {
      message.success('状态已更新')
      fetchUsers()
    } else {
      message.error(data.message || '更新失败')
    }
  } catch (e) {
    message.error('更新失败')
  }
}

const saveUser = async () => {
  if (!formData.name || !formData.account || !formData.email || !formData.role) {
    message.error('请填写必填项')
    return
  }
  try {
    const body = {
      account: formData.account,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      region: formData.region,
      status: formData.status,
      password: formData.password || undefined
    }
    
    let res, data
    if (editingUser.value) {
      res = await fetch(`/api/users/${editingUser.value.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(body)
      })
    } else {
      res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(body)
      })
    }
    data = await res.json()
    
    if (data.success) {
      message.success(editingUser.value ? '用户已更新' : '用户已添加')
      showModal.value = false
      fetchUsers()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (e) {
    message.error('操作失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
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

.user-account {
  font-family: 'Roboto Mono', monospace;
  color: #64748B;
  font-size: 12px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-管理员 { background: #FEE2E2; color: #DC2626; }
.role-区域总监 { background: #DBEAFE; color: #2563EB; }
.role-财务 { background: #D1FAE5; color: #059669; }
.role-销售 { background: #FEF3C7; color: #D97706; }

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-enabled { background: #D1FAE5; color: #059669; }
.status-disabled { background: #F1F5F9; color: #64748B; }

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

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}
</style>
