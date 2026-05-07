<template>
  <div class="page-container">
    <!-- Filter / Toolbar Bar -->
    <a-card :bordered="false" class="filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input v-model:value="keyword" placeholder="搜索用户姓名/邮箱..." allow-clear style="width:260px" @pressEnter="fetchPermissions" />
        </div>
        <div class="toolbar-right">
          <a-button @click="fetchPermissions">刷新</a-button>
          <a-button type="primary" @click="openAddDialog">➕ 配置权限</a-button>
        </div>
      </div>
    </a-card>

    <!-- Permissions Table -->
    <a-card :bordered="false" class="table-card">
      <a-table
        :columns="columns"
        :data-source="permissions"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'userEmail'">
            <span class="mono">{{ record.userEmail }}</span>
          </template>
          <template v-if="column.key === 'userName'">
            <div class="user-cell">
              <a-avatar :size="28" :style="{ background: avatarColor(record.userName) }">
                {{ record.userName?.charAt(0) || 'U' }}
              </a-avatar>
              <span>{{ record.userName }}</span>
            </div>
          </template>
          <template v-if="column.key === 'invoiceCompanyName'">
            <a-tag color="blue">{{ record.invoiceCompanyName }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button size="small" @click="editPermission(record)">编辑</a-button>
              <a-popconfirm title="确定要删除该权限配置吗？" @confirm="deletePermission(record)">
                <a-button size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingId ? '编辑权限配置' : '配置权限'"
      width="520px"
      @ok="savePermission"
      @cancel="showModal = false"
      :confirm-loading="saving"
    >
      <a-form layout="vertical" class="dialog-form">
        <a-form-item label="用户" required>
          <a-select
            v-model:value="form.userId"
            show-search
            filter-option="filterUserOption"
            placeholder="搜索并选择用户"
            :loading="loadingUsers"
            :disabled="!!editingId"
          >
            <a-select-option v-for="u in userOptions" :key="u.id" :value="u.id">
              <div class="user-option">
                <span>{{ u.name }}</span>
                <span class="user-option-email">{{ u.email }}</span>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="开票公司" required>
          <a-select
            v-model:value="form.invoiceCompanyIds"
            mode="multiple"
            placeholder="请选择一个或多个开票公司"
            :loading="loadingCompanies"
          >
            <a-select-option v-for="c in companyOptions" :key="c.id" :value="c.id">
              {{ c.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getUserInvoicePermissions, createUserInvoicePermission, updateUserInvoicePermission, deleteUserInvoicePermission } from '../api/userInvoicePermission'
import { getUsers } from '../api/baseData'
import request from '../api/axios'

const keyword = ref('')
const permissions = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({
  userId: null,
  invoiceCompanyIds: []
})

const userOptions = ref([])
const companyOptions = ref([])
const loadingUsers = ref(false)
const loadingCompanies = ref(false)

const columns = [
  { title: '用户邮箱', key: 'userEmail', dataIndex: 'userEmail', width: 220 },
  { title: '用户姓名', key: 'userName', width: 160 },
  { title: '开票公司', key: 'invoiceCompanyName', dataIndex: 'invoiceCompanyName' },
  { title: '操作', key: 'action', width: 140 }
]

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

const filterUserOption = (input, option) => {
  const text = option.componentOptions.children[0].text?.toLowerCase() || ''
  return text.includes(input.toLowerCase())
}

const fetchPermissions = async () => {
  try {
    loading.value = true
    const res = await getUserInvoicePermissions(keyword.value ? { keyword: keyword.value } : {})
    permissions.value = res.data || []
  } catch {
    message.error('获取权限配置失败')
  } finally {
    loading.value = false
  }
}

const fetchUserOptions = async () => {
  try {
    loadingUsers.value = true
    const res = await getUsers()
    userOptions.value = res.data || []
  } catch {
    message.error('获取用户列表失败')
  } finally {
    loadingUsers.value = false
  }
}

const fetchCompanyOptions = async () => {
  try {
    loadingCompanies.value = true
    const res = await request.get('/invoice-companies')
    if (res._mock) throw new Error('mock')
    companyOptions.value = res.data || []
  } catch {
    companyOptions.value = [
      { id: 1, name: '山特维克（中国）有限公司' },
      { id: 2, name: '山特维克矿山机械贸易有限公司' },
      { id: 3, name: '山特维克（上海）国际贸易有限公司' },
    ]
  }
}

const openAddDialog = () => {
  editingId.value = null
  Object.assign(form, { userId: null, invoiceCompanyIds: [] })
  showModal.value = true
}

const editPermission = async (record) => {
  editingId.value = record.id
  // Fetch all permissions for this user to get all company IDs
  try {
    const res = await getUserInvoicePermissions({ userId: record.userId })
    if (res.success && res.data) {
      const allCompanyIds = res.data.map(p => p.invoiceCompanyId)
      Object.assign(form, {
        userId: record.userId,
        invoiceCompanyIds: allCompanyIds
      })
    } else {
      Object.assign(form, {
        userId: record.userId,
        invoiceCompanyIds: [record.invoiceCompanyId]
      })
    }
  } catch {
    Object.assign(form, {
      userId: record.userId,
      invoiceCompanyIds: [record.invoiceCompanyId]
    })
  }
  showModal.value = true
}

const savePermission = async () => {
  if (!form.userId) {
    message.error('请选择用户')
    return
  }
  if (!form.invoiceCompanyIds || form.invoiceCompanyIds.length === 0) {
    message.error('请选择至少一个开票公司')
    return
  }
  try {
    saving.value = true
    let res
    // 始终使用批量替换 API（支持多选开票公司）
    res = await fetch(`/api/user-invoice-permissions/by-user/${form.userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ invoiceCompanyIds: form.invoiceCompanyIds })
    })
    const json = await res.json()
    if (json.success) {
      message.success('权限配置已更新')
      showModal.value = false
      fetchPermissions()
    } else {
      message.error(json.message || '操作失败')
    }
    return
  } catch {
    message.error('操作失败')
  } finally {
    saving.value = false
  }
}

const deletePermission = async (record) => {
  try {
    const res = await deleteUserInvoicePermission(record.id)
    if (res.success) {
      message.success('权限配置已删除')
      fetchPermissions()
    } else {
      message.error(res.message || '删除失败')
    }
  } catch {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchPermissions()
  fetchUserOptions()
  fetchCompanyOptions()
})
</script>

<style scoped>
.page-container {
  padding: 0;
}

.filter-card,
.table-card {
  margin-bottom: 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.mono {
  font-family: 'Roboto Mono', monospace;
  color: #64748B;
  font-size: 12px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-option {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.user-option-email {
  font-size: 11px;
  color: #94A3B8;
}

.dialog-form {
  padding-top: 8px;
}
</style>
