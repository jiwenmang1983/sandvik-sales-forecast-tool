<template>
  <div class="page-container">
    <a-card :bordered="false" class="filter-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <a-input v-model:value="keyword" placeholder="搜索客户名称/编码..." allow-clear style="width:260px" @pressEnter="fetchCustomers" />
        </div>
        <div class="toolbar-right">
          <a-button type="primary" @click="openAddDialog">➕ 添加客户</a-button>
        </div>
      </div>
    </a-card>

    <a-card :bordered="false" class="table-card">
      <a-table
        :columns="columns"
        :data-source="customers"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'customerCode'">
            <span class="code-cell">{{ record.customerCode }}</span>
          </template>
          <template v-if="column.key === 'customerName'">
            <span class="name-cell">{{ record.customerName }}</span>
          </template>
          <template v-if="column.key === 'region'">
            <a-tag color="blue">{{ record.region }}</a-tag>
          </template>
          <template v-if="column.key === 'brand'">
            <a-tag :color="record.brand === 'Sandvik' ? 'blue' : 'green'">{{ record.brand || '-' }}</a-tag>
          </template>
          <template v-if="column.key === 'isActive'">
            <span class="status-badge" :class="record.isActive ? 'status-active' : 'status-inactive'">
              {{ record.isActive ? '激活' : '停用' }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a-space class="table-actions">
              <a-button size="small" @click="editCustomer(record)">编辑</a-button>
              <a-popconfirm title="确定要删除该客户吗？" @confirm="deleteCustomer(record)">
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
      :title="editingId ? '编辑客户' : '新增客户'"
      width="560px"
      @ok="saveCustomer"
      @cancel="showModal = false"
      :confirm-loading="saving"
    >
      <a-form layout="vertical" class="dialog-form">
        <a-form-item label="客户编码" required>
          <a-input v-model:value="form.customerCode" placeholder="请输入客户编码" />
        </a-form-item>
        <a-form-item label="客户名称" required>
          <a-input v-model:value="form.customerName" placeholder="请输入客户名称" />
        </a-form-item>
        <a-form-item label="英文名称">
          <a-input v-model:value="form.customerNameEn" placeholder="请输入英文名称（可选）" />
        </a-form-item>
        <a-form-item label="销售大区" required>
          <a-select v-model:value="form.region" placeholder="请选择销售大区">
            <a-select-option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="品牌">
          <a-select v-model:value="form.brand" placeholder="请选择品牌" allow-clear>
            <a-select-option value="Sandvik">Sandvik</a-select-option>
            <a-select-option value="Seco">Seco</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="销售负责人">
          <a-input v-model:value="form.salesPersonId" placeholder="请输入销售负责人（可选）" />
        </a-form-item>
        <a-form-item label="状态">
          <a-switch v-model:checked="form.isActive" checked-children="激活" un-checked-children="停用" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const keyword = ref('')
const customers = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({
  customerCode: '',
  customerName: '',
  customerNameEn: '',
  region: undefined,
  brand: undefined,
  salesPersonId: undefined,
  isActive: true
})

const regionOptions = ['华东大区', '华南大区', '华北东北大区', '西南大区', '北部销售大区']

const columns = [
  { title: '客户编码', key: 'customerCode', dataIndex: 'customerCode', width: 140 },
  { title: '客户名称', key: 'customerName', dataIndex: 'customerName', width: 200 },
  { title: '英文名称', key: 'customerNameEn', dataIndex: 'customerNameEn', width: 180 },
  { title: '销售大区', key: 'region', dataIndex: 'region', width: 120 },
  { title: '品牌', key: 'brand', dataIndex: 'brand', width: 100 },
  { title: '销售负责人', key: 'salesPersonId', dataIndex: 'salesPersonId', width: 120 },
  { title: '状态', key: 'isActive', width: 80 },
  { title: '操作', key: 'action', width: 140, fixed: 'right' }
]

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const fetchCustomers = async () => {
  try {
    loading.value = true
    const params = new URLSearchParams()
    params.append('status', 'active')
    if (keyword.value) params.append('keyword', keyword.value)

    const res = await fetch(`/api/customers?${params.toString()}`, {
      headers: { ...getAuthHeader() }
    })
    const data = await res.json()
    if (data.data) {
      customers.value = data.data
    }
  } catch (e) {
    message.error('获取客户数据失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  editingId.value = null
  Object.assign(form, {
    customerCode: '',
    customerName: '',
    customerNameEn: '',
    region: undefined,
    brand: undefined,
    salesPersonId: undefined,
    isActive: true
  })
  showModal.value = true
}

const editCustomer = (record) => {
  editingId.value = record.id
  Object.assign(form, {
    customerCode: record.customerCode,
    customerName: record.customerName,
    customerNameEn: record.customerNameEn || '',
    region: record.region,
    brand: record.brand,
    salesPersonId: record.salesPersonId,
    isActive: record.isActive
  })
  showModal.value = true
}

const deleteCustomer = async (record) => {
  try {
    const res = await fetch(`/api/customers/${record.id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    })
    const data = await res.json()
    if (data.success || data.id) {
      message.success('删除成功')
      fetchCustomers()
    } else {
      message.error(data.message || '删除失败')
    }
  } catch (e) {
    message.error('删除失败')
  }
}

const saveCustomer = async () => {
  if (!form.customerCode || !form.customerName || !form.region) {
    message.error('请填写必填项（客户编码、客户名称、销售大区）')
    return
  }
  try {
    saving.value = true
    const body = {
      customerCode: form.customerCode,
      customerName: form.customerName,
      customerNameEn: form.customerNameEn || undefined,
      region: form.region,
      brand: form.brand || undefined,
      salesPersonId: form.salesPersonId || undefined,
      isActive: form.isActive
    }

    const url = editingId.value ? `/api/customers/${editingId.value}` : '/api/customers'
    const method = editingId.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(body)
    })
    const data = await res.json()

    if (data.success || data.id) {
      message.success(editingId.value ? '更新成功' : '添加成功')
      showModal.value = false
      fetchCustomers()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (e) {
    message.error('操作失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchCustomers()
})
</script>

<style scoped>
.filter-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
  margin-bottom: 12px;
}

.table-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.code-cell {
  font-family: 'Roboto Mono', monospace;
  color: #0D3D92;
  font-weight: 500;
}

.name-cell {
  font-weight: 500;
  color: #1E293B;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #D1FAE5;
  color: #059669;
}

.status-inactive {
  background: #F1F5F9;
  color: #64748B;
}
</style>
