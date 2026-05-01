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
        <table class="forecast-table">
          <thead>
            <tr>
              <th>用户账号</th>
              <th>姓名</th>
              <th>角色</th>
              <th>邮箱</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td><span class="user-account">{{ user.account }}</span></td>
              <td>
                <div class="user-cell">
                  <a-avatar :size="32" :style="{ background: avatarColor(user.name) }">
                    {{ user.name?.charAt(0) || 'U' }}
                  </a-avatar>
                  <span class="user-name">{{ user.name }}</span>
                </div>
              </td>
              <td><span class="role-badge" :class="'role-' + user.role.toLowerCase()">{{ user.role }}</span></td>
              <td>{{ user.email }}</td>
              <td><span class="status-badge" :class="user.status === 'enabled' ? 'status-enabled' : 'status-disabled'">{{ user.status === 'enabled' ? '启用' : '停用' }}</span></td>
              <td>
                <a-space>
                  <a-button size="small" @click="editUser(user)">编辑</a-button>
                  <a-button size="small" @click="toggleStatus(user)">{{ user.status === 'enabled' ? '停用' : '启用' }}</a-button>
                </a-space>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="empty-cell">暂无数据</td>
            </tr>
          </tbody>
        </table>
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
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const keyword = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editingUser = ref(null)

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

const users = ref([
  { id: 1, account: 'zhangwei', name: '张伟', email: 'wei.zhang@sandvik.com', role: '销售', region: '华东大区', status: 'enabled' },
  { id: 2, account: 'wangqiang', name: '王强', email: 'qiang.wang@sandvik.com', role: '销售', region: '西南大区', status: 'enabled' },
  { id: 3, account: 'sunlei', name: '孙磊', email: 'lei.sun@sandvik.com', role: '区域总监', region: '华北东北大区', status: 'enabled' },
  { id: 4, account: 'wuhao', name: '吴昊', email: 'hao.wu@sandvik.com', role: '区域总监', region: '华南大区', status: 'enabled' },
  { id: 5, account: 'lina', name: '李娜', email: 'na.li@sandvik.com', role: '财务', region: '', status: 'enabled' },
  { id: 6, account: 'zhouting', name: '周婷', email: 'ting.zhou@sandvik.com', role: '财务', region: '', status: 'enabled' },
  { id: 7, account: 'chenming', name: '陈明', email: 'ming.chen@sandvik.com', role: '管理员', region: '', status: 'enabled' },
  { id: 8, account: 'zhaoli', name: '赵丽', email: 'li.zhao@sandvik.com', role: '销售', region: '华东大区', status: 'disabled' }
])

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

const handleRefresh = () => {
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

const toggleStatus = (user) => {
  user.status = user.status === 'enabled' ? 'disabled' : 'enabled'
  message.success('状态已更新')
}

const saveUser = () => {
  if (!formData.name || !formData.account || !formData.email || !formData.role) {
    message.error('请填写必填项')
    return
  }
  if (editingUser.value) {
    const idx = users.value.findIndex(x => x.id === editingUser.value.id)
    if (idx >= 0) Object.assign(users.value[idx], { name: formData.name, account: formData.account, email: formData.email, role: formData.role, region: formData.region, status: formData.status })
    message.success('用户已更新')
  } else {
    users.value.push({ id: Date.now(), ...formData })
    message.success('用户已添加')
  }
  showModal.value = false
}
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
