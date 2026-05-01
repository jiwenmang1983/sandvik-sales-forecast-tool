<template>
  <div class="users-page">
    <!-- Toolbar -->
    <a-card :bordered="false" style="margin-bottom:16px">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input v-model:value="keyword" placeholder="搜索姓名/邮箱/工号..." allow-clear style="width:260px" @input="onSearch" />
          <div class="filter-item">
            <span class="filter-label">角色</span>
            <a-select v-model:value="roleFilter" style="width:140px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="r in roleList" :key="r" :value="r">{{ r }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <a-select v-model:value="statusFilter" style="width:120px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="active">激活</a-select-option>
              <a-select-option value="disabled">停用</a-select-option>
            </a-select>
          </div>
          <a-button @click="resetFilters">🔄 重置</a-button>
        </div>
        <div class="toolbar-right">
          <a-button @click="exportData">📥 导出</a-button>
          <a-button type="primary" @click="openAddDialog">➕ 添加用户</a-button>
        </div>
      </div>
    </a-card>

    <!-- User Table -->
    <a-card :bordered="false">
      <a-table :columns="columns" :data-source="filteredUsers" :pagination="{pageSize:15}" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <div class="user-cell">
              <a-avatar :size="36" :style="{ background: avatarColor(record.name) }">
                {{ record.name?.charAt(0) || 'U' }}
              </a-avatar>
              <div class="user-info">
                <div class="user-name">{{ record.name }}</div>
                <div class="user-code">{{ record.code }}</div>
              </div>
            </div>
          </template>
          <template v-if="column.key === 'email'">{{ record.email }}</template>
          <template v-if="column.key === 'role'">
            <a-tag :color="roleColor(record.role)">{{ record.role }}</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'active' ? 'green' : 'default'">
              {{ record.status === 'active' ? '激活' : '停用' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button size="small" @click="editUser(record)">✏️</a-button>
              <a-button size="small" @click="toggleStatus(record)">
                {{ record.status === 'active' ? '⏸ 停用' : '▶ 启用' }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingUser ? '编辑用户' : '添加用户'"
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
          <label class="form-label">工号<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.code" placeholder="工号" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">邮箱<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.email" placeholder="邮箱" />
        </div>
        <div class="form-group">
          <label class="form-label">手机</label>
          <a-input v-model:value="formData.phone" placeholder="手机号" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">角色<span style="color:#ff4d4f">*</span></label>
          <a-select v-model:value="formData.role" placeholder="选择角色">
            <a-select-option v-for="r in roleList" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">所属大区</label>
          <a-select v-model:value="formData.region" placeholder="选择大区" allow-clear>
            <a-select-option v-for="r in regionList" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-select v-model:value="formData.status">
            <a-select-option value="active">激活</a-select-option>
            <a-select-option value="disabled">停用</a-select-option>
          </a-select>
        </div>
        <div class="form-group" v-if="!editingUser">
          <label class="form-label">初始密码</label>
          <a-input-password v-model:value="formData.password" placeholder="默认密码123456" />
        </div>
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
  name: '', code: '', email: '', phone: '', role: '', region: '', status: 'active', password: ''
})

const roleList = ['管理员', '区域总监', '财务', '销售']
const regionList = ['华东大区', '华南大区', '华北东北大区', '西南大区']

const columns = [
  { title: '用户', key: 'user', width: 220 },
  { title: '邮箱', key: 'email', dataIndex: 'email' },
  { title: '角色', key: 'role' },
  { title: '所属大区', key: 'region', dataIndex: 'region' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions' }
]

const users = ref([
  { id: 1, name: '张伟', code: 'EMP001', email: 'wei.zhang@sandvik.com', phone: '13800138001', role: '销售', region: '华东大区', status: 'active' },
  { id: 2, name: '王强', code: 'EMP002', email: 'qiang.wang@sandvik.com', phone: '13800138002', role: '销售', region: '西南大区', status: 'active' },
  { id: 3, name: '孙磊', code: 'EMP003', email: 'lei.sun@sandvik.com', phone: '13800138003', role: '区域总监', region: '华北东北大区', status: 'active' },
  { id: 4, name: '吴昊', code: 'EMP004', email: 'hao.wu@sandvik.com', phone: '13800138004', role: '区域总监', region: '华南大区', status: 'active' },
  { id: 5, name: '李娜', code: 'EMP005', email: 'na.li@sandvik.com', phone: '13800138005', role: '财务', region: '', status: 'active' },
  { id: 6, name: '周婷', code: 'EMP006', email: 'ting.zhou@sandvik.com', phone: '13800138006', role: '财务', region: '', status: 'active' },
  { id: 7, name: '陈明', code: 'ADM001', email: 'ming.chen@sandvik.com', phone: '13800138007', role: '管理员', region: '', status: 'active' },
  { id: 8, name: '赵丽', code: 'EMP007', email: 'li.zhao@sandvik.com', phone: '13800138008', role: '销售', region: '华东大区', status: 'disabled' }
])

const filteredUsers = computed(() => {
  let list = users.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(x => x.name.toLowerCase().includes(kw) || x.email.toLowerCase().includes(kw) || x.code.toLowerCase().includes(kw))
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

const roleColor = (r) => {
  return { '管理员': 'red', '区域总监': 'blue', '财务': 'green', '销售': 'orange' }[r] || 'default'
}

const onSearch = () => {}
const resetFilters = () => { keyword.value = ''; roleFilter.value = ''; statusFilter.value = '' }
const exportData = () => message.info('导出功能（演示）')

const openAddDialog = () => {
  editingUser.value = null
  Object.assign(formData, { name: '', code: '', email: '', phone: '', role: '', region: '', status: 'active', password: '' })
  showModal.value = true
}

const editUser = (user) => {
  editingUser.value = user
  Object.assign(formData, { ...user, password: '' })
  showModal.value = true
}

const toggleStatus = (user) => {
  user.status = user.status === 'active' ? 'disabled' : 'active'
  message.success('状态已更新')
}

const saveUser = () => {
  if (!formData.name || !formData.code || !formData.email || !formData.role) {
    message.error('请填写必填项')
    return
  }
  if (editingUser.value) {
    const idx = users.value.findIndex(x => x.id === editingUser.value.id)
    if (idx >= 0) Object.assign(users.value[idx], { ...formData })
    message.success('用户已更新')
  } else {
    users.value.push({ id: Date.now(), ...formData })
    message.success('用户已添加')
  }
  showModal.value = false
}
</script>

<style scoped>
.users-page { }
.toolbar { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
.toolbar-left { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.toolbar-right { display: flex; gap: 8px; }
.filter-item { display: flex; flex-direction: column; gap: 3px; }
.filter-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-weight: 600; font-size: 13px; color: #1F2937; }
.user-code { font-size: 11px; color: #6B7280; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 12px; font-weight: 600; color: #6B7280; }
</style>