<template>
  <div class="basedata-page">
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="productLibrary" tab="🗃️ 产品库">
        <div class="tab-toolbar">
          <a-input v-model:value="keyword" placeholder="搜索产品（SKU/PA/名称）..." allow-clear style="width:260px" @input="onSearch" />
          <a-space>
            <a-button @click="exportData">📥 导出</a-button>
            <a-button @click="importData">📤 导入</a-button>
            <a-button type="primary" @click="openAddDialog('productLibrary')">➕ 添加产品</a-button>
          </a-space>
        </div>
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <a-select v-model:value="filterStatus" style="width:120px" @change="onFilter">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="active">激活</a-select-option>
              <a-select-option value="inactive">停用</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">PA产品线</span>
            <a-select v-model:value="filterPa" style="width:120px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="pa in paList" :key="pa" :value="pa">{{ pa }}</a-select-option>
            </a-select>
          </div>
          <a-button size="small" @click="resetFilters">🔄 重置</a-button>
        </div>
        <a-table :columns="productColumns" :data-source="filteredProducts" :pagination="{pageSize:15}" row-key="id" size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'sku'"><strong>{{ record.sku }}</strong></template>
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'active' ? 'green' : 'default'">{{ record.status === 'active' ? '激活' : '停用' }}</a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button size="small" @click="editItem('productLibrary', record)">✏️</a-button>
                <a-button size="small" danger @click="deleteItem('productLibrary', record)">🗑️</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="customer" tab="🏢 客户信息">
        <div class="tab-toolbar">
          <a-input v-model:value="keyword" placeholder="搜索客户名称/编码..." allow-clear style="width:260px" @input="onSearch" />
          <a-button type="primary" @click="openAddDialog('customer')">➕ 添加客户</a-button>
        </div>
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <a-select v-model:value="filterStatus" style="width:120px" @change="onFilter">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="active">激活</a-select-option>
              <a-select-option value="inactive">停用</a-select-option>
            </a-select>
          </div>
          <a-button size="small" @click="resetFilters">🔄 重置</a-button>
        </div>
        <a-table :columns="customerColumns" :data-source="filteredCustomers" :pagination="{pageSize:15}" row-key="id" size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'"><strong>{{ record.name }}</strong></template>
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'active' ? 'green' : 'default'">{{ record.status === 'active' ? '激活' : '停用' }}</a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button size="small" @click="editItem('customer', record)">✏️</a-button>
                <a-button size="small" danger @click="deleteItem('customer', record)">🗑️</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="salesRegion" tab="🗺️ 销售区域">
        <div class="tab-toolbar">
          <a-button type="primary" @click="openAddDialog('regionMapping')">➕ 添加区域</a-button>
        </div>
        <a-table :columns="regionColumns" :data-source="filteredMappings" :pagination="{pageSize:15}" row-key="id" size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'region'"><strong>{{ record.region }}</strong></template>
            <template v-if="column.key === 'invoices'">{{ record.invoices.join('、') }}</template>
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'active' ? 'green' : 'default'">{{ record.status === 'active' ? '激活' : '停用' }}</a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button size="small" @click="editItem('regionMapping', record)">✏️</a-button>
                <a-button size="small" danger @click="deleteItem('regionMapping', record)">🗑️</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="salesPerson" tab="👤 销售人员">
        <div class="tab-toolbar">
          <a-input v-model:value="keyword" placeholder="搜索姓名/邮箱..." allow-clear style="width:260px" @input="onSearch" />
          <a-button type="primary" @click="openAddDialog('salesPerson')">➕ 添加销售</a-button>
        </div>
        <a-table :columns="salesPersonColumns" :data-source="filteredSalesPersons" :pagination="{pageSize:15}" row-key="id" size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'"><strong>{{ record.name }}</strong></template>
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 'active' ? 'green' : 'default'">{{ record.status === 'active' ? '激活' : '停用' }}</a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button size="small" @click="editItem('salesPerson', record)">✏️</a-button>
                <a-button size="small" danger @click="deleteItem('salesPerson', record)">🗑️</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>

      <a-tab-pane key="priceList" tab="💰 价格列表">
        <div class="tab-toolbar">
          <a-button type="primary" @click="openAddDialog('priceList')">➕ 添加价格</a-button>
        </div>
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">PA产品线</span>
            <a-select v-model:value="priceFilter.pa" style="width:120px" allow-clear>
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="pa in paList" :key="pa" :value="pa">{{ pa }}</a-select-option>
            </a-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">生效状态</span>
            <a-select v-model:value="priceFilter.active" style="width:120px">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="active">生效中</a-select-option>
              <a-select-option value="future">待生效</a-select-option>
              <a-select-option value="expired">已失效</a-select-option>
            </a-select>
          </div>
        </div>
        <a-table :columns="priceColumns" :data-source="filteredPrices" :pagination="{pageSize:15}" row-key="id" size="small">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'product'"><strong>{{ record.product }}</strong></template>
            <template v-if="column.key === 'price'">¥{{ record.price?.toLocaleString() }}</template>
            <template v-if="column.key === 'status'">
              <a-tag :color="priceStatusClass(record)">{{ priceStatusLabel(record) }}</a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button size="small" @click="editItem('priceList', record)">✏️</a-button>
                <a-button size="small" danger @click="deleteItem('priceList', record)">🗑️</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="showModal"
      :title="editingId ? '编辑' : '新增' + modalTitle"
      width="560px"
      @ok="saveForm"
      @cancel="showModal = false"
    >
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">{{ modalFields[0] }}<span style="color:#ff4d4f">*</span></label>
          <a-input v-model:value="formData.name" :placeholder="modalFields[0]" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ modalFields[1] }}</label>
          <a-input v-model:value="formData.code" placeholder="编码" />
        </div>
      </div>
      <template v-if="currentModule === 'productLibrary'">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">PA</label>
            <a-input v-model:value="formData.pa" placeholder="PA产品线" />
          </div>
          <div class="form-group">
            <label class="form-label">Sub PA-1</label>
            <a-input v-model:value="formData.subpa1" placeholder="Sub PA-1" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Sub PA-2</label>
            <a-input v-model:value="formData.subpa2" placeholder="Sub PA-2" />
          </div>
          <div class="form-group">
            <label class="form-label">Sub PA-3</label>
            <a-input v-model:value="formData.subpa3" placeholder="Sub PA-3" />
          </div>
        </div>
      </template>
      <template v-if="currentModule === 'customer'">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">客户类型</label>
            <a-select v-model:value="formData.type">
              <a-select-option value="终端">终端</a-select-option>
              <a-select-option value="经销商">经销商</a-select-option>
            </a-select>
          </div>
          <div class="form-group">
            <label class="form-label">联系人</label>
            <a-input v-model:value="formData.contact" placeholder="联系人" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">电话</label>
            <a-input v-model:value="formData.phone" placeholder="电话" />
          </div>
          <div class="form-group">
            <label class="form-label">邮箱</label>
            <a-input v-model:value="formData.email" placeholder="邮箱" />
          </div>
        </div>
      </template>
      <template v-if="currentModule === 'regionMapping'">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">业绩归属</label>
            <a-input v-model:value="formData.performance" placeholder="业绩归属" />
          </div>
          <div class="form-group">
            <label class="form-label">区域总监</label>
            <a-input v-model:value="formData.director" placeholder="区域总监" />
          </div>
        </div>
      </template>
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
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const activeTab = ref('productLibrary')
const currentModule = ref('productLibrary')
const keyword = ref('')
const filterStatus = ref('')
const filterPa = ref('')
const showModal = ref(false)
const editingId = ref(null)
const editingRecord = ref(null)

