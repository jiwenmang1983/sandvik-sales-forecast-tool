<template>
  <div class="basedata-page">
    <a-card :bordered="false" class="main-card">
      <a-tabs v-model:activeKey="activeTab">
        <!-- 产品库 Tab -->
        <a-tab-pane key="productLibrary" tab="🗃️ 产品库">
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <a-input v-model:value="keyword" placeholder="搜索产品（SKU/PA/名称）..." allow-clear style="width:260px" />
            </div>
            <div class="toolbar-right">
              <a-button @click="handleExport('productLibrary')">📥 导出</a-button>
              <a-button type="primary" @click="openAddDialog('productLibrary')">➕ 添加产品</a-button>
            </div>
          </div>
          <div class="filter-bar">
            <div class="filter-item">
              <span class="filter-label">状态</span>
              <a-select v-model:value="filterStatus" style="width:120px" placeholder="全部">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="active">激活</a-select-option>
                <a-select-option value="inactive">停用</a-select-option>
              </a-select>
            </div>
            <div class="filter-item">
              <span class="filter-label">PA产品线</span>
              <a-select v-model:value="filterPa" style="width:120px" placeholder="全部" allow-clear>
                <a-select-option value="">全部</a-select-option>
                <a-select-option v-for="pa in paList" :key="pa" :value="pa">{{ pa }}</a-select-option>
              </a-select>
            </div>
            <a-button size="small" @click="resetFilters">🔄 重置</a-button>
          </div>
          <div class="table-wrap">
            <a-table :columns="productColumns" :data-source="filteredProducts" :loading="loading" row-key="id" :pagination="{pageSize: 20}">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'sku'">
                  <span class="sku-cell">{{ record.sku }}</span>
                </template>
                <template v-if="column.key === 'status'">
                  <span class="status-badge" :class="record.status === 'active' ? 'status-active' : 'status-inactive'">{{ record.status === 'active' ? '激活' : '停用' }}</span>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button size="small" @click="editItem('productLibrary', record)">编辑</a-button>
                    <a-popconfirm title="确定要删除吗?" @confirm="deleteItem('productLibrary', record)">
                      <a-button size="small" danger>删除</a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 客户信息 Tab -->
        <a-tab-pane key="customer" tab="🏢 客户信息">
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <a-input v-model:value="keyword" placeholder="搜索客户名称/编码..." allow-clear style="width:260px" />
            </div>
            <div class="toolbar-right">
              <a-button type="primary" @click="openAddDialog('customer')">➕ 添加客户</a-button>
            </div>
          </div>
          <div class="table-wrap">
            <a-table :columns="customerColumns" :data-source="filteredCustomers" :loading="loading" row-key="id" :pagination="{pageSize: 20}">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <span class="name-cell">{{ record.name }}</span>
                </template>
                <template v-if="column.key === 'status'">
                  <span class="status-badge" :class="record.status === 'active' ? 'status-active' : 'status-inactive'">{{ record.status === 'active' ? '激活' : '停用' }}</span>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button size="small" @click="editItem('customer', record)">编辑</a-button>
                    <a-popconfirm title="确定要删除吗?" @confirm="deleteItem('customer', record)">
                      <a-button size="small" danger>删除</a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 销售区域 Tab -->
        <a-tab-pane key="regionMapping" tab="🗺️ 销售区域">
          <div class="tab-toolbar">
            <div class="toolbar-right">
              <a-button type="primary" @click="openAddDialog('regionMapping')">➕ 添加区域</a-button>
            </div>
          </div>
          <div class="table-wrap">
            <a-table :columns="regionColumns" :data-source="filteredRegions" :loading="loading" row-key="id" :pagination="{pageSize: 20}">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'region'">
                  <span class="name-cell">{{ record.region }}</span>
                </template>
                <template v-if="column.key === 'invoices'">
                  {{ (record.invoices || []).join('、') }}
                </template>
                <template v-if="column.key === 'status'">
                  <span class="status-badge" :class="record.status === 'active' ? 'status-active' : 'status-inactive'">{{ record.status === 'active' ? '激活' : '停用' }}</span>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button size="small" @click="editItem('regionMapping', record)">编辑</a-button>
                    <a-popconfirm title="确定要删除吗?" @confirm="deleteItem('regionMapping', record)">
                      <a-button size="small" danger>删除</a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 人员信息 Tab -->
        <a-tab-pane key="salesPerson" tab="👤 人员信息">
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <a-input v-model:value="keyword" placeholder="搜索姓名/邮箱..." allow-clear style="width:260px" />
            </div>
            <div class="toolbar-right">
              <a-button type="primary" @click="openAddDialog('salesPerson')">➕ 添加人员</a-button>
            </div>
          </div>
          <div class="table-wrap">
            <a-table :columns="salesPersonColumns" :data-source="filteredSalesPersons" :loading="loading" row-key="id" :pagination="{pageSize: 20}">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <div class="user-cell">
                    <a-avatar :size="28" :style="{ background: avatarColor(record.name) }">{{ record.name?.charAt(0) }}</a-avatar>
                    <span>{{ record.name }}</span>
                  </div>
                </template>
                <template v-if="column.key === 'status'">
                  <span class="status-badge" :class="record.status === 'active' ? 'status-active' : 'status-inactive'">{{ record.status === 'active' ? '激活' : '停用' }}</span>
                </template>
                <template v-if="column.key === 'action'">
                  <a-space>
                    <a-button size="small" @click="editItem('salesPerson', record)">编辑</a-button>
                    <a-popconfirm title="确定要删除吗?" @confirm="deleteItem('salesPerson', record)">
                      <a-button size="small" danger>删除</a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingId ? '编辑' : '新增' + modalTitle"
      width="560px"
      @ok="saveForm"
      @cancel="showModal = false"
    >
      <div class="form-row" v-if="currentModule !== 'salesPerson'">
        <div class="form-group">
          <label class="form-label">{{ modalFields[0] }}<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.name" :placeholder="modalFields[0]" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ modalFields[1] }}</label>
          <a-input v-model:value="formData.code" placeholder="编码" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'productLibrary'">
        <div class="form-group">
          <label class="form-label">PA</label>
          <a-select v-model:value="formData.pa" placeholder="选择PA">
            <a-select-option v-for="pa in paList" :key="pa" :value="pa">{{ pa }}</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">Sub PA-1</label>
          <a-input v-model:value="formData.subpa1" placeholder="Sub PA-1" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'productLibrary'">
        <div class="form-group">
          <label class="form-label">Sub PA-2</label>
          <a-input v-model:value="formData.subpa2" placeholder="Sub PA-2" />
        </div>
        <div class="form-group">
          <label class="form-label">Sub PA-3（产品名称）</label>
          <a-input v-model:value="formData.subpa3" placeholder="Sub PA-3" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'customer'">
        <div class="form-group">
          <label class="form-label">客户类型</label>
          <a-select v-model:value="formData.type" placeholder="选择类型">
            <a-select-option value="终端">终端</a-select-option>
            <a-select-option value="经销商">经销商</a-select-option>
          </a-select>
        </div>
        <div class="form-group">
          <label class="form-label">联系人</label>
          <a-input v-model:value="formData.contact" placeholder="联系人" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'customer'">
        <div class="form-group">
          <label class="form-label">电话</label>
          <a-input v-model:value="formData.phone" placeholder="电话" />
        </div>
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <a-input v-model:value="formData.email" placeholder="邮箱" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'regionMapping'">
        <div class="form-group">
          <label class="form-label">业绩归属</label>
          <a-input v-model:value="formData.performance" placeholder="业绩归属" />
        </div>
        <div class="form-group">
          <label class="form-label">区域总监</label>
          <a-input v-model:value="formData.director" placeholder="区域总监" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'salesPerson'">
        <div class="form-group">
          <label class="form-label">姓名<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.name" placeholder="姓名" />
        </div>
        <div class="form-group">
          <label class="form-label">工号</label>
          <a-input v-model:value="formData.code" placeholder="工号" />
        </div>
      </div>
      <div class="form-row" v-if="currentModule === 'salesPerson'">
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <a-input v-model:value="formData.email" placeholder="邮箱" />
        </div>
        <div class="form-group">
          <label class="form-label">所属大区</label>
          <a-select v-model:value="formData.region" placeholder="选择大区" allow-clear>
            <a-select-option v-for="r in regionList" :key="r" :value="r">{{ r }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="form-row-full">
        <div class="form-group">
          <label class="form-label">状态</label>
          <a-select v-model:value="formData.status">
            <a-select-option value="active">激活</a-select-option>
            <a-select-option value="inactive">停用</a-select-option>
          </a-select>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'

const activeTab = ref('productLibrary')
const currentModule = ref('productLibrary')
const keyword = ref('')
const filterStatus = ref('')
const filterPa = ref('')
const showModal = ref(false)
const editingId = ref(null)
const editingRecord = ref(null)
const loading = ref(false)

const formData = reactive({
  name: '', code: '', status: 'active', type: '', contact: '', phone: '', email: '',
  pa: '', subpa1: '', subpa2: '', subpa3: '', performance: '', director: '', region: '', invoices: []
})

const paList = ['刀具', '钻头', '铣刀', '量具', '夹具']
const regionList = ['华东大区', '华南大区', '华北东北大区', '西南大区']

const modalTitle = computed(() => ({
  productLibrary: '产品',
  customer: '客户',
  regionMapping: '区域',
  salesPerson: '人员'
}[currentModule.value] || ''))

const modalFields = computed(() => ({
  productLibrary: ['产品名称', 'SKU编码'],
  customer: ['客户名称', '客户编码'],
  regionMapping: ['销售大区', '区域编码'],
  salesPerson: ['姓名', '工号']
}[currentModule.value] || ['', '']))

// Table columns
const productColumns = [
  { title: 'SKU编码', key: 'sku', dataIndex: 'sku' },
  { title: 'PA', key: 'pa', dataIndex: 'pa' },
  { title: 'Sub PA-1', key: 'subpa1', dataIndex: 'subpa1' },
  { title: 'Sub PA-2', key: 'subpa2', dataIndex: 'subpa2' },
  { title: 'Sub PA-3（产品名称）', key: 'subpa3', dataIndex: 'subpa3' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

const customerColumns = [
  { title: '客户名称', key: 'name', dataIndex: 'name' },
  { title: '客户编码', key: 'code', dataIndex: 'code' },
  { title: '客户类型', key: 'type', dataIndex: 'type' },
  { title: '联系人', key: 'contact', dataIndex: 'contact' },
  { title: '电话', key: 'phone', dataIndex: 'phone' },
  { title: '邮箱', key: 'email', dataIndex: 'email' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

const regionColumns = [
  { title: '销售大区', key: 'region', dataIndex: 'region' },
  { title: '业绩归属', key: 'performance', dataIndex: 'performance' },
  { title: '对应开票公司', key: 'invoices' },
  { title: '区域总监', key: 'director', dataIndex: 'director' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

const salesPersonColumns = [
  { title: '姓名', key: 'name' },
  { title: '工号', key: 'code', dataIndex: 'code' },
  { title: '邮箱', key: 'email', dataIndex: 'email' },
  { title: '所属大区', key: 'region', dataIndex: 'region' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'action' }
]

// Data
const products = ref([])
const customers = ref([])
const regionMappings = ref([])
const salesPersons = ref([])

const filteredProducts = computed(() => {
  let list = products.value
  if (filterStatus.value) list = list.filter(x => x.status === filterStatus.value)
  if (filterPa.value) list = list.filter(x => x.pa === filterPa.value)
  if (keyword.value) list = list.filter(x => (x.sku && x.sku.includes(keyword.value)) || (x.subpa3 && x.subpa3.includes(keyword.value)))
  return list
})

const filteredCustomers = computed(() => {
  let list = customers.value
  if (filterStatus.value) list = list.filter(x => x.status === filterStatus.value)
  if (keyword.value) list = list.filter(x => (x.name && x.name.includes(keyword.value)) || (x.code && x.code.includes(keyword.value)))
  return list
})

const filteredRegions = computed(() => regionMappings.value)
const filteredSalesPersons = computed(() => salesPersons.value)

const avatarColor = (name) => {
  const colors = ['#0D3D92', '#2E6BD8', '#F5A623', '#5A8FE8', '#8DB4E8', '#52C41A']
  const idx = name ? name.charCodeAt(0) % colors.length : 0
  return colors[idx]
}

// API endpoints
const API_BASE = '/api/basedata'

// Auth header helper
const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

// Fetch functions
const fetchProducts = async () => {
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/products?status=${filterStatus.value}&pa=${filterPa.value}&keyword=${keyword.value}`, {
      headers: { ...getAuthHeader() }
    })
    const data = await res.json()
    if (data.success) products.value = data.data || []
  } catch (e) {
    message.error('获取产品数据失败')
  } finally {
    loading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/customers?status=${filterStatus.value}&keyword=${keyword.value}`, {
      headers: { ...getAuthHeader() }
    })
    const data = await res.json()
    if (data.success) customers.value = data.data || []
  } catch (e) {
    message.error('获取客户数据失败')
  } finally {
    loading.value = false
  }
}

const fetchRegions = async () => {
  try {
    loading.value = true
    const res = await fetch(`${API_BASE}/invoicecompanies`, {
      headers: { ...getAuthHeader() }
    })
    const data = await res.json()
    if (data.success) regionMappings.value = data.data || []
  } catch (e) {
    message.error('获取区域数据失败')
  } finally {
    loading.value = false
  }
}

const fetchSalesPersons = async () => {
  try {
    loading.value = true
    const res = await fetch(`/api/users?status=${filterStatus.value}&keyword=${keyword.value}`, {
      headers: { ...getAuthHeader() }
    })
    const data = await res.json()
    if (data.success) salesPersons.value = data.data || []
  } catch (e) {
    message.error('获取人员数据失败')
  } finally {
    loading.value = false
  }
}

const handleExport = (module) => {
  message.info('导出功能开发中')
}

const resetFilters = () => {
  keyword.value = ''
  filterStatus.value = ''
  filterPa.value = ''
  fetchData()
}

const openAddDialog = (module) => {
  currentModule.value = module
  editingId.value = null
  Object.keys(formData).forEach(k => { formData[k] = typeof formData[k] === 'string' ? '' : (Array.isArray(formData[k]) ? [] : formData[k]) })
  formData.status = 'active'
  showModal.value = true
}

const editItem = (module, record) => {
  currentModule.value = module
  editingId.value = record.id
  editingRecord.value = record
  Object.assign(formData, record)
  showModal.value = true
}

const deleteItem = async (module, record) => {
  try {
    let endpoint = ''
    if (module === 'productLibrary') endpoint = `${API_BASE}/products/${record.id}`
    else if (module === 'customer') endpoint = `${API_BASE}/customers/${record.id}`
    
    if (endpoint) {
      const res = await fetch(endpoint, { 
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      })
      const data = await res.json()
      if (data.success) {
        message.success('删除成功')
        fetchData()
      } else {
        message.error(data.message || '删除失败')
      }
    }
  } catch (e) {
    message.error('删除失败')
  }
}

const saveForm = async () => {
  if (!formData.name) { message.error('请填写必填项'); return }
  
  try {
    let endpoint = ''
    let method = 'POST'
    let body = {}
    
    if (currentModule.value === 'productLibrary') {
      endpoint = `${API_BASE}/products`
      if (editingId.value) {
        endpoint = `${API_BASE}/products/${editingId.value}`
        method = 'PUT'
      }
      body = { 
        code: formData.code || formData.sku, 
        name: formData.subpa3 || formData.name, 
        productLevel: 4,
        isActive: formData.status === 'active'
      }
    } else if (currentModule.value === 'customer') {
      endpoint = `${API_BASE}/customers`
      if (editingId.value) {
        endpoint = `${API_BASE}/customers/${editingId.value}`
        method = 'PUT'
      }
      body = { 
        name: formData.name, 
        code: formData.code, 
        isActive: formData.status === 'active'
      }
    }
    
    if (!endpoint) {
      message.error('不支持的模块')
      return
    }
    
    const res = await fetch(endpoint, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    
    if (data.success) {
      message.success(editingId.value ? '更新成功' : '添加成功')
      showModal.value = false
      fetchData()
    } else {
      message.error(data.message || '操作失败')
    }
  } catch (e) {
    message.error('操作失败')
  }
}

const fetchData = () => {
  if (activeTab.value === 'productLibrary') fetchProducts()
  else if (activeTab.value === 'customer') fetchCustomers()
  else if (activeTab.value === 'regionMapping') fetchRegions()
  else if (activeTab.value === 'salesPerson') fetchSalesPersons()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.basedata-page {
  padding: 0;
}

.main-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(13, 61, 146, 0.06);
}

.tab-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  background: #FAFAFA;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 12px;
}

.filter-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 600;
  text-transform: uppercase;
}

.table-wrap {
  overflow-x: auto;
}

.sku-cell {
  font-family: 'Roboto Mono', monospace;
  color: #0D3D92;
  font-weight: 500;
}

.name-cell {
  font-weight: 500;
  color: #1E293B;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active { background: #D1FAE5; color: #059669; }
.status-inactive { background: #F1F5F9; color: #64748B; }

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

.form-row-full {
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