const priceFilter = reactive({ pa: '', active: '' })

const formData = reactive({
  name: '', code: '', status: 'active', type: '', contact: '', phone: '', email: '',
  pa: '', subpa1: '', subpa2: '', subpa3: '', subpa4: '', performance: '', director: '',
  product: '', price: 0, invoice: '', customer: '', startDate: '', endDate: ''
})

const paList = ['刀具', '钻头', '铣刀', '量具', '夹具']

const modalTitle = computed(() => ({
  productLibrary: '产品',
  customer: '客户',
  regionMapping: '区域',
  salesPerson: '销售',
  priceList: '价格'
}[currentModule.value] || ''))

const modalFields = computed(() => ({
  productLibrary: ['产品名称（Sub PA-3）', 'SKU编码'],
  customer: ['客户名称', '客户编码'],
  regionMapping: ['销售大区', '区域编码'],
  salesPerson: ['姓名', '工号'],
  priceList: ['产品', '价格']
}[currentModule.value] || ['', '']))

// Columns
const productColumns = [
  { title: 'SKU', key: 'sku', dataIndex: 'sku' },
  { title: 'PA', key: 'pa', dataIndex: 'pa' },
  { title: 'Sub PA-1', key: 'subpa1', dataIndex: 'subpa1' },
  { title: 'Sub PA-2', key: 'subpa2', dataIndex: 'subpa2' },
  { title: 'Sub PA-3（产品名称）', key: 'subpa3', dataIndex: 'subpa3' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions' }
]

const customerColumns = [
  { title: '客户名称', key: 'name', dataIndex: 'name' },
  { title: '客户编码', key: 'code', dataIndex: 'code' },
  { title: '客户类型', key: 'type', dataIndex: 'type' },
  { title: '联系人', key: 'contact', dataIndex: 'contact' },
  { title: '电话', key: 'phone', dataIndex: 'phone' },
  { title: '邮箱', key: 'email', dataIndex: 'email' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions' }
]

const regionColumns = [
  { title: '销售大区', key: 'region', dataIndex: 'region' },
  { title: '业绩归属', key: 'performance', dataIndex: 'performance' },
  { title: '对应开票公司', key: 'invoices' },
  { title: '区域总监', key: 'director', dataIndex: 'director' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions' }
]

const salesPersonColumns = [
  { title: '姓名', key: 'name', dataIndex: 'name' },
  { title: '工号', key: 'code', dataIndex: 'code' },
  { title: '邮箱', key: 'email', dataIndex: 'email' },
  { title: '所属大区', key: 'region', dataIndex: 'region' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions' }
]

const priceColumns = [
  { title: '产品名称', key: 'product', dataIndex: 'product' },
  { title: 'PA', key: 'pa', dataIndex: 'pa' },
  { title: 'Sub PA', key: 'subpa', dataIndex: 'subpa' },
  { title: '开票公司', key: 'invoice', dataIndex: 'invoice' },
  { title: '客户', key: 'customer', dataIndex: 'customer' },
  { title: '单价', key: 'price' },
  { title: '生效日期', key: 'startDate', dataIndex: 'startDate' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions' }
]

// Data
const products = ref([
  { id: 'p1', sku: 'SKU-001', pa: '刀具', subpa1: '标准刀具', subpa2: '2刃', subpa3: '整体硬质合金钻头3xD', status: 'active' },
  { id: 'p2', sku: 'SKU-002', pa: '钻头', subpa1: '普通钻头', subpa2: '3刃', subpa3: '高性能钻头', status: 'active' },
  { id: 'p3', sku: 'SKU-003', pa: '铣刀', subpa1: '非标刀具', subpa2: '4刃', subpa3: '立铣刀', status: 'active' },
  { id: 'p4', sku: 'SKU-004', pa: '量具', subpa1: '标准刀具', subpa2: '2刃', subpa3: '卡尺', status: 'inactive' }
])

const customers = ref([
  { id: 'c1', name: '苏州精密工具', code: 'C001', type: '终端', contact: '李明', phone: '0512-12345678', email: 'liming@suzhou-tools.com', status: 'active' },
  { id: 'c2', name: '昆山智造装备', code: 'C002', type: '终端', contact: '王强', phone: '0512-87654321', email: 'wangqiang@kunshan.com', status: 'active' },
  { id: 'c3', name: '上海刃具有限公司', code: 'C003', type: '经销商', contact: '张伟', phone: '021-12345678', email: 'zhangwei@shanghai-cut.com', status: 'active' }
])

const regionMappings = ref([
  { id: 'rm1', region: '华东大区', performance: '精密工具事业部', invoices: ['山特维克商贸(上海)', '阿诺精密切削工具(成都)'], director: '张伟', status: 'active' },
  { id: 'rm2', region: '华南大区', performance: '刀具事业部', invoices: ['廊坊舍弗勒'], director: '吴昊', status: 'active' },
  { id: 'rm3', region: '华北东北大区', performance: '工业仪器事业部', invoices: ['武汉阿诺精密'], director: '孙磊', status: 'active' },
  { id: 'rm4', region: '西南大区', performance: '精密工具事业部', invoices: ['山特维克商贸(上海)'], director: '王强', status: 'active' }
])

const salesPersons = ref([
  { id: 'sp1', name: '张伟', code: 'EMP001', email: 'wei.zhang@sandvik.com', region: '华东大区', status: 'active' },
  { id: 'sp2', name: '王强', code: 'EMP002', email: 'qiang.wang@sandvik.com', region: '西南大区', status: 'active' },
  { id: 'sp3', name: '孙磊', code: 'EMP003', email: 'lei.sun@sandvik.com', region: '华北东北大区', status: 'active' },
  { id: 'sp4', name: '吴昊', code: 'EMP004', email: 'hao.wu@sandvik.com', region: '华南大区', status: 'active' }
])

const prices = ref([
  { id: 'pr1', product: '整体硬质合金钻头3xD', pa: '刀具', subpa: '标准刀具', invoice: '山特维克商贸(上海)', customer: '苏州精密工具', price: 1250, startDate: '2026-01-01', endDate: '2026-12-31', active: 'active' },
  { id: 'pr2', product: '高性能钻头', pa: '钻头', subpa: '普通钻头', invoice: '阿诺精密切削工具(成都)', customer: '昆山智造装备', price: 890, startDate: '2026-04-01', endDate: '2026-12-31', active: 'future' },
  { id: 'pr3', product: '立铣刀', pa: '铣刀', subpa: '非标刀具', invoice: '廊坊舍弗勒', customer: '上海刃具', price: 2100, startDate: '2025-01-01', endDate: '2025-12-31', active: 'expired' }
])

const filteredProducts = computed(() => {
  let list = products.value
  if (filterStatus.value) list = list.filter(x => x.status === filterStatus.value)
  if (filterPa.value) list = list.filter(x => x.pa === filterPa.value)
  if (keyword.value) list = list.filter(x => x.sku.includes(keyword.value) || x.subpa3.includes(keyword.value))
  return list
})

const filteredCustomers = computed(() => {
  let list = customers.value
  if (filterStatus.value) list = list.filter(x => x.status === filterStatus.value)
  if (keyword.value) list = list.filter(x => x.name.includes(keyword.value) || x.code.includes(keyword.value))
  return list
})

const filteredMappings = computed(() => regionMappings.value)
const filteredSalesPersons = computed(() => salesPersons.value)

const filteredPrices = computed(() => {
  let list = prices.value
  if (priceFilter.pa) list = list.filter(x => x.pa === priceFilter.pa)
  return list
})

const priceStatusClass = (r) => {
  if (r.active === 'active') return 'green'
  if (r.active === 'future') return 'orange'
  return 'default'
}
const priceStatusLabel = (r) => {
  if (r.active === 'active') return '生效中'
  if (r.active === 'future') return '待生效'
  return '已失效'
}

const onSearch = () => {}
const onFilter = () => {}
const resetFilters = () => { keyword.value = ''; filterStatus.value = ''; filterPa.value = '' }
const exportData = () => message.info('导出功能（演示）')
const importData = () => message.info('导入功能（演示）')

const openAddDialog = (module) => {
  currentModule.value = module
  editingId.value = null
  Object.keys(formData).forEach(k => { formData[k] = typeof formData[k] === 'string' ? '' : formData[k] })
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

const deleteItem = (module, record) => {
  const lists = { productLibrary: products, customer: customers, regionMapping: regionMappings, salesPerson: salesPersons, priceList: prices }
  const idx = lists[module].value.findIndex(x => x.id === record.id)
  if (idx >= 0) lists[module].value.splice(idx, 1)
  message.success('已删除')
}

const saveForm = () => {
  if (!formData.name) { message.error('请填写必填项'); return }
  if (editingId.value) {
    const lists = { productLibrary: products, customer: customers, regionMapping: regionMappings, salesPerson: salesPersons, priceList: prices }
    const idx = lists[currentModule.value].value.findIndex(x => x.id === editingId.value)
    if (idx >= 0) Object.assign(lists[currentModule.value].value[idx], { ...formData })
    message.success('更新成功')
  } else {
    const lists = { productLibrary: products, customer: customers, regionMapping: regionMappings, salesPerson: salesPersons, priceList: prices }
    lists[currentModule.value].value.push({ id: 'id_' + Date.now(), ...formData })
    message.success('添加成功')
  }
  showModal.value = false
}
</script>

<style scoped>
.basedata-page { }
.tab-toolbar { display: flex; gap: 8px; align-items: center; justify-content: space-between; padding: 12px 0 0; }
.filter-bar { display: flex; gap: 10px; padding: 12px 0; background: #fafafa; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 3px; }
.filter-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.form-row-full { margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-size: 12px; font-weight: 600; color: #6B7280; }
</style>
